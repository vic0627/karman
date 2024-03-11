import type { ClassDecorator, ClassSignature } from "@/types/common.type";
import type { IOCOptions } from "@/types/decorator.type";
/**
 * Inversion of control container
 * @param options
 */
export default function IOCContainer<E extends ClassSignature>(options?: IOCOptions<E>): ClassDecorator;
//# sourceMappingURL=IOCContainer.decorator.d.ts.map