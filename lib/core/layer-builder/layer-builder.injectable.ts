import Injectable from "@/decorator/Injectable.decorator";
import { KarmanConfig } from "@/types/karman/karman.type";
import TypeCheck from "@/utils/type-check.provider";
import KarmanFactory from "../karman/karman-factory.injectable";
import PathResolver from "@/utils/path-rosolver.provider";

@Injectable()
export default class LayerBuilder {
  constructor(
    private readonly typeCheck: TypeCheck,
    private readonly pathResolver: PathResolver,
    private readonly karmanFactory: KarmanFactory,
  ) {}

  public configure(k: KarmanConfig) {
    const {
      url,
      validation,
      scheduleInterval,
      cache,
      cacheExpireTime,
      cacheStrategy,
      headers,
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headerMap,
      withCredentials,
      requestStrategy,
      api,
      route = {},
      onBeforeValidate,
      onValidateError,
      onBeforeRequest,
      onSuccess,
      onError,
      onFinally,
    } = k;

    const karmanInstance = this.karmanFactory.create({
      url,
      validation,
      scheduleInterval,
      cache,
      cacheExpireTime,
      cacheStrategy,
      headers,
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headerMap,
      withCredentials,
      requestStrategy,
      onBeforeValidate,
      onValidateError,
      onBeforeRequest,
      onSuccess,
      onError,
      onFinally,
    });

    Object.entries(route).forEach(([key, karman]) => {
      karman.$parent = karmanInstance;
      karman.$baseURL = this.pathResolver.resolve(karmanInstance.$baseURL, karman.$baseURL);
      Object.defineProperty(karmanInstance, key, { value: karman });
    });
  }
}
