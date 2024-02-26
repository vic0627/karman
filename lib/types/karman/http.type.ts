import { SyncHooks, AsyncHooks } from "./hooks.type";
import { PayloadDef } from "./payload-def.type";

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

export type ResponseType = XMLHttpRequestResponseType | "stream";

export type MimeType =
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
  ["Content-Type"]?: MimeType | string;
  ["Authorization"]?: `Basic ${string}:${string}`;
  [x: string]: any;
}

export interface RequestConfig {
  headers?: HeadersConfig;
  auth?: Partial<HttpAuthentication>;
  timeout?: number;
  timeoutErrorMessage?: string;
  responseType?: ResponseType;
  headerMap?: boolean;
  withCredentials?: boolean;
}

export interface ApiConfig extends RequestConfig, SyncHooks, AsyncHooks {
  endpoint?: string;
  method?: HttpMethod;
  payloadDef?: PayloadDef;
}

export interface HttpConfig extends RequestConfig {
  url: string;
  method?: HttpMethod;
}

export type HttpBody = Document | XMLHttpRequestBodyInit | null;

export interface PromiseExecutor {
  resolve(value: any): void;
  reject(reason?: unknown): void;
}

export type XhrHooksHandler = (
  e: ProgressEvent | Event,
  config: HttpConfig,
  xhr: XMLHttpRequest,
  executer: PromiseExecutor,
) => void;
