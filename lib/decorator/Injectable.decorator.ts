import { ClassSignature } from "src/types/common.type";
import { META_PARAMTYPES } from "src/assets/METADATA";
import { ClassDecorator } from "src/types/common.type";

/**
 * Record all the dependencies required by the target.
 * Only the module which is decorated by this function can be injected correctly.
 */
export default function Injectable(): ClassDecorator {
  return (target) => {
    const dependencies = (Reflect.getMetadata(META_PARAMTYPES, target) ?? []) as ClassSignature[];

    Reflect.defineMetadata(META_PARAMTYPES, dependencies, target);
  };
}
