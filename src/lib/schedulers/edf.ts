import type { Task, Schedule, ScheduleResult } from "$lib/types";

export default function EarliestDeadlineFirst(tasks: Task[], hyperperiod: number): ScheduleResult {
    
    const schedule: Schedule = [];

    const pending = new Map<string, number>();
    const deadlines = new Map<string, number>();
    const arrivalTimes = new Map<string, number>();

    tasks.forEach((task) => {
        pending.set(task.id, 0);
        arrivalTimes.set(task.id, task.releaseTime ?? 0);
        const firstDeadline = task.deadline ?? task.period;
        if (firstDeadline !== undefined) {
            deadlines.set(task.id, firstDeadline);
        }
    });

    let isSchedulable = true;

    for (let time = 0; time < hyperperiod; time++) {
        tasks.forEach((task) => {
            // Aperiodic tasks release once at their releaseTime
            if (task.isAperiodic) {
                if (time === task.releaseTime) {
                    // If task has remaining time when released, it's not schedulable
                    if ((pending.get(task.id) ?? 0) > 0) {
                        isSchedulable = false;
                    }
                    pending.set(task.id, (pending.get(task.id) ?? 0) + task.executionTime);
                    arrivalTimes.set(task.id, time);
                    if (task.deadline !== undefined) {
                        deadlines.set(task.id, task.deadline);
                    }
                }
                return;
            }

            // Periodic tasks: period is required for release logic
            if (task.period === undefined) return;

            if (time % task.period === 0) {
                // If task has remaining time when released again, it's not schedulable
                if ((pending.get(task.id) ?? 0) > 0) {
                    isSchedulable = false;
                }
                pending.set(task.id, (pending.get(task.id) ?? 0) + task.executionTime);
                arrivalTimes.set(task.id, time);
                if (time > 0) {
                    const nextDeadline = task.deadline ?? task.period;
                    deadlines.set(task.id, time + nextDeadline);
                }
            }
        });

        // Exit loop if not schedulable
        if (!isSchedulable) {
            break;
        }

        let selectedTask: Task | null = null;
        let earliestDeadline = Infinity;
        let earliestArrival = Infinity;

        for (const task of tasks) {
            const pendingExec = pending.get(task.id) ?? 0;
            const deadline = deadlines.get(task.id) ?? Infinity;
            const arrival = arrivalTimes.get(task.id) ?? 0;

            if (pendingExec > 0) {
                const winsDeadline = deadline < earliestDeadline;
                const tiesDeadline = deadline === earliestDeadline;
                const winsArrival = arrival < earliestArrival;

                // EDF first, FCFS tiebreak, array order as final tiebreak
                if (winsDeadline || (tiesDeadline && winsArrival)) {
                    selectedTask = task;
                    earliestDeadline = deadline;
                    earliestArrival = arrival;
                }
            }
        }

        if (selectedTask) {
            schedule.push({ time, taskId: selectedTask.id });
            pending.set(selectedTask.id, (pending.get(selectedTask.id) ?? 0) - 1);
        } else {
            schedule.push({ time, taskId: null });
        }
    }

    // Check for any releases at the hyperperiod boundary
    if (isSchedulable) {
        tasks.forEach((task) => {
            // Aperiodic tasks release once at their releaseTime
            if (task.isAperiodic) {
                if (hyperperiod === task.releaseTime) {
                    // If task has remaining time when released, it's not schedulable
                    if ((pending.get(task.id) ?? 0) > 0) {
                        isSchedulable = false;
                    }
                }
                return;
            }

            // Periodic tasks: period is required for release logic
            if (task.period === undefined) return;

            if (hyperperiod % task.period === 0) {
                // If task has remaining time when released again, it's not schedulable
                if ((pending.get(task.id) ?? 0) > 0) {
                    isSchedulable = false;
                }
            }
        });
    }

    // Fill remaining schedule with empty slots if loop was broken early
    for (let time = schedule.length; time < hyperperiod; time++) {
        schedule.push({ time, taskId: null });
    }

    return {
        schedule,
        isSchedulable
    };
}