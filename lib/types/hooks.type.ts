import Karman from "@/core/karman/karman";
import { HttpBody, HttpConfig, ReqStrategyTypes } from "./http.type";
import { PayloadDef } from "./payload-def.type";
import { SelectRequestStrategy } from "@/abstract/request-strategy.abstract";

export interface ValidationHooks {
  onBeforeValidate?(this: Karman | undefined, payloadDef: PayloadDef, payload: Record<string, any>): void;
}

export interface SyncHooks extends ValidationHooks {
  onRebuildPayload?<T extends Record<string, any>>(this: Karman | undefined, payload: T): T | void;
  onBeforeRequest?(this: Karman | undefined, requestURL: string, payload: Record<string, any>): HttpBody | void;
}

export interface AsyncHooks {
  onSuccess?(this: Karman | undefined, res: SelectRequestStrategy<ReqStrategyTypes, any>): any;
  onError?(this: Karman | undefined, err: Error): unknown;
  onFinally?(this: Karman | undefined): void;
}

export interface KarmanInterceptors {
  onRequest?(this: Karman | undefined, req: HttpConfig<ReqStrategyTypes>): void;
  onResponse?(this: Karman | undefined, res: SelectRequestStrategy<ReqStrategyTypes, any>): boolean | void;
}
