import Karman from "@/core/karman/karman";
import { HttpBody, HttpConfig, ReqStrategyTypes, XhrResponse } from "./http.type";
import { PayloadDef } from "./payload-def.type";
import { FetchResponse } from "declrations";

export interface ValidationHooks {
  onBeforeValidate?(payloadDef: PayloadDef, payload: Record<string, any>): void;
}

export interface SyncHooks extends ValidationHooks {
  onBeforeRequest?<T = Record<string, any>>(requestURL: string, payload: T): HttpBody | T;
}

export interface AsyncHooks {
  onSuccess?(res: Response): any;
  onError?(err: Error): void;
  onFinally?(): void;
}

export interface KarmanInterceptors {
  onRequest?(this: Karman, req: HttpConfig<ReqStrategyTypes>): void;
  onResponse?(this: Karman, res: XhrResponse<any, ReqStrategyTypes> | FetchResponse<any>): void;
}
