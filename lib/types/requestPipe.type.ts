import type { OnRequestCallback } from "./userService.type";
import type { HttpResponse } from "./xhr.type";
import type { ServiceInterceptor } from "./userService.type";
import type { Payload } from "./ruleObject.type";

export type RequestPipeResult = (onRequest?: OnRequestCallback) => Promise<HttpResponse>;

export interface InterceptorFrom {
  serviceConfig?: ServiceInterceptor;
  apiRuntime?: ServiceInterceptor;
}

export interface CacheData {
  res: HttpResponse | void;
  payload: Payload;
  expiration: number;
}
