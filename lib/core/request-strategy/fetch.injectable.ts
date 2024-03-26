import RequestStrategy, { SelectRequestStrategy } from "@/abstract/request-strategy.abstract";
import Injectable from "@/decorator/Injectable.decorator";
import RequestDetail, {
  ReqStrategyTypes,
  HttpBody,
  HttpConfig,
  HttpAuthentication,
  PromiseExecutor,
  RequestConfig,
  RequestExecutor,
  FetchResponse,
} from "@/types/http.type";
import Template from "@/utils/template.provider";
import TypeCheck from "@/utils/type-check.provider";
import { merge } from "lodash-es";

@Injectable()
export default class Fetch implements RequestStrategy {
  constructor(
    private readonly typeCheck: TypeCheck,
    private readonly template: Template,
  ) {}

  public request<D, T extends ReqStrategyTypes>(
    payload: HttpBody,
    config: HttpConfig<T>,
  ): RequestDetail<SelectRequestStrategy<T, D>, T> {
    const {
      url,
      method = "GET",
      // headerMap,
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headers,
      // withCredentials,
      credentials,
      integrity,
      keepalive,
      mode,
      redirect,
      referrer,
      referrerPolicy,
      requestCache,
      window,
    } = config;
    const _method = method.toUpperCase();
    const _headers = this.getHeaders(headers, auth);
    const fetchConfig = {
      method: _method,
      headers: _headers,
      body: payload as BodyInit,
      credentials,
      integrity,
      keepalive,
      mode,
      redirect,
      referrer,
      referrerPolicy,
      cache: requestCache,
      window,
    };
    const initObject = this.initFetch<D, T>(url, fetchConfig, { responseType, timeout, timeoutErrorMessage });

    return { ...initObject, config };
  }

  private buildTimeout<T extends ReqStrategyTypes>(
    timeoutOptions: Pick<RequestConfig<T>, "timeout" | "timeoutErrorMessage"> & {
      abortObject: { abort: () => void };
    },
  ) {
    const { timeout, timeoutErrorMessage, abortObject } = timeoutOptions;

    if (!this.typeCheck.isNumber(timeout) || timeout < 1) return;

    const t = setTimeout(() => {
      abortObject.abort();
      clearTimeout(t);
    }, timeout);

    return {
      clearTimer: () => clearTimeout(t),
      TOMessage: timeoutErrorMessage || `time of ${timeout}ms exceeded`,
    };
  }

  private initFetch<D, T extends ReqStrategyTypes>(
    url: string,
    config: RequestInit,
    addition: Pick<RequestConfig<T>, "responseType" | "timeout" | "timeoutErrorMessage">,
  ): Omit<RequestDetail<SelectRequestStrategy<T, D>, T>, "config"> {
    const promiseUninitWarn = () => this.template.warn("promise resolver hasn't been initialized");
    const { responseType, timeout, timeoutErrorMessage } = addition;
    const { method } = config;
    const requestKey = `fetch:${method}:${url}`;

    if (method === "GET" || method === "HEAD") config.body = null;

    // abort
    const abortObject = {
      abort: () => this.template.warn("Failed to abort request."),
    };

    // timout
    const { clearTimer, TOMessage } = this.buildTimeout({ timeout, timeoutErrorMessage, abortObject }) ?? {};

    // request fn
    const request = () => {
      const abortController = new AbortController();
      const signal = abortController.signal;
      abortObject.abort = abortController.abort.bind(abortController);

      return fetch(url, { ...config, signal }) as unknown as Promise<SelectRequestStrategy<T, D>>;
    };

    // promise initialized
    const promiseExecutor: PromiseExecutor<SelectRequestStrategy<T, D>> = {
      resolve: promiseUninitWarn,
      reject: promiseUninitWarn,
    };
    let response: any = null;
    const requestPromise = new Promise<SelectRequestStrategy<T, D>>((_resolve, _reject) => {
      promiseExecutor.resolve = (value: SelectRequestStrategy<T, D>) => {
        _resolve(value as SelectRequestStrategy<T, D>);
        clearTimer?.();
      };

      promiseExecutor.reject = (reason?: unknown) => {
        _reject(reason);
        clearTimer?.();
      };

      abortObject.abort = (reason?: unknown) => {
        if (this.typeCheck.isString(reason)) reason = new Error(reason);
        _reject(reason);
      };
    })
      .then((res) => {
        if (!(res instanceof Response)) return res;

        const type = res.headers.get("Content-Type");

        if (!response) response = {};
        response.url = res.url;
        response.bodyUsed = res.bodyUsed;
        response.headers = res.headers;
        response.ok = res.ok;
        response.redirected = res.redirected;
        response.status = res.status;
        response.statusText = res.statusText;
        response.type = res.type;

        if (type?.includes("json") || responseType === "json") return res.json();
        if (responseType === "blob") return res.blob();
        if (responseType === "arraybuffer") return res.arrayBuffer();
        return res;
      })
      .then((body) => {
        if (!(body instanceof Response) && response) return { ...response, body };

        return body;
      }) as Promise<SelectRequestStrategy<T, D>>;

    const requestWrapper = async () => {
      try {
        promiseExecutor.resolve(await request());
      } catch (error) {
        let _error: Error | null = null;

        if (error instanceof DOMException && error.message.includes("abort") && TOMessage)
          _error = new Error(TOMessage);

        promiseExecutor.reject(_error ?? error);
      }
    };

    const requestExecutor: RequestExecutor<SelectRequestStrategy<T, D>> = (send?: boolean) => {
      if (send) requestWrapper();

      return [requestPromise, abortObject.abort];
    };

    return { requestKey, promiseExecutor, requestExecutor };
  }

  private getHeaders(headers?: Record<string, any>, auth?: Partial<HttpAuthentication>) {
    return merge({}, headers, this.getAuthHeaders(auth));
  }

  private getAuthHeaders(auth?: Partial<HttpAuthentication>) {
    let { password } = auth ?? {};
    const { username } = auth ?? {};

    if (this.typeCheck.isUndefinedOrNull(username) || this.typeCheck.isUndefinedOrNull(password)) return;

    password = decodeURIComponent(encodeURIComponent(password));
    const Authorization = "Basic " + btoa(username + ":" + password);

    return { Authorization };
  }
}
