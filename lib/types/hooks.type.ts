import Karman from "@/core/karman/karman";
import { HttpBody, HttpConfig, ReqStrategyTypes, XhrResponse } from "./http.type";
import { PayloadDef } from "./payload-def.type";
import { FetchResponse } from "declrations";
import { SelectRequestStrategy } from "@/abstract/request-strategy.abstract";

export interface ValidationHooks {
  onBeforeValidate?(payloadDef: PayloadDef, payload: Record<string, any>): void;
}

export interface SyncHooks extends ValidationHooks {
  onBeforeRequest?<T = Record<string, any>>(requestURL: string, payload: T): HttpBody | T;
}

export interface AsyncHooks {
  onSuccess?(res: SelectRequestStrategy<ReqStrategyTypes, any>): any;
  onError?(err: Error): void;
  onFinally?(): void;
}

export interface KarmanInterceptors {
  onRequest?(this: Karman, req: HttpConfig<ReqStrategyTypes>): void;
  onResponse?(this: Karman, res: SelectRequestStrategy<ReqStrategyTypes, any>): void;
}
