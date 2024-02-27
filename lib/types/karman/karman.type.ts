import Karman from "@/core/karman/karman";
import { AsyncHooks, SyncHooks } from "./hooks.type";
import { RequestConfig } from "./http.type";
import { FinalAPI } from "./final-api.type";

export interface CacheConfig {
  cache?: boolean;
  cacheExpireTime?: number;
  cacheStrategy?: "sessionStorage" | "localStorage" | "memory";
}

export interface APIs {
  [x: string]: FinalAPI;
}

export interface Routes {
  [x: string]: Karman;
}

export interface KarmanConfig extends SyncHooks, AsyncHooks, CacheConfig, RequestConfig {
  url?: string;
  route?: Routes;
  api?: APIs;
  validation?: boolean;
  scheduleInterval?: number;
  requestStrategy?: "xhr" | "fetch";
}