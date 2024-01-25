import type { CacheData } from "src/types/requestPipe.type";
import type { Task } from "src/types/scheduledTask.type";

export default abstract class CacheStrategy {
  /** 設置快取 */
  abstract set(requestToken: symbol, cacheData: CacheData): void;
  /** 刪除快取 */
  abstract delete(requestToken: symbol): void;
  /** 是否有該筆快取 */
  abstract has(requestToken: symbol): boolean;
  /** 取得快取 */
  abstract get(requestToken: symbol): CacheData;
  /** 清除所有快取 */
  abstract clear(): void;
  /** 快取排程任務 */
  abstract scheduledTask: Task;
}
