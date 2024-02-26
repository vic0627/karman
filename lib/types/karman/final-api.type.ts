import { AsyncHooks, SyncHooks } from "./hooks.type";
import { RequestConfig } from "./http.type";

interface RuntimeOptions extends SyncHooks, AsyncHooks, RequestConfig {}

type FinalAPI<T = any> = (payload: Record<string, any>, runtimeOptions: RuntimeOptions) => Promise<T>;
