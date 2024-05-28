import Injectable from "@/decorator/Injectable.decorator";
import { FinalKarman, KarmanConfig, KarmanInstanceConfig } from "@/types/karman.type";
import TypeCheck from "@/utils/type-check.provider";
import PathResolver from "@/utils/path-resolver.provider";
import ScheduledTask from "../scheduled-task/scheduled-task.injectable";
import Karman from "../karman/karman";
import Template from "@/utils/template.provider";
import SchemaType from "../validation-engine/schema-type/schema-type";

@Injectable()
export default class LayerBuilder {
  constructor(
    private readonly typeCheck: TypeCheck,
    private readonly scheduledTask: ScheduledTask,
    private readonly pathResolver: PathResolver,
    private readonly template: Template,
  ) {}

  public configure<A, R>(k: KarmanConfig<A, R>) {
    const {
      root,
      url,
      schema,
      // util config
      validation,
      scheduleInterval,
      rx,
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
      rx,
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

    this.setBuiltInDeps(currentKarman);

    if (this.typeCheck.isObjectLiteral(route))
      Object.entries(route as Record<string, Karman>).forEach(([key, karman]) => {
        karman.$parent = currentKarman;
        Object.defineProperty(currentKarman, key, { value: karman, enumerable: true });
      });

    if (this.typeCheck.isObjectLiteral(api))
      Object.entries(api as Record<string, Function>).forEach(([key, value]) => {
        Object.defineProperty(currentKarman, key, {
          value: value.bind(currentKarman),
          enumerable: true,
        });
      });

    this.setSchema(currentKarman, schema);

    return currentKarman as FinalKarman<A, R>;
  }

  private createKarman(k: KarmanInstanceConfig): Karman {
    return new Karman(k);
  }

  private setSchema(k: Karman, schema?: SchemaType[]) {
    schema?.forEach((s) => k.$schema.set(s.name, s));
  }

  private setBuiltInDeps(k: Karman) {
    k._pathResolver ??= this.pathResolver;
    k._typeCheck ??= this.typeCheck;
  }
}
