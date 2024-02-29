import RequestDetail, { RequestExecutor } from "@/types/karman/http.type";

export interface PipeDetail<D> extends RequestDetail<D> {
  payload: any;
}

export default abstract class RequestPipe {
  /**
   * 串接的主要函式
   * @param requesDetail 第一個參數必為請求的詳細配置、Promise、操作方法等...
   * @param args 第二個參數開始可以自己決定要帶什麼需要的參數
   */
  abstract chain<D>(requestDetail: PipeDetail<D>, ...args: any[]): RequestExecutor<D>;
}
