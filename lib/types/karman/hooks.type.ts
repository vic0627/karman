import RuleSet from "@/core/validation-engine/rule-set/rule-set";
import { ParamRules } from "./rules.type";

export interface ValidationHooks {
  onBeforeValidate?(rules: ParamRules | ParamRules[] | RuleSet | undefined, payload: Record<string, any>): void;
  onValidateError?(error: Error): void;
}

export interface SyncHooks extends ValidationHooks {
  onBeforeRequest?<T = Record<string, any>>(requestURL: string, payload: T): FormData | T;
}

export interface AsyncHooks {
  onSuccess?(res: Response): any;
  onError?(err: Error): void;
  onFinally?(): void;
}
