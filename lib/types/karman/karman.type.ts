import Karman from "@/core/karman/karman";
import { AsyncHooks, SyncHooks } from "./hooks.type";
import { ReqStrategyTypes, RequestConfig } from "./http.type";

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
  [x: string]: unknown;
}

export interface Routes {
  [x: string]: unknown;
}

export interface KarmanConfig<A, R, T extends ReqStrategyTypes>
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

export type KarmanInstanceConfig = Omit<KarmanConfig<unknown, unknown, ReqStrategyTypes>, "route" | "api">;

export type FinalKarman<A, R> = Karman | A | R;
