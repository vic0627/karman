import RequestDetail, { ReqStrategyTypes, RequestExecutor } from "@/types/http.type";
import { SelectRequestStrategy } from "./request-strategy.abstract";

export interface PipeDetail<D, T extends ReqStrategyTypes> extends RequestDetail<SelectRequestStrategy<T, D>, T> {
  payload: any;
}

export default abstract class RequestPipe {
  /**
   * 串接的主要函式
   * @param requestDetail 第一個參數必為請求的詳細配置、Promise、操作方法等...
   * @param args 第二個參數開始可以自己決定要帶什麼需要的參數
   */
  abstract chain<D, T extends ReqStrategyTypes>(
    requestDetail: PipeDetail<D, T>,
    ...args: any[]
  ): RequestExecutor<SelectRequestStrategy<T, D>>;
}
