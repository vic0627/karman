import RequestStrategy from "@/abstract/request-strategy.abstract";
import Injectable from "@/decorator/Injectable.decorator";
import RequestDetail, {
  HeadersConfig,
  HttpAuthentication,
  HttpBody,
  HttpConfig,
  PromiseExecutor,
  ReqStrategyTypes,
  RequestExecutor,
  XhrHooksHandler,
} from "@/types/http.type";
import Template from "@/utils/template.provider";
import TypeCheck from "@/utils/type-check.provider";
import { cloneDeep } from "lodash-es";

@Injectable()
export default class Xhr implements RequestStrategy {
  constructor(
    private readonly typeCheck: TypeCheck,
    private readonly template: Template,
  ) {}

  public request<D, T extends ReqStrategyTypes>(payload: HttpBody, config: HttpConfig<T>): RequestDetail<D, T> {
    const { url, method = "GET" } = config;
    const [xhr, cleanup, requestKey] = this.initXhr({ method, url });
    this.setBasicSettings(xhr, config);
    const [reqExecutor, promiseExecutor] = this.buildPromise<D, T>(xhr, cleanup, config);

    const requestExecutor: RequestExecutor<D> = (send?: boolean) => {
      if (xhr && send) xhr.send(payload ?? null);

      return reqExecutor();
    };

    return {
      requestKey,
      requestExecutor,
      promiseExecutor,
      config,
    };
  }

  private initXhr<T extends ReqStrategyTypes>(
    options: Pick<HttpConfig<T>, "method" | "url">,
  ): [xhr: XMLHttpRequest, cleanup: () => void, requestKey: string] {
    const method = options.method?.toUpperCase() ?? "GET";
    const { url } = options;
    const requestKey = `xhr:${method}:${url}`;
    let xhr: XMLHttpRequest | null = new XMLHttpRequest();
    xhr.open(method, url, true);

    const cleanup = () => {
      xhr = null;
    };

    return [xhr, cleanup, requestKey];
  }

  private setBasicSettings<T extends ReqStrategyTypes>(xhr: XMLHttpRequest, config: HttpConfig<T>) {
    const { timeout, auth, headers, responseType = "", withCredentials } = config;
    xhr.timeout = timeout ?? 0;
    xhr.withCredentials = !!withCredentials;
    xhr.responseType = responseType as XMLHttpRequestResponseType;
    const _headers = cloneDeep(headers) ?? {};
    Object.assign(_headers, this.getAuthHeaders(auth));
    this.setRequestHeader(xhr, _headers);
  }

  private getAuthHeaders(auth?: Partial<HttpAuthentication>) {
    let { password } = auth ?? {};
    const { username } = auth ?? {};

    if (this.typeCheck.isUndefinedOrNull(username) || this.typeCheck.isUndefinedOrNull(password)) return;

    password = decodeURIComponent(encodeURIComponent(password));
    const Authorization = "Basic " + btoa(username + ":" + password);

    return { Authorization };
  }

  private setRequestHeader(xhr: XMLHttpRequest, headers?: HeadersConfig) {
    const _headers = headers ?? {};

    for (const key in _headers) {
      if (!Object.prototype.hasOwnProperty.call(_headers, key)) continue;

      const value = _headers[key as keyof HeadersConfig] as string;
      xhr.setRequestHeader(key, value);
    }
  }

