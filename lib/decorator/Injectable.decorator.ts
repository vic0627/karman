import { ClassSignature, ClassDecorator } from "@/types/common.type";
import { META_PARAMTYPES } from "@/assets/METADATA";

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
