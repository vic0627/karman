import Injectable from "@/decorator/Injectable.decorator";
import {
  HeadersConfig,
  HttpAuthentication,
  HttpBody,
  HttpConfig,
  PromiseExecutor,
  XhrHooksHandler,
} from "@/types/karman/http.type";
import { HttpMethod } from "@/types/xhr.type";
import TypeCheck from "@/utils/type-check.provider";
import { cloneDeep } from "lodash";

@Injectable()
export default class Xhr {
  constructor(private readonly typeCheck: TypeCheck) {}

  public request<T extends HttpBody>(payload: T, config: HttpConfig) {
    const { url = "", method = "GET" } = config;
    const [xhr, cleanup, requestKey] = this.initXhr({ method, url });
    this.setBasicSettings(xhr, config);
  }

  private initXhr(
    options: Pick<HttpConfig, "method" | "url">,
  ): [xhr: XMLHttpRequest, cleanup: () => void, requestKey: string] {
    const method = options.method?.toUpperCase() ?? "GET";
    const { url } = options;
    const requestKey = `${method}:${url}`;
    let xhr: XMLHttpRequest | null = new XMLHttpRequest();
    xhr.open(method, url, true);

    const cleanup = () => {
      xhr = null;
    };

    return [xhr, cleanup, requestKey];
  }

  private setBasicSettings(xhr: XMLHttpRequest, config: HttpConfig) {
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

    if (this.typeCheck.isUndefinedOrNull(username) || this.typeCheck.isUndefinedOrNull(password)) {
      return;
    }

    password = decodeURIComponent(encodeURIComponent(password));
    const Authorization = "Basic " + btoa(username + ":" + password);

    return { Authorization };
  }

  private setRequestHeader(xhr: XMLHttpRequest, headers?: HeadersConfig) {
    const _headers = headers ?? {};

    for (const key in _headers) {
      if (!Object.prototype.hasOwnProperty.call(_headers, key)) {
        continue;
      }

      const value = _headers[key as keyof HeadersConfig] as string;
      xhr.setRequestHeader(key, value);
    }
  }

  private buildPromise(xhr: XMLHttpRequest, cleanup: () => void, config: HttpConfig) {
    let promiseExecutor: PromiseExecutor = { resolve: cleanup, reject: cleanup };

    const requestExecuter = (onRequest?: () => void) => {
      let abortController = () => {
        console.warn("Failed to abort request.");
      };

      const requestPromise = new Promise((_resolve, _reject) => {
        const resolve = (value: any) => {
          cleanup();
          _resolve(value);
        };

        const reject = (reason?: unknown) => {
          cleanup();
          _reject(reason);
        };

        abortController = (reason?: unknown) => {
          xhr && xhr.abort();
          reject(reason);
        };

        promiseExecutor = { resolve, reject };
      });

      return [requestPromise, abortController];
    };

    return [requestExecuter, promiseExecutor];
  }

  private hooksHandlerFactory(
    xhr: XMLHttpRequest,
    config: HttpConfig,
    executer: PromiseExecutor,
    handler: XhrHooksHandler,
  ) {
    return (e: ProgressEvent | Event) => handler.call(this, e, config, xhr, executer);
  }

  private handleAbort(_: ProgressEvent | Event, __: HttpConfig, xhr: XMLHttpRequest, { reject }: PromiseExecutor) {
    xhr && reject(new Error("Request aborted"));
  }

  private handleTimeout(
    _: ProgressEvent | Event,
    config: HttpConfig,
    xhr: XMLHttpRequest,
    { reject }: PromiseExecutor,
  ) {
    if (!xhr) {
      return;
    }

    const { timeout, timeoutErrorMessage } = config ?? {};
    let errorMessage = timeout ? `time of ${timeout}ms exceeded` : "timeout exceeded";

    if (timeoutErrorMessage) {
      errorMessage = timeoutErrorMessage;
    }

    reject(new Error(errorMessage));
  }

  private handleError(_: ProgressEvent | Event, config: HttpConfig, xhr: XMLHttpRequest, { reject }: PromiseExecutor) {
    if (!xhr) {
      return;
    }

    const { url } = config ?? {};
    const { status } = xhr;

    reject(new Error(`Network Error ${url} ${status}`));
  }

  private handleLoadend(
    _: ProgressEvent | Event,
    config: HttpConfig,
    xhr: XMLHttpRequest,
    { resolve }: PromiseExecutor,
  ) {
    if (!xhr) {
      return;
    }

    const { responseType, response, responseText, status, statusText } = xhr;
    const data = !responseType || responseType === "text" || responseType === "json" ? responseText : response;
    let headers: string | Record<string, string> = xhr.getAllResponseHeaders();

    if (typeof headers === "string" && config?.headerMap) {
      headers = this.getHeaderMap(headers);
    }

    const res = {
      data,
      status,
      statusText,
      headers,
      config,
      request: xhr,
    };

    resolve(res);
  }

  private getHeaderMap(headers: string) {
    const arr = headers.trim().split(/[\r\n]+/);

    const headerMap: Record<string, string> = {};

    arr.forEach((line) => {
      const parts = line.split(": ");
      const header = parts.shift();
      const value = parts.join(": ");

      if (header) {
        Object.defineProperty(headerMap, header, { value });
      }
    });

    return headerMap;
  }
}
