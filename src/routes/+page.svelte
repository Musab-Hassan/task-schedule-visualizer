<script lang="ts">
	import TaskManager from '$lib/components/TaskManager.svelte';
	import ScheduleTimeline from '$lib/components/ScheduleTimeline.svelte';
	import type { Task, Schedule, SchedulingAlgorithm } from '$lib/types';
	import { algorithmList, assignColorsToTasks, calculateHyperperiod } from '$lib/utils';
    
    import EarliestDeadlineFirst from '$lib/schedulers/edf';
    import RateMonotonic from '$lib/schedulers/rm';
    import LeastLaxityFirst from '$lib/schedulers/llf';

	let tasks: Task[] = $state([]);
	let selectedAlgorithm: SchedulingAlgorithm = $state(algorithmList[0]);
	let colorMap: Map<string, string> = $state(new Map());

    const hyperperiod = $derived(calculateHyperperiod(tasks));

	// Compute schedule reactively based on tasks and algorithm
	const schedule = $derived.by(() => {
		if (tasks.length === 0 || hyperperiod === 0) {
			return [];
		}

        let result: Schedule = [];
        switch (selectedAlgorithm.id) {
            case 'edf':
                result = EarliestDeadlineFirst(tasks, hyperperiod);
                break;
            case 'rm':
                result = RateMonotonic(tasks, hyperperiod);
                break;
            case 'llf':
                result = LeastLaxityFirst(tasks, hyperperiod);
                break;
        }

        return result;
	});

	// Update colours when tasks change
	$effect(() => {
		if (tasks.length > 0) {
			colorMap = assignColorsToTasks(tasks);
		}
	});

	function handleTasksChange(updatedTasks: Task[]) {
		tasks = updatedTasks;
	}

	function handleAlgorithmChange(algorithm: SchedulingAlgorithm) {
		selectedAlgorithm = algorithm;
	}
</script>


<TaskManager
    {tasks} 
    {selectedAlgorithm} 
    onTasksChange={handleTasksChange} 
    onAlgorithmChange={handleAlgorithmChange} 
/>

<main class="ml-25 p-6 md:p-8 transition-all duration-300 mt-8">
	<div class="w-full">
		<div class="mb-8 px-4">
			<h1 class="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">Schedule Visualizer</h1>
			<p class="text-slate-600 dark:text-slate-400">
				Visualize task scheduling using {selectedAlgorithm.name} algorithm
			</p>
		</div>

		<div class="px-4">
			<ScheduleTimeline 
	            {schedule}
	            {tasks}
	            {hyperperiod}
	            {colorMap} />
		</div>
	</div>
</main>


<style>
	@import 'tailwindcss';

	:global(body) {
		@apply bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50;
	}
</style>