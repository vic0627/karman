import Karman from "@/core/karman/karman";
import { AsyncHooks, SyncHooks } from "./hooks.type";
import { RequestConfig } from "./http.type";
import { CacheConfig, UtilConfig } from "./karman.type";

export interface RuntimeOptions
  extends SyncHooks,
    AsyncHooks,
    RequestConfig,
    CacheConfig,
    Omit<UtilConfig, "scheduleInterval"> {}

export type FinalAPI<T = any> = (
  this: Karman,
  payload: Record<string, any>,
  runtimeOptions?: RuntimeOptions,
) => Promise<T>;
