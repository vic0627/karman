import { OnRequestCallback, ServiceFuncConfig, ServiceRequestConfig } from "./userService.type";

export type HttpMethod =
  | "get"
  | "GET"
  | "delete"
  | "DELETE"
  | "head"
  | "HEAD"
  | "options"
  | "OPTIONS"
  | "post"
  | "POST"
  | "put"
  | "PUT"
  | "patch"
  | "PATCH";

export type BrowserOnlyResponseType = "blob";

export type AllUserServiceResponseType = XMLHttpRequestResponseType | "stream";

export enum enumHttpMethod {
  GET = "GET",
  DELETE = "DELETE",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
}

/** @todo 上傳/下載事件 */
// export default interface XHRProgressHooks {
//   onDownloadProgress: () => void;
//   onUploadProgress: () => void;
// }

export type MimeString =
  | "text/plain"
  | "application/javascript"
  | "application/json"
  | "text/html"
  | "application/xml"
  | "application/pdf"
  | "application/x-www-form-urlencoded"
  | "multipart/form-data"
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "audio/mpeg"
  | "audio/wav"
  | "video/mp4"
  | "video/quicktime";

export interface HttpAuthentication {
  username: string;
  password: string;
}

export interface HeadersConfig {
  ["Content-Type"]?: MimeString | string;
  ["Authorization"]?: `Basic ${string}:${string}`;
}

export interface RequestConfig extends ServiceRequestConfig, ServiceFuncConfig {
  url?: string;
  payload?: unknown;
}

/** Promise pending 狀態的決行函式 */
export interface PromiseExecutor {
  resolve: (value: HttpResponse) => void;
  reject: (reason?: any) => void;
}

/**
 * final API 的一部分
 * 1. 響應結果 Promise
 * 2. 取消請求控制器
 */
export type RequestExecutorResult = [response: Promise<void | HttpResponse> | {}, abortController: () => void];

/**
 * 輸出 final API 的函式
 * @description 會在返回給 client 之前就被調用一或多次，次數依串接的 RequestPipe 數量決定。
 */
export type RequestExecutor = (onRequest?: OnRequestCallback) => RequestExecutorResult;

/** RequestHandler.request() 返回的資料 */
export interface RequestDetail {
  /** 代表該 API 的唯一鍵 */
  requestToken: symbol;
  /** 輸出 final API 的函式 */
  request: RequestExecutor;
  /** API 配置(可擴充) */
  config: RequestConfig;
  /** Promise pending 狀態的決行函式 */
  executor: PromiseExecutor;
}

/** 響應結果的格式 */
export interface HttpResponse {
  data: any;
  status: number;
  statusText: string;
  headers: string | Record<string, string>;
  config: RequestConfig | undefined;
  request: XMLHttpRequest;
  [x: string]: any;
}
