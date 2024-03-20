import RequestStrategy, { SelectRequestStrategy } from "@/abstract/request-strategy.abstract";
import Xhr from "../request-strategy/xhr.injectable";
import TypeCheck from "@/utils/type-check.provider";
import { RuntimeOptions } from "@/types/final-api.type";
import Karman from "../karman/karman";
import { ApiConfig, HttpBody, ReqStrategyTypes, RequestConfig, RequestExecutor } from "@/types/http.type";
import PathResolver from "@/utils/path-rosolver.provider";
import { CacheConfig, UtilConfig } from "@/types/karman.type";
import { AsyncHooks, KarmanInterceptors, SyncHooks } from "@/types/hooks.type";
import { configInherit } from "../out-of-paradigm/config-inherit";
import ValidationEngine from "../validation-engine/validation-engine.injectable";
import CachePipe from "./request-pipe/cache-pipe.injectable";
import Injectable from "@/decorator/Injectable.decorator";
import { PayloadDef } from "@/types/payload-def.type";
import { isEqual, cloneDeep } from "lodash-es";

export type ApiReturns<D> = [resPromise: Promise<D>, abortControler: () => void];

export interface ParsedRuntimeOptions<T extends ReqStrategyTypes> {
  $$$requestConfig: RequestConfig<T>;
  $$$cacheConfig: CacheConfig;
  $$$utilConfig: UtilConfig;
  $$$hooks: AsyncHooks & SyncHooks;
}

export interface ParsedCreatedOptions<T extends ReqStrategyTypes> {
  $$requestConfig: RequestConfig<T>;
  $$cacheConfig: CacheConfig;
  $$utilConfig: UtilConfig;
  $$hooks: AsyncHooks & SyncHooks;
}

export interface AllConfigCache<D, T extends ReqStrategyTypes>
  extends Pick<ApiConfig<D, T, PayloadDef>, "endpoint" | "method" | "payloadDef"> {
  baseURL?: string;
  requestConfig?: RequestConfig<T>;
  cacheConfig?: CacheConfig;
  utilConfig?: UtilConfig;
  hooks?: AsyncHooks & SyncHooks;
  interceptors?: KarmanInterceptors;
}

export interface PreqBuilderOptions<D, T extends ReqStrategyTypes>
  extends Required<Pick<AllConfigCache<D, T>, "baseURL" | "endpoint" | "payloadDef">> {
  payload: Record<string, any>;
}

@Injectable()
export default class ApiFactory {
  constructor(
    private readonly typeCheck: TypeCheck,
    private readonly pathResolver: PathResolver,
    private readonly validationEngine: ValidationEngine,
    private readonly xhr: Xhr,
    private readonly cachePipe: CachePipe,
  ) {}

