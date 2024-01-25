import { ClassSignature } from "./common.type";

export interface IOCOptions {
  /**
   * Providers does not contain any dependencies required.
   */
  provides?: ClassSignature[];
  /**
   * An import moudle can also be a provider of another moudule.
   */
  imports?: ClassSignature[];
}
