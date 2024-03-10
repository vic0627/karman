import RequestStrategy, { SelectRequestStrategy } from "@/abstract/request-strategy.abstract";
import Xhr from "../request-strategy/xhr.injectable";
import TypeCheck from "@/utils/type-check.provider";
import Template from "@/utils/template.provider";
import { RuntimeOptions } from "@/types/karman/final-api.type";
import Karman from "../karman/karman";
import { ApiConfig, HttpBody, ReqStrategyTypes, RequestConfig } from "@/types/karman/http.type";
import PathResolver from "@/utils/path-rosolver.provider";
import { CacheConfig, UtilConfig } from "@/types/karman/karman.type";
import { AsyncHooks, SyncHooks } from "@/types/karman/hooks.type";
import { configInherit } from "../out-of-paradigm/config-inherit";
import ValidationEngine from "../validation-engine/validation-engine.injectable";
import CachePipe from "./request-pipe/cache-pipe.injectable";
import Injectable from "@/decorator/Injectable.decorator";
import { PayloadDef } from "@/types/karman/payload-def.type";
// import * as _ from "lodash";

declare const _: typeof import("lodash");

export type ApiReturns<D> = [resPromise: Promise<D>, abortControler: () => void];

export interface ParsedRuntimeOptions<T extends ReqStrategyTypes> {
  $$$requestConfig: RequestConfig<T>;
  $$$cacheConfig: CacheConfig;
  $$$utilConfig: UtilConfig;
  $$$hooks: AsyncHooks & SyncHooks;
}

export interface AllConfigCache<D, T extends ReqStrategyTypes>
  extends Pick<ApiConfig<D, T, PayloadDef>, "endpoint" | "method" | "payloadDef"> {
  baseURL?: string;
  requestConfig?: RequestConfig<T>;
  cacheConfig?: CacheConfig;
  utilConfig?: UtilConfig;
  hooks?: AsyncHooks & SyncHooks;
}

export interface PreqBuilderOptions<D, T extends ReqStrategyTypes>
  extends Required<Pick<AllConfigCache<D, T>, "baseURL" | "endpoint" | "payloadDef">> {
  payload: Record<string, any>;
}

@Injectable()
export default class ApiFactory {
  constructor(
    private readonly template: Template,
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

    /**
     * @param this
     * @param payload
     * @param runtimeOptions
     * @returns
     */
    function finalAPI<T2 extends ReqStrategyTypes>(
      this: Karman,
      payload: { [K in keyof P]: any },
      runtimeOptions?: RuntimeOptions<T2>,
    ): [requestPromise: Promise<SelectRequestStrategy<T, D>>, abortController: () => void] {
      const runtimeOptionsCopy = _af.runtimeOptionsParser(runtimeOptions);

      // config inheritance and caching
      if (!_.isEqual(runtimeOptionsCache, runtimeOptionsCopy)) {
        runtimeOptionsCache = runtimeOptionsCopy;
        const { $$$requestConfig, $$$cacheConfig, $$$utilConfig, $$$hooks } = runtimeOptionsCopy;
        const { $baseURL, $requestConfig, $cacheConfig, $hooks } = this;
        const $utilConfig = { validation: this.$validation } as UtilConfig;
        const requestConfig = configInherit($requestConfig, $$requestConfig, $$$requestConfig);
        const cacheConfig = configInherit($cacheConfig, $$cacheConfig, $$$cacheConfig);
        const utilConfig = configInherit($utilConfig, $$utilConfig, $$$utilConfig);
        const hooks = configInherit($hooks, $$hooks, $$$hooks);

        allConfigCache.baseURL = $baseURL;
        allConfigCache.requestConfig = requestConfig as RequestConfig<T>;
        allConfigCache.cacheConfig = cacheConfig;
        allConfigCache.utilConfig = utilConfig;
        allConfigCache.hooks = hooks;
      }

      const {
        endpoint = "",
        method = "GET",
        payloadDef = {},
        baseURL = "",
        requestConfig = {},
        cacheConfig,
        utilConfig,
        hooks,
      } = allConfigCache;
      const { requestStrategy } = requestConfig;
      const { validation } = utilConfig ?? {};
      const { onBeforeValidate, onValidateError, onBeforeRequest } = hooks ?? {};

      // 1. validation
      if (validation) {
        if (!payloadDef) {
          _af.template.warn("validation set to true, but no payloadDef is received.");
        } else {
          try {
            if (_af.typeCheck.isFunction(onBeforeValidate)) onBeforeValidate.call(this, payloadDef, payload);
            const validator = _af.validationEngine.getMainValidator(payload, payloadDef);
            validator();
          } catch (error) {
            if (_af.typeCheck.isFunction(onValidateError)) onValidateError.call(this, error as Error);
            else throw error;
          }
        }
      }

      // 2. parameter builder
      const [requestURL, requestBody] = _af.preqBuilder.call(_af, { baseURL, endpoint, payload, payloadDef });

      let _payload: HttpBody = requestBody as HttpBody;

      if (_af.typeCheck.isFunction(onBeforeRequest)) {
        _payload = onBeforeRequest.call(this, requestURL, requestBody) as HttpBody;
      }

      // 3. request sending
      const reqStrategy = _af.requestStrategySelector(requestStrategy);
      const { requestKey, requestExecutor, promiseExecutor, config } = reqStrategy.request<D, T>(_payload, {
        url: requestURL,
        method,
        ...requestConfig,
      });
      const [requestPromise, abortController] = requestExecutor();

      if (cacheConfig?.cache) {
        const { cacheExpireTime, cacheStrategy } = cacheConfig;
        const executer = _af.cachePipe.chain(
          { requestKey, requestExecutor, promiseExecutor, config, payload },
          { cacheStrategyType: cacheStrategy, expiration: cacheExpireTime },
        );

        return executer();
      }

      return [requestPromise, abortController];
    }

    return finalAPI;
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
      onValidateError,
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
      onValidateError,
      onBeforeRequest,
      onSuccess,
      onError,
      onFinally,
    } as AsyncHooks & SyncHooks;

    return _.cloneDeep({
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
      onValidateError,
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
      onValidateError,
      onBeforeRequest,
      onSuccess,
      onError,
      onFinally,
    } as AsyncHooks & SyncHooks;

    return _.cloneDeep({ $$apiConfig, $$requestConfig, $$cacheConfig, $$utilConfig, $$hooks });
  }
}
