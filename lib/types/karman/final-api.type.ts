import { AsyncHooks, SyncHooks } from "./hooks.type";
import { RequestConfig } from "./http.type";

export interface RuntimeOptions extends SyncHooks, AsyncHooks, RequestConfig {}

export type FinalAPI<T = any> = (payload: Record<string, any>, runtimeOptions: RuntimeOptions) => Promise<T>;
