<script lang="ts">
	import { ChevronLeft, ChevronRight, Trash2, Plus } from '@lucide/svelte';
	import type { SchedulingAlgorithm, Task } from '$lib/types';
    import { algorithmList } from '$lib/utils';

	let {
		tasks,
		selectedAlgorithm,
		onTasksChange,
		onAlgorithmChange,
	}: {
		tasks: Task[];
		selectedAlgorithm: SchedulingAlgorithm;
		onTasksChange?: (tasks: Task[]) => void;
		onAlgorithmChange?: (algorithm: SchedulingAlgorithm) => void;
	} = $props();

	let isExpanded = $state(true);
	let newTask = $state({
		id: '',
		executionTime: 1,
		period: 10,
		deadline: 10,
	});

	$effect(() => {
		onTasksChange?.(tasks);
	});


    function addTask() {
		if (!newTask.id.trim()) {
			alert('Task ID is required');
			return;
		}

		if (tasks.some((t) => t.id === newTask.id)) {
			alert('Task ID already exists');
			return;
		}

		tasks = [
			...tasks,
			{
				id: newTask.id,
				executionTime: newTask.executionTime,
				period: newTask.period,
				deadline: newTask.deadline,
			},
		];

		// Reset form
		newTask = {
			id: '',
			executionTime: 1,
			period: 10,
			deadline: 10,
		};

		onTasksChange?.(tasks);
	}

    function removeTask(id: string) {
		tasks = tasks.filter((t) => t.id !== id);
		onTasksChange?.(tasks);
	}

	function handleAlgorithmChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		selectedAlgorithm = algorithmList.find((algo) => algo.id === target.value) || algorithmList[0];
		onAlgorithmChange?.(selectedAlgorithm);
	}
</script>


<!-- svelte-ignore a11y_label_has_associated_control -->

<div class="fixed left-0 top-0 h-full z-50 transition-all duration-300 {isExpanded ? 'w-80' : 'w-16'}">
	
    <!-- Background tint when expanded -->
	{#if isExpanded}
		<div class="fixed left-0 top-0 w-full h-full -z-40 bg-black/20" onclick={() => (isExpanded = false)}></div>
	{/if}

	<!-- Floating Card -->
	<div class="h-full overflow-hidden bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-lg flex flex-col transition-all duration-300">
		<!-- Header with toggle button -->
		<div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
			{#if isExpanded}
				<h2 class="font-semibold text-sm text-slate-900 dark:text-slate-50">Task Manager</h2>
			{/if}
			<button
				class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
				onclick={() => (isExpanded = !isExpanded)}
				title={isExpanded ? 'Collapse' : 'Expand'} >
				
                {#if isExpanded}
					<ChevronLeft class="w-4 h-4" />
				{:else}
					<ChevronRight class="w-4 h-4" />
				{/if}

			</button>
		</div>

		{#if isExpanded}
			<div class="flex-1 overflow-y-auto p-4 space-y-4">

				<!-- Algorithm Dropdown -->
				<div>
					<label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
						Scheduling Algorithm
					</label>
					<select
						value={selectedAlgorithm.id}
						onchange={handleAlgorithmChange}
						class="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400">

						{#each algorithmList as algo}
							<option value={algo.id}>{algo.name}</option>
						{/each}
					</select>
				</div>

				<!-- Add Task Form -->
				<div class="space-y-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-md">
					<h3 class="text-xs font-semibold text-slate-700 dark:text-slate-300">Add Task</h3>
                    
					<input
						type="text"
						placeholder="Task ID"
						bind:value={newTask.id}
						class="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
					/>

					<div class="grid grid-cols-2 gap-2">
						<div>
                            <!-- Execution Time Input -->
							<label class="text-xs text-slate-600 dark:text-slate-400">Exec Time</label>
							<input
								type="number"
								min="1"
								bind:value={newTask.executionTime}
								class="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
							/>
						</div>
						<div>
                            <!-- Period Input -->
							<label class="text-xs text-slate-600 dark:text-slate-400">Period</label>
							<input
								type="number"
								min="1"
								bind:value={newTask.period}
								class="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
							/>
						</div>
					</div>

                    <!-- Deadline Input -->
					<div>
						<label class="text-xs text-slate-600 dark:text-slate-400">Deadline</label>
						<input
							type="number"
							min="1"
							bind:value={newTask.deadline}
							class="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
						/>
					</div>

                    <!-- Add Button -->
					<button
						onclick={addTask}
						class="w-full px-2 py-1.5 text-xs font-medium bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 rounded-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-1">
						
                        <Plus class="w-3 h-3" />
						Add Task
					</button>
				</div>

				<!-- Task List -->
				<div class="space-y-2">
					<h3 class="text-xs font-semibold text-slate-700 dark:text-slate-300">Tasks ({tasks.length})</h3>
					{#each tasks as task (task.id)}

						<div class="p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-xs space-y-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group">
							
                            <!-- Delete Button -->
                            <div class="flex items-start justify-between">
								<h4 class="font-semibold text-slate-900 dark:text-slate-50">{task.id}</h4>
								<button
									onclick={() => removeTask(task.id)}
									class="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
									title="Delete task">

									<Trash2 class="w-3.5 h-3.5" />
								</button>
							</div>
                            
							<div class="space-y-0.5 text-slate-600 dark:text-slate-400">
								<p>Exec: <span class="font-mono">{task.executionTime}</span></p>
								<p>Period: <span class="font-mono">{task.period}</span></p>
								<p>Deadline: <span class="font-mono">{task.deadline}</span></p>
							</div>
						</div>

					{/each}

					{#if tasks.length === 0}
						<p class="text-xs text-slate-500 dark:text-slate-400 text-center py-4">No tasks added yet</p>
					{/if}

				</div>
			</div>
		{/if}
	</div>
</div>