  // 調用時還不會接收到完整的配置
  public createAPI<D, T extends ReqStrategyTypes, P extends PayloadDef>(apiConfig: ApiConfig<D, T, P>) {
    // destructure
    const { $$apiConfig, $$requestConfig, $$cacheConfig, $$utilConfig, $$hooks } = this.apiConfigParser(apiConfig);
    // delegate
    const _af = this as ApiFactory;
    // caching
    let runtimeOptionsCache: ParsedRuntimeOptions<ReqStrategyTypes> | null = null;
    const allConfigCache: AllConfigCache<D, T> = $$apiConfig;

    const setRuntimeOptionsCache = (cache: ParsedRuntimeOptions<ReqStrategyTypes>) => {
      runtimeOptionsCache = cache;
    };

    function finalAPI<T2 extends ReqStrategyTypes>(
      this: Karman,
      payload: { [K in keyof P]: any },
      runtimeOptions?: RuntimeOptions<T2>,
    ): [requestPromise: Promise<SelectRequestStrategy<T, D>>, abortController: () => void] {
      const runtimeOptionsCopy = _af.runtimeOptionsParser(runtimeOptions);
      if (_af.typeCheck.isUndefinedOrNull(payload)) payload = {} as { [K in keyof P]: any };

      _af.configInheritance.call(this, {
        allConfigCache,
        runtimeOptions: runtimeOptionsCopy,
        runtimeCache: runtimeOptionsCache,
        createdOptions: { $$requestConfig, $$cacheConfig, $$utilConfig, $$hooks },
        setRuntimeCache: setRuntimeOptionsCache,
      });

      const {
        endpoint = "",
        method = "GET",
        payloadDef = {},
        baseURL = "",
        requestConfig = {},
        cacheConfig,
        utilConfig,
        hooks,
        interceptors,
      } = allConfigCache;
      const { requestStrategy = "xhr", headers } = requestConfig;
      const { validation } = utilConfig ?? {};
      const { onBeforeValidate, onBeforeRequest, onError, onFinally, onSuccess } = hooks ?? {};
      const { onRequest, onResponse } = interceptors ?? {};

      // 1. validation
      if (validation) {
        if (_af.typeCheck.isFunction(onBeforeValidate)) onBeforeValidate.call(this, payloadDef, payload);
        const validator = _af.validationEngine.getMainValidator(payload, payloadDef);
        validator();
      }

      let _payload: HttpBody = payload as HttpBody;

      if (_af.typeCheck.isFunction(onBeforeRequest)) {
        _payload = (onBeforeRequest.call(this, endpoint, _payload) as HttpBody) ?? (payload as HttpBody);
      }

      // 2. parameter builder
      const [requestURL, requestBody] = _af.preqBuilder.call(_af, {
        baseURL,
        endpoint,
        payload: _payload as Record<string, any>,
        payloadDef,
      });

      const _requestBody =
        headers?.["Content-Type"]?.includes("json") && _af.typeCheck.isObjectLiteral(requestBody)
          ? JSON.stringify(requestBody)
          : requestBody;

      const httpConfig = {
        url: requestURL,
        method,
        ...requestConfig,
      };

      onRequest?.call(this, httpConfig);

      // 3. request sending
      const reqStrategy = _af.requestStrategySelector(requestStrategy);
      const { requestKey, requestExecutor, promiseExecutor, config } = reqStrategy.request<D, T>(
        _requestBody as HttpBody,
        {
          url: requestURL,
          method,
          ...requestConfig,
        },
      );

      // 5. cache pipe
      if (cacheConfig?.cache) {
        const { cacheExpireTime, cacheStrategy } = cacheConfig;
        const executer = _af.cachePipe.chain(
          { requestKey, requestExecutor, promiseExecutor, config, payload },
          { cacheStrategyType: cacheStrategy, expiration: cacheExpireTime },
        );
        const [chainPromise, abortController] = executer();
        const _chainPromise = _af.installHooks(this, chainPromise, { onSuccess, onError, onFinally, onResponse });

        return [_chainPromise, abortController];
      }

      const [requestPromise, abortController] = requestExecutor(true);
      const _requestPromise = _af.installHooks(this, requestPromise, { onSuccess, onError, onFinally, onResponse });

      return [_requestPromise, abortController];
    }

    return finalAPI;
  }

  private configInheritance<D>(
    this: Karman,
    options: {
      allConfigCache: AllConfigCache<D, ReqStrategyTypes>;
      runtimeOptions: ParsedRuntimeOptions<ReqStrategyTypes>;
      createdOptions: ParsedCreatedOptions<ReqStrategyTypes>;
      runtimeCache: ParsedRuntimeOptions<ReqStrategyTypes> | null;
      setRuntimeCache: (cache: ParsedRuntimeOptions<ReqStrategyTypes>) => void;
    },
  ) {
    const { allConfigCache, runtimeOptions, createdOptions, runtimeCache, setRuntimeCache } = options;
    const { $$requestConfig, $$cacheConfig, $$hooks, $$utilConfig } = createdOptions;

    if (!isEqual(runtimeCache, runtimeOptions)) {
      setRuntimeCache(runtimeOptions);
      const { $$$requestConfig, $$$cacheConfig, $$$utilConfig, $$$hooks } = runtimeOptions;
      const { $baseURL, $requestConfig, $cacheConfig, $interceptors } = this;
      const $utilConfig = { validation: this.$validation } as UtilConfig;
      const requestConfig = configInherit($requestConfig, $$requestConfig, $$$requestConfig);
      const cacheConfig = configInherit($cacheConfig, $$cacheConfig, $$$cacheConfig);
      const utilConfig = configInherit($utilConfig, $$utilConfig, $$$utilConfig);
      const hooks = configInherit($$hooks, $$$hooks);

      allConfigCache.baseURL = $baseURL;
      allConfigCache.requestConfig = requestConfig as RequestConfig<ReqStrategyTypes>;
      allConfigCache.cacheConfig = cacheConfig;
      allConfigCache.utilConfig = utilConfig;
      allConfigCache.hooks = hooks;
      allConfigCache.interceptors = $interceptors;
    }
  }

  private preqBuilder<D, T extends ReqStrategyTypes>(
    preqBuilderOptions: PreqBuilderOptions<D, T>,
  ): [requestURL: string, requestBody: Record<string, any>] {
    const { baseURL, endpoint, payloadDef, payload } = preqBuilderOptions;
    const urlSources: string[] = [baseURL, endpoint];
    const pathParams: string[] = [];
    const queryParams: Record<string, string> = {};
    const requestBody: Record<string, any> = {};

    Object.entries(payloadDef).forEach(([param, def]) => {
      const { path, query, body } = def;
      const value = payload[param as keyof typeof payload];

      if (this.typeCheck.isUndefinedOrNull(value)) return;

      if (this.typeCheck.isNumber(path) && path >= 0) pathParams[path] = `${value}`;
      if (query) queryParams[param] = value;
      if (body) requestBody[param] = value;
    });

    urlSources.push(...pathParams.filter((p) => p));
    // console.warn(urlSources, queryParams);
    const requestURL = this.pathResolver.resolveURL({ paths: urlSources, query: queryParams });

    return [requestURL, requestBody];
  }

