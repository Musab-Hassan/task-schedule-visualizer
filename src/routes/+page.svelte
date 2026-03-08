<script lang="ts">
	import TaskManager from '$lib/components/TaskManager.svelte';
	import ScheduleTimeline from '$lib/components/ScheduleTimeline.svelte';
	import type { Task, Schedule, SchedulingAlgorithm } from '$lib/types';
	import { algorithmList, assignColorsToTasks } from '$lib/utils';

	let tasks: Task[] = $state([]);
	let schedule: Schedule = $state([]);
	let selectedAlgorithm: SchedulingAlgorithm = $state(algorithmList[0]);
	let colorMap: Map<string, string> = $state(new Map());

	// Update colours when tasks change
	$effect(() => {
		if (tasks.length > 0) {
			colorMap = assignColorsToTasks(tasks);
		}
	});

	function handleTasksChange(updatedTasks: Task[]) {
		tasks = updatedTasks;
		// TODO: Implement the schedule calculation in the algorithm modules
	}

	function handleAlgorithmChange(algorithm: SchedulingAlgorithm) {
		selectedAlgorithm = algorithm;
		// TODO: Implement the schedule calculation based on the algorithm
	}
</script>


<TaskManager 
    {tasks} 
    {selectedAlgorithm} 
    onTasksChange={handleTasksChange} 
    onAlgorithmChange={handleAlgorithmChange} 
/>

<main class="ml-25 p-6 md:p-8 transition-all duration-300">
	<div class="max-w-7xl mx-auto">
		<div class="mb-8">
			<h1 class="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">Schedule Visualizer</h1>
			<p class="text-slate-600 dark:text-slate-400">
				Visualize task scheduling using {selectedAlgorithm.name} algorithm
			</p>
		</div>

        <!-- TODO: Show schedule timeline when schedule is available -->
	</div>
</main>


<style>
	@import 'tailwindcss';

	:global(body) {
		@apply bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50;
	}
</style>