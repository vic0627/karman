import Injectable from "@/decorator/Injectable.decorator";
import { FinalKarman, KarmanConfig, KarmanInstanceConfig } from "@/types/karman.type";
import TypeCheck from "@/utils/type-check.provider";
import PathResolver from "@/utils/path-resolver.provider";
import ScheduledTask from "../scheduled-task/scheduled-task.injectable";
import Karman from "../karman/karman";
import Template from "@/utils/template.provider";

@Injectable()
export default class LayerBuilder {
  constructor(
    private readonly typeCheck: TypeCheck,
    private readonly scheduledTask: ScheduledTask,
    private readonly pathResolver: PathResolver,
    private readonly template: Template,
  ) {}

  public configure<A extends unknown, R extends unknown>(k: KarmanConfig<A, R>) {
    const {
      root,
      url,
      // util config
      validation,
      scheduleInterval,
      // cache config
      cache,
      cacheExpireTime,
      cacheStrategy,
      // request config
      headers,
      auth,
      timeout,
      timeoutErrorMessage,
      responseType,
      headerMap,
      withCredentials,
      credentials,
      integrity,
      keepalive,
      mode,
      redirect,
      referrer,
      referrerPolicy,
      requestCache,
      window,
      // hooks
      onRequest,
      onResponse,
      // dependent types
      api,
      route,
    } = k;

    const currentKarman = this.createKarman({
      root,
      url,
      validation,
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
      credentials,
      integrity,
      keepalive,
      mode,
      redirect,
      referrer,
      referrerPolicy,
      requestCache,
      window,
      onRequest,
      onResponse,
    });

    currentKarman.$setDependencies(this.typeCheck, this.pathResolver);

    if (this.typeCheck.isObjectLiteral(route))
      Object.entries(route as Record<string, Karman>).forEach(([key, karman]) => {
        if (karman.$root)
          this.template.throw("Detected that the 'root' property is set to 'true' on a non-root Karman node.");

        karman.$parent = currentKarman;
        Object.defineProperty(currentKarman, key, { value: karman, enumerable: true });
      });

    if (this.typeCheck.isObjectLiteral(api))
      Object.entries(api as Record<string, Function>).forEach(([key, value]) => {
        Object.defineProperty(currentKarman, key, {
          value: currentKarman.$requestGuard(value.bind(currentKarman)),
          enumerable: true,
        });
      });

    if (root) {
      this.scheduledTask.setInterval(scheduleInterval);
      currentKarman.$inherit();
    }

    return currentKarman as FinalKarman<A, R>;
  }

  private createKarman(k: KarmanInstanceConfig): Karman {
    return new Karman(k);
  }
}
