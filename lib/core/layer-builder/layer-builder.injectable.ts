import Injectable from "@/decorator/Injectable.decorator";
import { APIs, FinalKarman, KarmanConfig, Routes } from "@/types/karman/karman.type";
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

  public configure<A extends APIs, R extends Routes>(k: KarmanConfig<A, R>) {
    const {
      baseURL,
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
      api = {},
      route = {},
    } = k;

    const currentKarman = this.karmanFactory.create({
      baseURL,
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

    currentKarman.$setDependencies(this.typeCheck, this.pathResolver);

    Object.entries(route as R).forEach(([key, karman]) => {
      karman.$parent = currentKarman;
      Object.defineProperty(currentKarman, key, { value: karman, enumerable: true });
    });

    Object.entries(api as A).forEach(([key, value]) => {
      Object.defineProperty(currentKarman, key, { value: value.bind(currentKarman), enumerable: true });
    });

    return currentKarman as FinalKarman<A, R>;
  }
}
