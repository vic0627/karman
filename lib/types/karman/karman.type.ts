import Karman from "@/core/karman/karman";
import { AsyncHooks, SyncHooks } from "./hooks.type";
import { ReqStrategyTypes, RequestConfig } from "./http.type";
import { FinalAPI } from "./final-api.type";

export type CacheStrategyTypes = "sessionStorage" | "localStorage" | "memory";

export interface CacheConfig {
  cache?: boolean;
  cacheExpireTime?: number;
  cacheStrategy?: CacheStrategyTypes;
}

export interface UtilConfig {
  validation?: boolean;
  scheduleInterval?: number;
}

export type Reflect<T> = {
  [K in keyof T]: T[K];
};

export interface APIs {
  [x: string]: any;
}

export interface Routes {
  [x: string]: FinalKarman<APIs, Routes>;
}

export interface KarmanConfig<A extends APIs, R extends Routes, T extends ReqStrategyTypes>
  extends SyncHooks,
    AsyncHooks,
    CacheConfig,
    RequestConfig<T>,
    UtilConfig {
  baseURL?: string;
  url?: string;
  route?: R;
  api?: A;
}

export type KarmanInstanceConfig = Omit<KarmanConfig<APIs, Routes, ReqStrategyTypes>, "route" | "api">;

export type FinalKarman<A, R> = Karman | Reflect<A> | Reflect<R>;
