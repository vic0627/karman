import { Primitive } from "./common.type";
import { SyncHooks, AsyncHooks } from "./hooks.type";
import { CacheConfig, UtilConfig } from "./karman.type";
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

export type ReqStrategyTypes = "xhr" | "fetch";

export interface RequestConfig<T extends ReqStrategyTypes>
  extends Omit<RequestInit, "cache" | "method" | "signal" | "body"> {
  headers?: HeadersConfig;
  auth?: Partial<HttpAuthentication>;
  timeout?: number;
  timeoutErrorMessage?: string;
  responseType?: ResponseType;
  headerMap?: boolean;
  withCredentials?: boolean;
  requestStrategy?: T;
  /**
   * Only available on fetch
   */
  requestCache?: RequestCache;
}

export interface ApiConfig<D, T extends ReqStrategyTypes, P extends PayloadDef>
  extends RequestConfig<T>,
    SyncHooks,
    AsyncHooks,
    UtilConfig,
    CacheConfig {
  url?: string;
  method?: HttpMethod;
  payloadDef?: P;
  dto?: D;
}

export interface HttpConfig<T extends ReqStrategyTypes> extends RequestConfig<T> {
  url: string;
  method?: HttpMethod;
}

export type HttpBody = Document | XMLHttpRequestBodyInit | null;

export interface PromiseExecutor<D> {
  resolve(value: D): void;
  reject(reason?: unknown): void;
}

export type XhrHooksHandler<D, T extends ReqStrategyTypes> = (
  e: ProgressEvent | Event,
  config: HttpConfig<T>,
  xhr: XMLHttpRequest,
  executer: PromiseExecutor<D>,
) => void;

export type RequestExecutor<D> = (send?: boolean) => [requestPromise: Promise<D>, abortController: () => void];

export interface XhrResponse<D, T extends ReqStrategyTypes> {
  data: D;
  status: number;
  statusText: string;
  headers: string | Record<string, string>;
  config: HttpConfig<T> | undefined;
  request: XMLHttpRequest;
  [x: string]: any;
}

export interface FetchResponse<D> {
  readonly headers: Headers;
  readonly ok: boolean;
  readonly redirected: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly type: ResponseType;
  readonly url: string;
  readonly body: D extends Primitive ? D : ReadableStream<Uint8Array> | ArrayBuffer | Blob | null;
  readonly bodyUsed: boolean;
  clone?(): FetchResponse<D>;
  arrayBuffer?(): Promise<ArrayBuffer>;
  blob?(): Promise<Blob>;
  formData?(): Promise<FormData>;
  text?(): Promise<string>;
  json?(): Promise<D>;
}

export default interface RequestDetail<D, T extends ReqStrategyTypes> {
  requestKey: string;
  requestExecutor: RequestExecutor<D>;
  promiseExecutor: PromiseExecutor<D>;
  config: HttpConfig<T>;
  // eslint-disable-next-line semi
}
