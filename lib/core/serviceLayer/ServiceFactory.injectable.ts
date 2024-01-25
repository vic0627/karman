import type { RequestConfig } from "src/types/xhr.type";
import type {
  FinalApiConfig,
  InheritConfig,
  OverwriteConfig,
  ServiceApiConfig,
  ServiceConfigChild,
  ServiceConfigRoot,
} from "src/types/userService.type";
import Injectable from "src/decorator/Injectable.decorator";
import Service from "../../classes/Service";
import APIFactory from "../requestHandler/APIFactory.injectable";
import { deepClone, notNull } from "src/utils/common";
import ScheduledTask from "../scheduledTask/ScheduledTask.provider";
import Path from "src/utils/Path.provider";
import TypeLib from "../validationEngine/TypeLib.provider";
import { Payload } from "src/types/ruleObject.type";

/**
 * 抽象層建立、配置繼承與複寫
 * @todo 新增 `DecodeTime.provider.ts` 來轉換 `${days}d${hour}h${minute}m${second}s${millisecond}ms` 格式字串成數字
 */

@Injectable()
export default class ServiceFactory {
  /** 當前處理節點是否為根節點(有 baseURL 的節點) */
  #root = true;

  constructor(
    private readonly typeLib: TypeLib,
    private readonly path: Path,
    private readonly apiFactory: APIFactory,
    private readonly scheduledTask: ScheduledTask,
  ) {}

  createService(serviceConfig: ServiceConfigRoot) {
    this.#root = true;

    // 先建構根節點
    const service = this.#buildServiceTree({ serviceConfig });

    this.typeLib.initLib();

    return service;
  }

