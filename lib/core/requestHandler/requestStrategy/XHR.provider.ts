import type {
  AllUserServiceResponseType,
  HeadersConfig,
  HttpAuthentication,
  HttpResponse,
  PromiseExecutor,
  RequestConfig,
  RequestExecutor,
} from "src/types/xhr.type";
import { symbolToken } from "src/utils/common";
import RequestHandler from "src/abstract/RequestHandler.abstract";
import RequestError from "../RequestError";

/**
 * # 處理請求的物件
 *
 * > 注意：雖然是處理請求的地方，但所有方法皆為同步，唯一只有一個 Promise 物件 `requestObject`，需要透過它來取得請求結果。
 */
export default class XHR implements RequestHandler {
  request(config: RequestConfig) {
    const { url = "", method = "GET", payload, headers, auth, timeout, responseType, withCredentials } = config;

    let xhr: XMLHttpRequest | null = new XMLHttpRequest();

    /** 釋放 xhr 記憶體 */
    const cleanup = () => {
      xhr = null;
    };

    const _method = method.toUpperCase();

    const requestToken = symbolToken(_method + ":" + url);

    xhr.open(_method, url, true);

    const { requestObject, executor } = this.#httpHooksEncapsulation(xhr, cleanup, config);

    this.#setTimeout(xhr, timeout);
    this.#setAuthentication(xhr, auth);
    this.#setRequestHeader(xhr, headers);
    this.#setResType(xhr, responseType);
    xhr.withCredentials = !!withCredentials;

    const request: RequestExecutor = (onRequest) => {
      if (xhr) {
        xhr.send((payload as XMLHttpRequestBodyInit) ?? null);
      }

      return requestObject(onRequest);
    };

    return {
      requestToken,
      request,
      executor,
      config,
    };
  }

