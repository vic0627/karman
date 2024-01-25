import RuleError from "src/core/validationEngine/RuleError";
import type { Payload, RuleObjectInterface } from "./ruleObject.type";
import type {
  AllUserServiceResponseType,
  HttpAuthentication,
  HttpMethod,
  HttpResponse,
  RequestConfig,
} from "./xhr.type";
import RequestError from "src/core/requestHandler/RequestError";

/**
 * @inherit 為繼承屬性，往 children 及 api 向下繼承，越 deep 的配置優先權越高
 */

/** 從上一層 Service 繼承下來的配置 */
export interface InheritConfig
  extends ServiceFuncConfig,
    ServiceRequestConfig,
    Pick<ServiceConfigRoot, "baseURL">,
    Pick<RequestConfig, "url"> {}

/** 繼承與複寫後的配置 */
export interface OverwriteConfig extends InheritConfig, ServiceConfigChild {}

/** Final API 被調用時可配置的設定 */
export interface FinalApiConfig extends Omit<RequestConfig, "url" | "payload" | "method">, ServiceFuncConfig {}

/**
 * 參數聲明
 * - `string[]` - 僅定義需要的參數名稱
 * - `Record<string, string>` - 需要的參數名稱及其說明
 */
export type ParamDef = string[] | Record<string, string>;

/** 參數聲明(組) */
export interface ParamDefGroup {
  /** 路徑參數 */
  param?: ParamDef;
  /** 查詢參數 */
  query?: ParamDef;
  /** 主體參數 */
  body?: ParamDef;
}

/** 參數驗證階段攔截器 */
export interface ValidationHooks {
  onBeforeValidation?: (payload: Payload) => void;
  onValidationFailed?: (error?: RuleError) => void;
}

/** 請求期間回呼函式 */
export type OnRequestCallback = () => void;

/** 異步階段攔截器 */
export interface PromiseStageHooks {
  /** 異步請求時 */
  onRequest?: OnRequestCallback;
  /** 異步請求失敗 */
  onRequestFailed?: (error?: RequestError) => void;
  /** 異步請求成功 */
  onRequestSucceed?: (res: HttpResponse | void) => any;
}

/** Request 相關攔截器 */
export interface RequestHooks extends PromiseStageHooks {
  /** 建構完整 URL 前 */
  onBeforeBuildingURL?: (payload: Payload, paramDef: ParamDefGroup) => void;
  /** 發送請求前 */
  onBeforeRequest?: (payload: Payload, paramDef: ParamDefGroup) => any;
}

/** fianl api 所有攔截器 */
export interface ServiceInterceptor extends ValidationHooks, RequestHooks {}

/** @inherit 抽象層功能 */
export interface ServiceFuncConfig extends ServiceInterceptor {
  /**
   * 啟用 runtime 參數驗證
   * @default false
   */
  validation?: boolean;
  /**
   * 啟用快取管理
   * @default false
   */
  cache?: boolean;
  /** 快取暫存時限 */
  cacheLifetime?: number;
}

/**
 * @todo 梨子 - HTTP 請求策略擴充參數
 * @inherit 請求配置(node js 專屬)
 */
export interface ServiceRequestConfigForNodeJS {
  /**
   * 指定伺服器回應的編碼方式
   * @default "utf-8"
   */
  responseEncoding?: string;
  /**
   * 指定 Cross-Site Request Forgery（CSRF）防護的 Cookie 名稱。
   * @default "XSRF-TOKEN"
   */
  xsrfCookieName?: string;
  /**
   * 指定包含 CSRF Token 的 HTTP 頭名稱。
   * @default "X-XSRF-TOKEN"
   */
  xsrfHeaderName?: string;
  /**
   * 指定請求和回應中允許的最大內容大小，
   * 用來防止攻擊者通過大型請求或回應來進行拒絕服務（Denial of Service）攻擊。
   */
  maxContentLength?: number;
  /** 指定請求主體的最大大小。 */
  maxBodyLength?: number;
  /** 指定允許的最大重新導向數量。 */
  maxRedirects?: number;
  /**
   * 用於指定 Unix Socket 或 Windows Named Pipe 的路徑，以進行伺服器連接。
   */
  socketPath?: string;
  /** 指定用於 HTTP 請求的代理。 */
  httpAgent?: unknown;
  /** 指定用於 HTTPS 請求的代理。 */
  httpsAgent?: unknown;
  /**  用於指定代理伺服器的相關設定，包括協議、主機、端口和驗證資訊。 */
  proxy?: {
    protocol: string;
    host: string;
    port: number;
    auth: HttpAuthentication;
  };
  /**
   *  用於指定是否應該自動解壓縮伺服器回應。
   * @default true
   */
  decompress?: boolean;
}

/** @inherit 請求配置 */
export interface ServiceRequestConfig extends ServiceRequestConfigForNodeJS {
  /**
   * HTTP 方法
   * @default "GET"
   */
  method?: HttpMethod;
  /** 請求標頭 */
  headers?: Record<string, string>;
  /** 身分授權 */
  auth?: Partial<HttpAuthentication>;
  /** 超時(ms) */
  timeout?: number;
  /** 超時錯誤訊息 */
  timeoutErrorMessage?: string;
  /** 響應類型 */
  responseType?: AllUserServiceResponseType;
  /** 將響應標頭轉換為物件格式 */
  headerMap?: boolean;
  /** 允許跨站請求 */
  withCredentials?: boolean;
}

/** API 封裝配置 */
export interface ServiceApiConfig extends ParamDefGroup, ServiceFuncConfig, ServiceRequestConfig {
  /** final API 名稱 */
  name: string;
  /** API 概述 */
  description?: string;
  /** 參數驗證規則 */
  rules?: RuleObjectInterface;
}

/** 服務根節點配置 */
export interface ServiceConfigRoot extends ServiceFuncConfig, Omit<ServiceRequestConfig, "method"> {
  /** 基本 URL (根節點限定) */
  baseURL: string;
  /** 服務名稱 */
  name: string;
  /** 服務概述 */
  description?: string;
  /** API 封裝配置 */
  api?: ServiceApiConfig | ServiceApiConfig[];
  /** 子路由配置 */
  children?: ServiceConfigChild[];
  /** 排程任務時間間隔(根節點限定) */
  scheduledInterval?: number;
}

/** 服務子節點配置 */
export interface ServiceConfigChild extends Omit<ServiceConfigRoot, "baseURL" | "name"> {
  /**
   * 路由(子節點限定)
   * @description 可含多層路徑(ex. `auth/login`)，此時若沒有 `name`，取 `auth` 作為 `name`。
   */
  route: string;
  /**
   * 子節點名稱
   * @description 沒有就用 `route`，若 `route` 有多層路徑時，使用第一層。
   */
  name?: string;
}
