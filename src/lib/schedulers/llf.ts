import type { Task, Schedule, ScheduleResult } from "$lib/types";

// create a local task type so optional release time and deadline can be used safely
type LlfTask = Task & {
    releaseTime?: number;
    deadline?: number;
    isAperiodic?: boolean;
};

// create a type for each released job instance
type Job = {
    taskId: string;
    releaseTime: number;
    absoluteDeadline: number;
    remainingExecution: number;
    taskOrder: number;
};

export default function LeastLaxityFirst(tasks: Task[], hyperperiod: number): ScheduleResult {

    const schedule: Schedule = [];

    const llfTasks = tasks as LlfTask[]; // cast the tasks so optional release time and deadline fields can be accessed

    const activeJobs: Job[] = []; // store all active released jobs here

    const releasedTasks = new Set<string>(); // track which aperiodic tasks have already been released

    let deadlineMissed = false; // flag to track if any deadline is missed

    let missedTaskId: string | null = null; // store the ID of the task that missed its deadline

    let missedAtTime: number | null = null; // store the time at which the deadline was missed

    let currentTaskId: string | null = null; // store the currently running task for tie-breaking

    // Main loop to generate the schedule (logic to be implemented)
    for (let time = 0; time < hyperperiod; time++) {
        // Modify schedule to include the task that should be executed at time time based on scheduling

        // release new jobs for any task that arrives at the current time
        llfTasks.forEach((task, index) => {
            const releaseOffset = task.releaseTime ?? 0; // use 0 if the task does not define a release time

            const isAperiodicTask = task.isAperiodic === true || task.period === undefined; // treat the task as aperiodic if explicitly marked or if it has no period

            // handle aperiodic tasks by releasing them only once
            if (isAperiodicTask) {
                const absoluteDeadline = task.deadline; // use deadline as an absolute deadline for aperiodic tasks

                if (absoluteDeadline === undefined) {
                    throw new Error(`Task ${task.id} must have a deadline for LLF scheduling`);
                }

                // release a new job if this aperiodic task arrives now
                if (time === releaseOffset && !releasedTasks.has(task.id)) {
                    // add released job to active jobs list
                    activeJobs.push({
                        taskId: task.id,
                        releaseTime: time,
                        absoluteDeadline,
                        remainingExecution: task.executionTime,
                        taskOrder: index, // store the original order of the task for tie-breaking
                    });

                    releasedTasks.add(task.id);
                }
            }

            // handle periodic tasks by releasing a new job every period
            else {
                const period = task.period; // get the task period

                const relativeDeadline = task.deadline ?? task.period; // use deadline if given, otherwise use period

                if (period === undefined) {
                    throw new Error(`Task ${task.id} must have a period for LLF scheduling`);
                }

                if (relativeDeadline === undefined) {
                    throw new Error(`Task ${task.id} must have a deadline or period for LLF scheduling`);
                }

                // release a new job if this periodic task arrives now
                if (time >= releaseOffset && (time - releaseOffset) % period === 0) {
                    // add released job to active jobs list
                    activeJobs.push({
                        taskId: task.id,
                        releaseTime: time,
                        absoluteDeadline: time + relativeDeadline,
                        remainingExecution: task.executionTime,
                        taskOrder: index, // store the original order of the task for tie-breaking
                    });
                }
            }
        });

        // check whether any active unfinished job has already missed its deadline 
        for (const job of activeJobs) {
            // a miss happens if the current time has reached or passed the deadline and the job is still unfinished
            if (job.remainingExecution > 0 && time >= job.absoluteDeadline) {
                // store the first missed deadline only once
                if (!deadlineMissed) {
                    deadlineMissed = true;
                    missedTaskId = job.taskId;
                    missedAtTime = time;
                }
            }
        }

        let selectedJob: Job | null = null; // start with no selected job for this time slot

        let minLaxity = Infinity; // start with infinity so any real laxity value will be smaller

        // search for the ready job with the smallest laxity to execute at this time slot
        for (const job of activeJobs) {
            // skip finished jobs
            if (job.remainingExecution <= 0) {
                continue;
            }

            const laxity = job.absoluteDeadline - time - job.remainingExecution; // calculate laxity for this job

            // select this job if it has smaller laxity than the current minimum
            if (laxity < minLaxity) {
                selectedJob = job;
                minLaxity = laxity;
            }

            // tie-breaking: if laxity is the same, select the job of the task that appears earlier in the input list
            else if (laxity === minLaxity && selectedJob !== null) {
                // prefer keeping the currently running task if it is tied
                if (job.taskId === currentTaskId && selectedJob.taskId !== currentTaskId) {
                    selectedJob = job;
                }

                // if neither or both are the current task, prefer the earlier absolute deadline 
                else if (
                    (job.taskId === currentTaskId && selectedJob.taskId === currentTaskId) ||
                    (job.taskId !== currentTaskId && selectedJob.taskId !== currentTaskId)
                ) {
                    if (job.absoluteDeadline < selectedJob.absoluteDeadline) {
                        selectedJob = job;
                    }

                    // if deadlines match, prefer the task that appears earlier in the input list
                    else if (job.absoluteDeadline === selectedJob.absoluteDeadline && job.releaseTime < selectedJob.releaseTime) {
                        selectedJob = job;
                    }

                    // if it is still tied, prefer the task that appeared earlier in the task input list
                    else if (job.absoluteDeadline === selectedJob.absoluteDeadline && job.releaseTime === selectedJob.releaseTime && job.taskOrder < selectedJob.taskOrder) {
                        selectedJob = job;
                    }
                }
            }
        }

        // run the selected job if one exists
        if (selectedJob) {
            //record that this task runs at the current time
            schedule.push({
                time,
                taskId: selectedJob.taskId,
            });

            // reduce the remaining execution time of the selected job by 1 unit
            selectedJob.remainingExecution--;

            // store the currently running task for the next tie-break
            currentTaskId = selectedJob.taskId;

        } else {
            // record idle cpu time if no job is selected to run
            schedule.push({
                time,
                taskId: null,
            });

            // clear the current task if the cpu is idle
            currentTaskId = null;
        }

        // remove finished jobs from the active jobs list to keep it clean
        for (let i = activeJobs.length - 1; i >= 0; i--) {
            // remove a job once its remaining execution time reaches 0 or below
            if (activeJobs[i].remainingExecution <= 0) {
                activeJobs.splice(i, 1);
            }
        }
    }

    return {
        schedule,
        isSchedulable: !deadlineMissed
    };
}