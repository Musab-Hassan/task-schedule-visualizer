import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SchedulingAlgorithm, Task } from "./types";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };



/** Scheduling Utilities **/

export const algorithmList: SchedulingAlgorithm[] = [
	{ id: 'edf', name: 'Earliest Deadline First' },
	{ id: 'llf', name: 'Least Laxity First'},
	{ id: 'rm', name: 'Rate Monotonic'}
];

export function gcd(a: number, b: number): number {
	return b === 0 ? a : gcd(b, a % b);
}

export function lcm(a: number, b: number): number {
	return (a * b) / gcd(a, b);
}

export function calculateHyperperiod(tasks: Task[]): number {
	if (tasks.length === 0) return 0;
	
	// Calculate LCM of all periodic task periods
	const periodicPeriods = tasks
		.filter((task) => !task.isAperiodic && task.period)
		.map((task) => task.period)
		.filter((period): period is number => period !== undefined);
	
	const lcmOfPeriodic = periodicPeriods.length > 0 
		? periodicPeriods.reduce((acc, val) => lcm(acc, val))
		: 0;
	
	// Find the longest deadline among aperiodic tasks
	const aperiodicDeadlines = tasks
		.filter((task) => task.isAperiodic && task.deadline)
		.map((task) => task.deadline)
		.filter((deadline): deadline is number => deadline !== undefined);
	
	const maxAperiodicDeadline = aperiodicDeadlines.length > 0 
		? Math.max(...aperiodicDeadlines)
		: 0;
	
	// Return the higher value to cover both periodic pattern and aperiodic deadlines
	return Math.max(lcmOfPeriodic, maxAperiodicDeadline);
}



/** Colour Utilities **/

const colorPalette = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#82E0AA', '#F1948A', '#AED6F1'];

export function assignColorsToTasks(tasks: Task[]): Map<string, string> {
	const colorMap = new Map<string, string>();
	tasks.forEach((task, index) => {
		colorMap.set(task.id, colorPalette[index % colorPalette.length]);
	});
	return colorMap;
}

export function getTaskColor(taskId: string | null, colorMap: Map<string, string>): string {
	if (!taskId) return '#f5f5f5';
	return colorMap.get(taskId) || '#999999';
}
