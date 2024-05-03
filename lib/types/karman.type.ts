import Karman from "@/core/karman/karman";
import { KarmanInterceptors } from "./hooks.type";
import { ReqStrategyTypes, RequestConfig } from "./http.type";
import { SelectPrimitive } from "./common.type";
import SchemaType from "@/core/validation-engine/schema-type/schema-type";

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

export interface KarmanConfig<A, R>
  extends KarmanInterceptors,
    CacheConfig,
    Omit<RequestConfig<ReqStrategyTypes>, "requestStrategy">,
    UtilConfig {
  root?: boolean;
  url?: string;
  schema?: SchemaType[];
  route?: R;
  api?: A;
}

export type KarmanInstanceConfig = Omit<KarmanConfig<unknown, unknown>, "route" | "api">;

export type FinalKarman<A, R> = Karman | SelectPrimitive<A, void> | SelectPrimitive<R, void>;
