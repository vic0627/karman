import { META_EXPOSE } from "src/assets/METADATA";
import { ClassDecorator } from "src/types/common.type";

/**
 * @deprecated Define metadata that represents which targets should be exposed to the IoC.
 * @param name The module name that needs to be registered.
 */
export default function Expose(name?: string): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(META_EXPOSE, name ?? target.name, target);
  };
}