  private buildPromise<D, T extends ReqStrategyTypes>(
    xhr: XMLHttpRequest,
    cleanup: () => void,
    config: HttpConfig<T>,
  ): [requestExecuter: RequestExecutor<D>, promiseExecutor: PromiseExecutor<D>] {
    const promiseExecutor: PromiseExecutor<D> = { resolve: cleanup, reject: cleanup };

    const requestExecuter: RequestExecutor<D> = () => {
      let abortController = () => {
        this.template.warn("Failed to abort request.");
      };

      const requestPromise = new Promise<D>((_resolve, _reject) => {
        const resolve = (value: D) => {
          cleanup();
          _resolve(value as D);
        };

        const reject = (reason?: unknown) => {
          cleanup();
          _reject(reason);
        };

        abortController = (reason?: unknown) => {
          xhr && xhr.abort();
          reject(reason);
        };

        promiseExecutor.resolve = resolve;
        promiseExecutor.reject = reject;
        xhr.onloadend = this.hooksHandlerFactory<D, T>(xhr, config, promiseExecutor, this.handleLoadend);
        xhr.onabort = this.hooksHandlerFactory<D, T>(xhr, config, promiseExecutor, this.handleAbort);
        xhr.ontimeout = this.hooksHandlerFactory<D, T>(xhr, config, promiseExecutor, this.handleTimeout);
        xhr.onerror = this.hooksHandlerFactory<D, T>(xhr, config, promiseExecutor, this.handleError);
      });

      return [requestPromise, abortController];
    };

    return [requestExecuter, promiseExecutor];
  }

  private hooksHandlerFactory<D, T extends ReqStrategyTypes>(
    xhr: XMLHttpRequest,
    config: HttpConfig<T>,
    executer: PromiseExecutor<D>,
    handler: XhrHooksHandler<D, T>,
  ) {
    return (e: ProgressEvent | Event) => handler.call(this, e, config, xhr, executer);
  }

  private handleAbort<D, T extends ReqStrategyTypes>(
    _: ProgressEvent | Event,
    __: HttpConfig<T>,
    xhr: XMLHttpRequest,
    { reject }: PromiseExecutor<D>,
  ) {
    xhr && reject(new Error("Request aborted"));
  }

  private handleTimeout<D, T extends ReqStrategyTypes>(
    _: ProgressEvent | Event,
    config: HttpConfig<T>,
    xhr: XMLHttpRequest,
    { reject }: PromiseExecutor<D>,
  ) {
    if (!xhr) return;

    const { timeout, timeoutErrorMessage } = config ?? {};
    let errorMessage = timeout ? `time of ${timeout}ms exceeded` : "timeout exceeded";

    if (timeoutErrorMessage) errorMessage = timeoutErrorMessage;

    reject(new Error(errorMessage));
  }

  private handleError<D, T extends ReqStrategyTypes>(
    _: ProgressEvent | Event,
    config: HttpConfig<T>,
    xhr: XMLHttpRequest,
    { reject }: PromiseExecutor<D>,
  ) {
    if (!xhr) return;

    const { url } = config ?? {};
    const { status } = xhr;

    reject(new Error(`Network Error ${url} ${status}`));
  }

  private handleLoadend<D, T extends ReqStrategyTypes>(
    _: ProgressEvent | Event,
    config: HttpConfig<T>,
    xhr: XMLHttpRequest,
    { resolve, reject }: PromiseExecutor<D>,
  ) {
    if (!xhr) return;

    const { responseType, response, responseText, status, statusText } = xhr;
    let data = !responseType || responseType === "text" || responseType === "json" ? responseText : response;
    const headers: string | Record<string, string> = xhr.getAllResponseHeaders();

    const headersMap = this.getHeaderMap(headers);

    if (headersMap?.["content-type"]?.includes("json") || responseType === "json") data = JSON.parse(data);

    const res = {
      data,
      status,
      statusText,
      headers: config?.headerMap ? headersMap : headers,
      config,
      request: xhr,
    };

    if (status === 200) resolve(res as D);
    else reject(res);
  }

  private getHeaderMap(headers: string) {
    if (!headers) return {};

    const arr = headers.trim().split(/[\r\n]+/);
    const headerMap: Record<string, string> = {};
    arr.forEach((line) => {
      const parts = line.split(": ");
      const header = parts.shift();
      const value = parts.join(": ");

      if (header) Object.defineProperty(headerMap, header, { value });
    });

    return headerMap;
  }
}
