import * as DEBUG from "./debug";
import CONFIG from "./config";

interface ITask<T> {
    is_repetitive: boolean;
    name: string;
    scheduled_datetime: Date | number;
    task: () => T;
    callback: (task_result: T) => void;
}

const tasks = new Map<string, ITask<any>>();
const repetitive_last_executed = new Map<string, Date>();
let __IS_RUNNING = false;

function defaultCallback(result: any) {
    DEBUG.log(String(result));
}

export async function addScheduledTask<T>(task_name: string, executed_on: Date, target_function: () => T, callback: (task_result: T) => void = defaultCallback) {
    for(const name in tasks.keys()) if(task_name == name) throw new Error("Task with the same name already exist");

    tasks.set(task_name, { name: task_name, is_repetitive: false, scheduled_datetime: executed_on, task: target_function, callback });
    autoStartScheduler();
    DEBUG.log(`Scheduled Task ${task_name} scheduled at: ${executed_on}`);
}

export async function addRepetitiveTask<T>(task_name: string, every_n_second: number, target_function: () => T, callback: (task_result: T) => void = defaultCallback) {
    for(const name in tasks.keys()) if(task_name == name) throw new Error("Task with the same name already exist");

    tasks.set(task_name, { name: task_name, is_repetitive: true, scheduled_datetime: every_n_second, task: target_function, callback });
    repetitive_last_executed.set(task_name, new Date());
    autoStartScheduler();
    DEBUG.log(`Repetitive Task ${task_name} scheduled every: ${every_n_second} seconds`);
}

export async function deleteTask(task_name: string) {
    for(const name in tasks.keys()) {
        if(task_name == name) {
            tasks.delete(task_name);
            DEBUG.log(`Task ${task_name} deleted`)
            return true;
        }
    }

    DEBUG.error(`Task Name ${task_name} not found, deletion failed`);
    return false
}

async function __scheduler() {
    const date = new Date();
    for(const [task_name, task] of tasks) {
        if(task.is_repetitive) {
            let last_executed = repetitive_last_executed.get(task_name);
            if(!last_executed) {
                repetitive_last_executed.set(task_name, date);
                last_executed = date;
            }

            if ((date.getTime() - last_executed.getTime()) >= (task.scheduled_datetime as number)) {
                task.callback(task.task())
                repetitive_last_executed.set(task_name, date);
                DEBUG.log(`RepetitiveTask Name ${task_name} executed.`)
            }
        } else {
            if(new Date() >= task.scheduled_datetime) {
                task.callback(task.task())
                tasks.delete(task_name);
            }
        }
    }

    if(tasks.size <= 0) {
        __IS_RUNNING = false;
        DEBUG.log("Scheduler stopped, because there is no tasks scheduled");
    }
    if(!__IS_RUNNING) return;
    setTimeout(__scheduler, CONFIG.SCHEDULER_SENSITIVITY);
}

export async function startScheduler() {
    __IS_RUNNING = true;
    setTimeout(__scheduler, 0);
    DEBUG.log(`Scheduler started! at ${new Date()} tasks length: ${tasks.size}`);
}

export async function stopScheduler() {
    __IS_RUNNING = false;
    DEBUG.log(`Scheduler stopped! at ${new Date()} tasks length: ${tasks.size}`);
}

export async function autoStartScheduler() {
    if(tasks.size > 0) startScheduler()
}