  /**
   * 建立抽象層節點
   * @description 節點將以有 `baseURL` 或 `route` 屬性的該層物件為基準建立，但若子節點(route)上只有一個 Final API，會將此 API 掛載至父層節點，將不另建節點。
   */
  #buildServiceTree(config: {
    serviceConfig: ServiceConfigRoot | ServiceConfigChild;
    parent?: Service;
    parentConfig?: InheritConfig;
  }) {
    const { serviceConfig, parent, parentConfig = {} } = config;

    // 1. 路由參數守衛
    this.#routeGuard((serviceConfig as ServiceConfigRoot).baseURL, (serviceConfig as ServiceConfigChild).route);

    // 2. 配置繼承與複寫
    const parentConfigCopy = deepClone(parentConfig) as InheritConfig | {};
    const overwriteConfig = Object.assign(parentConfigCopy, serviceConfig) as OverwriteConfig;
    const {
      name,
      // description,
      api,
      children,
      route,
      scheduledInterval,
    } = overwriteConfig;

    // 3. 解構配置
    const { nodeConfig, reqConfig } = this.#destructureConfig(overwriteConfig);

    // 4. 建立 Service 抽象層節點
    const service = new Service();

    service._parent = parent;

    if (this.#root) {
      this.scheduledTask.setInterval(scheduledInterval, service);

      service._name = name;
    } else {
      service._name = name ?? this.#getFirstRoute(route);
    }

    if (!service._name) {
      throw new Error("Name is required");
    }

    service._config = overwriteConfig;

    // 5. 解析 API 配置
    this.#buildAPI(service, reqConfig, api);

    // 6. 解析子路由
    this.#buildChildren(service, children, nodeConfig);

    // 7. 返回節點實例
    return service;
  }

  #destructureConfig(serviceConfig: ServiceConfigRoot | ServiceConfigChild) {
    const { auth, headers, proxy } = serviceConfig;

    let _baseURL: string;

    const baseURL = (serviceConfig as ServiceConfigRoot).baseURL;
    const route = (serviceConfig as ServiceConfigChild).route;

    if (baseURL && route) {
      _baseURL = this.path.join(baseURL, route);
    } else {
      _baseURL = baseURL as string;
    }

    // console.log(_baseURL);

    const basicConfig = {
      ...serviceConfig,
      auth: { ...auth },
      headers: { ...headers },
      proxy: { ...proxy },
    };

    // 一定要刪除不繼承的屬性，尤其會造成 maximum callstack exceeded 的屬性
    delete basicConfig.name;
    delete basicConfig.description;
    delete basicConfig.children;
    delete basicConfig.api;

    if ((basicConfig as ServiceConfigRoot)?.baseURL) {
      delete (basicConfig as Partial<ServiceConfigRoot>).baseURL;
    }

    const nodeConfig = Object.assign({ baseURL: _baseURL }, basicConfig) as InheritConfig;

    const reqConfig = Object.assign({ url: _baseURL }, basicConfig) as RequestConfig;

    return { nodeConfig, reqConfig };
  }

  /**
   * 路由守衛
   * @description `baseURL` 僅能出現在根節點; `route` 僅能出現在子節點。
   */
  #routeGuard(baseURL?: string, route?: string) {
    if (this.#root) {
      if (!baseURL || typeof baseURL !== "string") {
        throw new Error("BaseURL is required in root service");
      }

      this.#root = false;
    } else {
      if (!route || typeof route !== "string") {
        throw new Error("Route is required in children service");
      }

      if (baseURL) {
        throw new Error("BaseURL is only configurable in root service");
      }
    }
  }

  /**
   * 取得第一層路徑
   */
  #getFirstRoute(route?: string) {
    if (!route) {
      return;
    }

    const [firstRoute] = this.path.antiSlash(route);

    return firstRoute;
  }

  /**
   * 建構 Final API
   * @param service Service 節點實例
   * @param defaultConfig 截至 Service 層的配置
   * @param api Service 層的 API 配置
   */
  #buildAPI(service: Service, defaultConfig: RequestConfig, api?: ServiceApiConfig | ServiceApiConfig[]) {
    const build = (config: ServiceApiConfig) => {
      const value = (payload: Payload = {}, requestConfig: FinalApiConfig = {}) =>
        this.apiFactory.createAPI(config, defaultConfig)(payload, requestConfig, service);

      if (!config.name) {
        throw new Error("Name is required");
      }

      Object.defineProperty(service, config.name, { value });
    };

    if (Array.isArray(api)) {
      api.forEach((config) => {
        build(config);
      });
    } else if (typeof api === "object" && api !== null) {
      build(api);
    }
  }

  /**
   * 建構 Service 子節點
   * @param service Service 節點實例
   * @param children 子路由配置
   * @param parentConfig 截至 Service 層的配置
   */
  #buildChildren(service: Service, children?: ServiceConfigChild[], parentConfig?: InheritConfig) {
    // 1. children 型別檢查
    if (!notNull(children)) {
      return;
    }

    const isArray = Array.isArray(children);

    if (!isArray) {
      throw new Error("Children must be an array");
    }

    /** 辨別子路由是否只有一個方法的函式 */
    const singleMethod = (children: ServiceConfigChild) => !children?.children && !Array.isArray(children?.api);

    if (!children.length) {
      return;
    }

    children.forEach((child) => {
      if (singleMethod(child)) {
        // 2. 如果子路由只有一個方法，將它掛載到當前節點
        const { name, value } = this.#buildSingleMethod(child, parentConfig as InheritConfig, service);

        Object.defineProperty(service, name, {
          value,
        });
      } else {
        // 3. 如果子路由有多個方法，另建 Service 節點，並將該節點掛載至此節點之下。
        const value = this.#buildServiceTree({
          serviceConfig: child,
          parent: service,
          parentConfig,
        });

        Object.defineProperty(service, value._name as string, {
          value,
          enumerable: true,
        });
      }
    });
  }

  /**
   * 由子路由配置層直接建立單個方法
   * @param child 子路由配置
   * @param parentConfig 上層 Service 的配置
   */
  #buildSingleMethod(child: ServiceConfigChild, parentConfig: InheritConfig, service: Service) {
    const { route, api } = child;
    const { baseURL } = parentConfig;

    const url = this.path.join(baseURL, route);

    const configCopy = deepClone(parentConfig);

    Object.assign(configCopy, child);

    configCopy.url = url;

    const name = (api as ServiceApiConfig)?.name ?? child.name ?? this.#getFirstRoute(route);

    if (!name) {
      throw new Error("Name or route must required when defining single method");
    }

    const value = (payload: Payload = {}, requestConfig: FinalApiConfig = {}) =>
      this.apiFactory.createAPI(api as ServiceApiConfig, configCopy)(payload, requestConfig, service);

    return { name, value };
  }
}