  private successChaining<T extends ReqStrategyTypes, D>(k: Karman, onSuccess?: (res: Response) => any) {
    return (res: SelectRequestStrategy<T, D>) =>
      new Promise((resolve) => {
        if (this.typeCheck.isFunction(onSuccess)) resolve(onSuccess.call(k, res as Response));
        else resolve(res);
      });
  }

  private installHooks<D, T extends ReqStrategyTypes>(
    k: Karman,
    reqPromise: Promise<SelectRequestStrategy<T, D>>,
    { onSuccess, onError, onFinally, onResponse }: AsyncHooks & Pick<KarmanInterceptors, "onResponse">,
  ) {
    return reqPromise
      .then((res) => {
        if (this.typeCheck.isFunction(onResponse)) onResponse.call(k, res as any);
        return res;
      })
      .then(
        (res) =>
          new Promise((resolve) => {
            if (this.typeCheck.isFunction(onSuccess)) resolve(onSuccess.call(k, res as Response));
            else resolve(res);
          }),
      )
      .catch(
        (err) =>
          new Promise((resolve, reject) => {
            if (this.typeCheck.isFunction(onError)) resolve(onError.call(k, err));
            else reject(err);
          }),
      )
      .finally(
        () =>
          new Promise((resolve) => {
            if (this.typeCheck.isFunction(onFinally)) resolve(onFinally.call(this));
            else resolve(void 0);
          }),
      ) as Promise<SelectRequestStrategy<T, D>>;
  }

  private requestStrategySelector(requestStrategy?: ReqStrategyTypes): RequestStrategy {
    if (requestStrategy === "xhr" && !this.typeCheck.isUndefinedOrNull(XMLHttpRequest)) return this.xhr;
    else if (requestStrategy === "fetch" && !this.typeCheck.isUndefinedOrNull(fetch)) return this.xhr;
    else throw new Error("strategy not found.");
  }

  private runtimeOptionsParser<T extends ReqStrategyTypes>(runtimeOptions?: RuntimeOptions<T>) {
    // 優先權最高
    const {
      // RequestConfig
      headers,
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headerMap,
      withCredentials,
      requestStrategy,
      // CacheConfig
      cache,
      cacheExpireTime,
      cacheStrategy,
      // UtilConfig
      validation,
      // hooks
      onBeforeValidate,
      onBeforeRequest,
      onSuccess,
      onError,
      onFinally,
    } = runtimeOptions ?? {};

    const $$$requestConfig = {
      headers,
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headerMap,
      withCredentials,
      requestStrategy,
    } as RequestConfig<T>;

    const $$$cacheConfig = {
      cache,
      cacheExpireTime,
      cacheStrategy,
    } as CacheConfig;

    const $$$utilConfig = { validation } as UtilConfig;

    const $$$hooks = {
      onBeforeValidate,
      onBeforeRequest,
      onSuccess,
      onError,
      onFinally,
    } as AsyncHooks & SyncHooks;

    return cloneDeep({
      $$$requestConfig,
      $$$cacheConfig,
      $$$utilConfig,
      $$$hooks,
    });
  }

  private apiConfigParser<D, T extends ReqStrategyTypes, P extends PayloadDef>(apiConfig?: ApiConfig<D, T, P>) {
    // 優先權中等
    const {
      // ApiConfig
      endpoint,
      method,
      payloadDef,
      // RequestConfig
      headers,
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headerMap,
      withCredentials,
      requestStrategy,
      // CacheConfig
      cache,
      cacheExpireTime,
      cacheStrategy,
      // UtilConfig
      validation,
      scheduleInterval,
      // hooks
      onBeforeValidate,
      onBeforeRequest,
      onSuccess,
      onError,
      onFinally,
    } = apiConfig ?? {};

    const $$apiConfig = {
      endpoint,
      method,
      payloadDef,
    };

    const $$requestConfig = {
      headers,
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headerMap,
      withCredentials,
      requestStrategy,
    } as RequestConfig<T>;

    const $$cacheConfig = {
      cache,
      cacheExpireTime,
      cacheStrategy,
    } as CacheConfig;

    const $$utilConfig = {
      validation,
      scheduleInterval,
    } as UtilConfig;

    const $$hooks = {
      onBeforeValidate,
      onBeforeRequest,
      onSuccess,
      onError,
      onFinally,
    } as AsyncHooks & SyncHooks;

    return cloneDeep({ $$apiConfig, $$requestConfig, $$cacheConfig, $$utilConfig, $$hooks });
  }
}