  // #region private methods
  /**
   * 設置 timeout
   * @param xhr XMLHttpRequest instance
   * @param t 時間(ms)
   */
  #setTimeout(xhr: XMLHttpRequest, t?: number) {
    xhr.timeout = t ?? 0;
  }

  /**
   * 設置響應類型
   * @param xhr XMLHttpRequest instance
   * @param resType 響應類型
   */
  #setResType(xhr: XMLHttpRequest, resType?: AllUserServiceResponseType) {
    xhr.responseType = (resType ?? "") as XMLHttpRequestResponseType;
  }

  /**
   * 設置請求頭
   * @param xhr XMLHttpRequest instance
   * @param reqHeader 請求頭配置
   */
  #setRequestHeader(xhr: XMLHttpRequest, reqHeader?: HeadersConfig) {
    const _headers = reqHeader ?? {};

    for (const key in _headers) {
      if (!Object.prototype.hasOwnProperty.call(_headers, key)) {
        continue;
      }

      const value = _headers[key as keyof HeadersConfig] as string;

      xhr.setRequestHeader(key, value);
    }
  }

  /**
   * 設置身分驗證標頭(Authorization)
   * @param xhr XMLHttpRequest instance
   * @param auth username and password
   */
  #setAuthentication(xhr: XMLHttpRequest, auth?: Partial<HttpAuthentication>) {
    const _auth = auth ?? {};

    if (!_auth) {
      return;
    }

    const username = _auth?.username || "";
    const password = _auth?.password ? decodeURIComponent(encodeURIComponent(_auth.password)) : "";

    xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
  }

  /**
   * xhr 生命週期封裝、分配
   * @param xhr XMLHttpRequest instance
   * @param cleanup xhr 清除器
   * @param config 請求配置
   * @returns 請求的 Promise 物件與請求終止器
   */
  #httpHooksEncapsulation(xhr: XMLHttpRequest, cleanup: () => void, config: RequestConfig) {
    /**
     * Promise 的決行(解除 pending)函式
     * @default cleanup xhr 清除函式
     */
    let executor: PromiseExecutor = { resolve: cleanup, reject: cleanup };

    const requestObject: RequestExecutor = (onRequest) => {
      let abortController: () => void = () => {
        // 預設為取消失敗的警語
        console.warn("Abort failed");
      };

      /** 回傳結果的 Promise */
      const requestPromise = new Promise<HttpResponse | void>((_resolve, _reject) => {
        const hasOnRequest = typeof onRequest === "function";

        let timer: number | NodeJS.Timeout;

        if (hasOnRequest) {
          timer = setInterval(onRequest, 50);
        }

        const clearTime = () => {
          if (timer) {
            clearInterval(timer);
          }
        };

        const resolve = (value: HttpResponse) => {
          // console.log("root Promise resolve func called");
          clearTime();
          cleanup();
          _resolve(value);
        };

        const reject = (reason?: unknown) => {
          clearTime();
          cleanup();
          _reject(reason);
        };

        abortController = (reason?: unknown) => {
          xhr && xhr.abort();
          reject(reason);
        };

        executor = { resolve, reject };

        xhr.onloadend = this.#handlerFactory(xhr, config, executor, this.#handleLoadend);
        xhr.onabort = this.#handlerFactory(xhr, config, executor, this.#handleAbort);
        xhr.ontimeout = this.#handlerFactory(xhr, config, executor, this.#handleTimeout);
        xhr.onerror = this.#handlerFactory(xhr, config, executor, this.#handleError);
      }).catch((error) => {
        if (typeof error === "string") {
          throw new RequestError(error);
        } else {
          throw error as Error;
        }
      });

      return [requestPromise, abortController];
    };

    return { requestObject, executor };
  }

  /**
   * xhr 生命週期工廠
   * @description 除了高階函式構成之外，最重要的就是 handler 的 this 綁定
   * @param xhr XMLHttpRequest instance
   * @param executor resolve, reject, and request config
   * @param handler xhr 生命週期處理器
   * @returns xhr 生命週期處理器(包裝過的)
   */
  #handlerFactory(
    xhr: XMLHttpRequest,
    config: RequestConfig,
    executor: PromiseExecutor,
    handler: (e: ProgressEvent | Event, config: RequestConfig, xhr: XMLHttpRequest, executor: PromiseExecutor) => void,
  ) {
    return (e: ProgressEvent | Event) => handler.call(this, e, config, xhr, executor);
  }

  #handleAbort(_: ProgressEvent | Event, __: RequestConfig, xhr: XMLHttpRequest, { reject }: PromiseExecutor) {
    xhr && reject(new RequestError("Request aborted"));
  }

  #handleTimeout(_: ProgressEvent | Event, config: RequestConfig, xhr: XMLHttpRequest, { reject }: PromiseExecutor) {
    if (!xhr) {
      return;
    }

    const { timeout, timeoutErrorMessage } = config ?? {};

    let errMsg = timeout ? `time of ${timeout}ms exceeded` : "timeout exceeded";

    if (timeoutErrorMessage) {
      errMsg = timeoutErrorMessage;
    }

    reject(new RequestError(errMsg));
  }

  #handleError(_: ProgressEvent | Event, config: RequestConfig, xhr: XMLHttpRequest, { reject }: PromiseExecutor) {
    if (!xhr) {
      return;
    }

    const { url } = config ?? {};
    const { status } = xhr;

    reject(new RequestError(`Network Error ${url} ${status}`));
  }

  #handleLoadend(_: ProgressEvent | Event, config: RequestConfig, xhr: XMLHttpRequest, { resolve }: PromiseExecutor) {
    if (!xhr) {
      return;
    }

    const { responseType, response, responseText, status, statusText } = xhr;

    const data = !responseType || responseType === "text" || responseType === "json" ? responseText : response;

    let headers: string | Record<string, string> = xhr.getAllResponseHeaders();

    if (typeof headers === "string" && config?.headerMap) {
      headers = this.#getHeaderMap(headers);
    }

    const res: HttpResponse = {
      data,
      status,
      statusText,
      headers,
      config,
      request: xhr,
    };

    resolve(res);
  }

  /**
   * 將 res header 轉換成 object literal 格式
   * @param headers response header
   */
  #getHeaderMap(headers: string) {
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
  // #endregion
}
