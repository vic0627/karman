import type { ClassDecorator, ClassSignature } from "src/types/common.type";
import type { Provider, Importer } from "src/types/ioc.type";
import type { IOCOptions } from "src/types/decorator.type";
import { META_PARAMTYPES, META_EXPOSE } from "src/assets/METADATA";

/**
 * Inversion of control container
 * @param options
 */
export default function IOCContainer(options: IOCOptions = {}): ClassDecorator {
  const { provides, imports } = options;

  return (target) => {
    /**
     * 需要直接暴露在 IoC 容器實例上的功能模組
     */
    const exposeModules = new Map<string, {}>();

    /**
     * provides 的 token 與實例陣列
     */
    const providers = (provides?.map((slice: ClassSignature) => {
      const expose = (Reflect.getMetadata(META_EXPOSE, slice) ?? "") as string;
      const value = new slice();

      if (expose) {
        exposeModules.set(expose, value);
      }

      return [Symbol.for(slice.toString()), value];
    }) ?? []) as Provider[];

    /**
     * imports 的 token、建構函數與其所需依賴
     */
    const importers = (imports?.map((slice) => {
      const token = Symbol.for(slice.toString());

      const deps = (Reflect.getMetadata(META_PARAMTYPES, slice) ?? []) as ClassSignature[];

      const requirements = deps.map((dep: ClassSignature) => Symbol.for(dep.toString()));

      return [
        token,
        {
          constructor: slice,
          requirements,
        },
      ];
    }) ?? []) as Importer[];

    /**
     * 作為 Ioc 容器的類本身所需的依賴
     */
    const targetDep = (Reflect.getMetadata(META_PARAMTYPES, target) ?? []) as ClassSignature[];

    const targetDepToken = (targetDep?.map((dep: ClassSignature) => Symbol.for(dep.toString())) ?? []) as symbol[];

    /**
     * 已建立的實例
     */
    const instances = new Map(providers);
    /**
     * 等待建立的實例
     */
    const queue = new Map(importers);

    /**
     * 當還有未被建立實例的類，就持續遍歷 queue
     */
    while (queue.size) {
      const cacheSize = queue.size;

      queue.forEach(({ constructor, requirements }, token) => {
        const deps: {}[] = [];

        let stop = false;

        for (const token of requirements) {
          const dep = instances.get(token) as {} | undefined;

          if (!dep) {
            stop = true;
            break;
          }

          deps.push(dep);
        }

        if (stop) {
          return;
        }

        const value = new constructor(...(deps || []));

        const expose = (Reflect.getMetadata(META_EXPOSE, constructor) ?? "") as string;

        if (expose) {
          exposeModules.set(expose, value);
        }

        instances.set(token, value);

        queue.delete(token);
      });

      if (cacheSize === queue.size) {
        /**
         * 跑到這裡代表有依賴沒被傳入 IoC
         */
        console.warn("Missing dependency.");
        break;
      }
    }

    /**
     * 裝飾器最終會返回原類別的繼承類
     */
    return class IoC extends target {
      constructor(...args: any[]) {
        /**
         * 給 IoC 注入所需依賴
         */
        const injections = targetDepToken.map((token: symbol) => {
          const dep = instances.get(token);

          if (dep) {
            return dep;
          }

          throw new Error("Missing dependency.");
        });

        super(...injections);

        /**
         * 掛載要暴露的功能模組
         */
        exposeModules.forEach((value, name) => {
          Object.defineProperty(this, name, {
            value,
          });
        });
      }
    };
  };
}
