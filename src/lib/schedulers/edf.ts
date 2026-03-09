import type { Task, Schedule } from "$lib/types";

export default function EarliestDeadlineFirst(tasks: Task[], hyperperiod: number) {
    
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

    for (let time = 0; time < hyperperiod; time++) {
        tasks.forEach((task) => {
            // Aperiodic tasks release once at their releaseTime
            if (task.isAperiodic) {
                if (time === task.releaseTime) {
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
                pending.set(task.id, (pending.get(task.id) ?? 0) + task.executionTime);
                arrivalTimes.set(task.id, time);
                if (time > 0) {
                    const nextDeadline = task.deadline ?? task.period;
                    deadlines.set(task.id, time + nextDeadline);
                }
            }
        });

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

    return schedule;
}