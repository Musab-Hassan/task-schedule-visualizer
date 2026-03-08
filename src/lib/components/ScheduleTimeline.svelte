<script lang="ts">
	import type { Task, Schedule } from '$lib/types';
	import { getTaskColor } from '$lib/utils';

	let {
		schedule = [],
		tasks = [],
		hyperperiod = 1,
		colorMap = new Map(),
	}: {
		schedule?: Schedule;
		tasks?: Task[];
		hyperperiod?: number;
		colorMap?: Map<string, string>;
	} = $props();

	// Calculate metrics
	const scheduledSlots = $derived(schedule.filter((s) => s.taskId !== null).length);
	const utilization = $derived(
		schedule.length > 0 ? ((scheduledSlots / schedule.length) * 100).toFixed(2) : 0
	);

	// Get the time slot width as a percentage
	function getSlotPercentage(): number {
		return schedule.length > 0 ? 100 / schedule.length : 0;
	}

	// Generate time axis labels
	const timeLabels = $derived.by(() => {
		const labels = [];
		const step = Math.max(1, Math.floor(schedule.length / 10));
		for (let i = 0; i <= schedule.length; i += step) {
			labels.push(i);
		}
		if (!labels.includes(schedule.length)) {
			labels.push(schedule.length);
		}
		return labels;
	});
</script>

<div class="w-full space-y-6">
	<!-- Header Stats -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
		<div class="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
			<p class="text-xs text-slate-600 dark:text-slate-400">Hyperperiod</p>
			<p class="text-2xl font-bold text-slate-900 dark:text-slate-50">{hyperperiod}</p>
		</div>
		<div class="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
			<p class="text-xs text-slate-600 dark:text-slate-400">Total Time Units</p>
			<p class="text-2xl font-bold text-slate-900 dark:text-slate-50">{schedule.length}</p>
		</div>
		<div class="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
			<p class="text-xs text-slate-600 dark:text-slate-400">Scheduled</p>
			<p class="text-2xl font-bold text-slate-900 dark:text-slate-50">{scheduledSlots}</p>
		</div>
		<div class="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
			<p class="text-xs text-slate-600 dark:text-slate-400">Utilization</p>
			<p class="text-2xl font-bold text-slate-900 dark:text-slate-50">{utilization}%</p>
		</div>
	</div>

	<!-- Gantt Chart -->
	{#if schedule.length > 0}
		<div class="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-6 w-full">
			<h3 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-6">Schedule Gantt Chart</h3>

			<div>
				<!-- X-axis header with time labels -->
				<div class="flex">
					<div class="w-32 flex-shrink-0"></div>
					<div class="flex-1 relative h-8">
						{#each timeLabels as label, idx}
							<div
								class="absolute text-xs font-semibold text-slate-600 dark:text-slate-400"
								style="left: {(label / schedule.length) * 100}%; transform: translateX(-50%);"
							>
								{label}
							</div>
						{/each}
					</div>
				</div>

				<!-- Task Timeline Rows -->
			{#each tasks.toReversed() as task (task.id)}
					<div class="flex">
						<!-- Task Label (Y-axis) -->
						<div class="w-32 flex-shrink-0 flex items-center gap-2 px-2">
							<div
								class="w-4 h-4 rounded flex-shrink-0"
								style="background-color: {getTaskColor(task.id, colorMap)};"
							></div>
							<span class="font-semibold text-sm text-slate-900 dark:text-slate-50 truncate">{task.id}</span>
						</div>

						<!-- Timeline Grid -->
						<div class="flex flex-1 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 overflow-hidden">
							{#each schedule as slot (slot.time)}
								{#if slot.taskId === task.id}
									<!-- Task is executing -->
									<div
										class="border-r border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity cursor-pointer"
										style="
											width: {getSlotPercentage()}%;
											background-color: {getTaskColor(task.id, colorMap)};
										height: 65px;
										"
										title="Task {task.id} executing at t={slot.time}"
									>
									</div>
								{:else}
									<!-- Task is not executing -->
									<div
										class="border-r border-slate-200 dark:border-slate-700"
										style="
											width: {getSlotPercentage()}%;
											height: 65px;
										"
									></div>
								{/if}
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-12 text-center w-full">
			<p class="text-slate-600 dark:text-slate-400">Add tasks and select an algorithm to generate a schedule</p>
		</div>
	{/if}
</div>

<style>
	@import 'tailwindcss';

	:global(.overflow-x-auto) {
		scrollbar-width: thin;
		scrollbar-color: #cbd5e1 transparent;
	}

	:global(.overflow-x-auto::-webkit-scrollbar) {
		height: 6px;
	}

	:global(.overflow-x-auto::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(.overflow-x-auto::-webkit-scrollbar-thumb) {
		background-color: #cbd5e1;
		border-radius: 3px;
	}
</style>
