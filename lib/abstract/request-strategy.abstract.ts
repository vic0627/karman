import RequestDetail, { HttpBody, HttpConfig, ReqStrategyTypes, XhrResponse, FetchResponse } from "@/types/http.type";

export type SelectRequestStrategy<T extends ReqStrategyTypes, D> = T extends "xhr"
  ? XhrResponse<D, T>
  : FetchResponse<D>;

export default abstract class RequestStrategy {
  abstract request<D, T extends ReqStrategyTypes>(
    payload: HttpBody,
    config: HttpConfig<T>,
  ): RequestDetail<SelectRequestStrategy<T, D>, T>;
}
