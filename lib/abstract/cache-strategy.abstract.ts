type PopSignal = boolean;

export type Task = (now: number) => PopSignal;

export interface CacheData<D> {
  res: D | void;
  payload: Record<string, any>;
  expiration: number;
}

export default abstract class CacheStrategy {
  /** 設置快取 */
  abstract set<D>(requestKey: string, cacheData: CacheData<D>): void;
  /** 刪除快取 */
  abstract delete(requestKey: string): void;
  /** 是否有該筆快取 */
  abstract has(requestKey: string): boolean;
  /** 取得快取 */
  abstract get<D>(requestKey: string): CacheData<D> | undefined;
  /** 清除所有快取 */
  abstract clear(): void;
  /** 快取排程任務 */
  abstract scheduledTask: Task;
}
