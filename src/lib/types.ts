export type Task = {
    id: string;
    executionTime: number;
    period: number;
    deadline: number;
}

export type Schedule = {
    time: number;
    taskId: string | null; // null represents idle time
}[];

export type ScheduleResult = {
    schedule: Schedule;
    isSchedulable: boolean;
    utilization: number
}