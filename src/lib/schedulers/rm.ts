import type { Task, Schedule } from "$lib/types";

export default function RateMonotonic(tasks: Task[], hyperperiod: number): Schedule {
	
    const schedule: Schedule = [];

	// Filter to only periodic tasks (exclude aperiodic tasks)
	const periodicTasks = tasks.filter((task) => !task.isAperiodic && task.period);

	// Track pending execution time for each task instance
	const pending = new Map<string, number>();
	periodicTasks.forEach((task) => {
		pending.set(task.id, 0);
	});

	for (let time = 0; time < hyperperiod; time++) {
		// Release new instances of tasks at their release times and period boundaries
		periodicTasks.forEach((task) => {
			// Check if this is a release time for the task
			// First instance: releaseTime
			// Subsequent instances: releaseTime + k*period
			const isReleaseTime = time === task.releaseTime || 
				(time > task.releaseTime && (time - task.releaseTime) % task.period! === 0);
			
			if (isReleaseTime) {
				pending.set(task.id, (pending.get(task.id) ?? 0) + task.executionTime);
			}
		});

		let selectedTask: Task | null = null;
		let minPeriod = Infinity;

        // Find highest priority task with pending execution
		for (const task of periodicTasks) {
			const pendingExec = pending.get(task.id) ?? 0;
			if (pendingExec > 0 && task.period! < minPeriod) {
				selectedTask = task;
				minPeriod = task.period!;
			}
		}

		if (selectedTask) {
			schedule.push({
				time,
				taskId: selectedTask.id,
			});

            // Decrement pending execution time for the selected task
			pending.set(selectedTask.id, (pending.get(selectedTask.id) ?? 0) - 1);
		} else {
			schedule.push({
				time,
				taskId: null,
			});
		}
	}

	return schedule;
}
