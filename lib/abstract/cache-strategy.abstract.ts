import { ReqStrategyTypes } from "@/types/karman/http.type";
import { SelectRequestStrategy } from "./request-strategy.abstract";

type PopSignal = boolean;

export type Task = (now: number) => PopSignal;

export interface CacheData<T extends ReqStrategyTypes, D> {
  res: SelectRequestStrategy<T, D>;
  payload: Record<string, any>;
  expiration: number;
}

export default abstract class CacheStrategy {
  /** 設置快取 */
  abstract set<T extends ReqStrategyTypes, D>(requestKey: string, cacheData: CacheData<T, D>): void;
  /** 刪除快取 */
  abstract delete(requestKey: string): void;
  /** 是否有該筆快取 */
  abstract has(requestKey: string): boolean;
  /** 取得快取 */
  abstract get<T extends ReqStrategyTypes, D>(requestKey: string): CacheData<T, D> | undefined;
  /** 清除所有快取 */
  abstract clear(): void;
  /** 快取排程任務 */
  abstract scheduledTask: Task;
}
