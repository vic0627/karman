import Karman from "@/core/karman/karman";
import { HttpBody, HttpConfig, ReqStrategyTypes } from "./http.type";
import { PayloadDef } from "./payload-def.type";
import { SelectRequestStrategy } from "@/abstract/request-strategy.abstract";

export interface ValidationHooks {
  onBeforeValidate?(this: Karman, payloadDef: PayloadDef, payload: Record<string, any>): void;
}

export interface SyncHooks extends ValidationHooks {
  onRebuildPayload?<T extends Record<string, any>>(this: Karman, payload: T): T | void;
  onBeforeRequest?(this: Karman, requestURL: string, payload: Record<string, any>): HttpBody | void;
}

export interface AsyncHooks {
  onSuccess?(this: Karman, res: SelectRequestStrategy<ReqStrategyTypes, any>): any;
  onError?(this: Karman, err: Error): unknown;
  onFinally?(this: Karman): void;
}

export interface KarmanInterceptors {
  onRequest?(this: Karman, req: HttpConfig<ReqStrategyTypes>): void;
  onResponse?(this: Karman, res: SelectRequestStrategy<ReqStrategyTypes, any>): void;
}
