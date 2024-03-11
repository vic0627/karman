import type { Task } from "@/types/scheduledTask.type";
import TypeCheck from "@/utils/type-check.provider";
/** 排程管理器 */
export default class ScheduledTask {
    #private;
    private readonly typeCheck;
    /**
     * 排程任務的執行間隔
     * @returns
     */
    get interval(): number;
    constructor(typeCheck: TypeCheck);
    execute(): void;
    /**
     * 設定排程任務的執行間隔時間
     * @param interval 間隔時間
     */
    setInterval(interval?: number): void;
    /**
     * 新增不記名排程任務
     * @param task 任務
     * @description 此方式新增之排程任務，不論其任務內容是否相同，都會新增置排程清單內等待執行。
     */
    addTask(task: Task): void;
    /**
     * 新增記名排程任務
     * @description 記名排程任務檢測到相同名稱的任務時，將不會再新增至排程清單。
     * @param key 排程任務名稱
     * @param task 排程任務
     */
    addSingletonTask(key: string, task: Task): void;
    /** 清除所有排程任務 */
    clearSchedule(): void;
}
//# sourceMappingURL=scheduled-task.injectable.d.ts.map