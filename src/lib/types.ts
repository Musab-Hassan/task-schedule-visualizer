export type Task = {
    id: string;
    executionTime: number;
    releaseTime: number;
    period?: number;
    deadline?: number;
    isAperiodic?: boolean;
}

export type SchedulingAlgorithm = {
    id: string;
    name: string;
};

export type Schedule = {
    time: number;
    taskId: string | null; // null means idle time
}[];

export type ScheduleResult = {
    schedule: Schedule;
    isSchedulable: boolean;
    utilization: number;
}