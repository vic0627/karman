import type { Task } from "src/types/scheduledTask.type";
import { notNull } from "src/utils/common";
import Service from "../../classes/Service";

/** 排程管理器 */
export default class ScheduledTask {
  /** 任務清單 */
  #tasks = new Map<string, Task>();
  /** 排程計時器的 id，當此參數為 `undefined` 時，結束排程任務 */
  #timer?: number | NodeJS.Timeout;
  /** 排程任務的執行間隔 */
  #interval: number = 1000 * 60 * 10;

  /** 排程任務的執行間隔 */
  get interval() {
    return this.#interval;
  }

  execute() {
    this.#runTasks();
  }

  /**
   * 設定排程任務的執行間隔時間
   * @param interval 間隔時間
   * @param service Sevice 抽象層實例
   */
  setInterval(interval?: number, service?: Service) {
    if (!notNull(interval) || (interval as number) <= 0 || service?._parent) {
      return;
    }

    this.#interval = interval as number;
  }

  /**
   * 新增不記名排程任務
   * @description 此方式新增之排程任務，不論其任務內容是否相同，都會新增置排程清單內等待執行。
   */
  addTask(task: Task) {
    this.#tasks.set(Math.random().toString(), task);
    this.#startSchedule();
  }

  /**
   * 新增記名排程任務
   * @description 記名排程任務檢測到相同名稱的任務時，將不會再新增至排程清單。
   * @param key 排程任務名稱
   * @param task 排程任務
   */
  addSingletonTask(key: string, task: Task) {
    if (this.#tasks.has(key)) {
      return;
    }

    this.#tasks.set(key, task);
    this.#startSchedule();
  }

  /** 清除所有排程任務 */
  clearSchedule() {
    clearInterval(this.#timer);
    this.#timer = undefined;
    this.#tasks.clear();
  }

  /** 開始執行排程任務 */
  #startSchedule() {
    // 1. 當排程計時器運行中，就不初始化計時器
    if (notNull(this.#timer)) {
      return;
    }

    // console.log("排程開始");

    // 2. 排程計時器初始化
    this.#timer = setInterval(() => {
      // 2-1. 執行排程任務
      const size = this.#runTasks();

      // 2-2. 當所有任務結束，清除計時器
      if (!size) {
        this.clearSchedule();
      }
    }, this.interval);
  }

  /** 運行排程任務 */
  #runTasks() {
    // 1. 取得當前時間戳
    const now = Date.now();
    // console.log("啟動排程");

    // 2. 遍歷排程清單
    this.#tasks.forEach((task, token) => {
      // 2-1. 執行任務並帶入時間戳後，取得取消任務信號
      const popSignal = task(now);
      // console.log("排程檢查中");

      // 2-2. 收到信號時，將該任務從排程清單中剃除
      if (popSignal) {
        this.#tasks.delete(token);
        // console.log("排程結束");
      }
    });

    // 3. 返回清單大小
    return this.#tasks.size;
  }
}
