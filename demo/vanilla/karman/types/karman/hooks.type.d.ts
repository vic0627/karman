import { HttpBody } from "./http.type";
import { PayloadDef } from "./payload-def.type";
export interface ValidationHooks {
    onBeforeValidate?(payloadDef: PayloadDef, payload: Record<string, any>): void;
    onValidateError?(error: Error): void;
}
export interface SyncHooks extends ValidationHooks {
    onBeforeRequest?<T = Record<string, any>>(requestURL: string, payload: T): HttpBody | T;
}
export interface AsyncHooks {
    onSuccess?(res: Response): any;
    onError?(err: Error): void;
    onFinally?(): void;
}
//# sourceMappingURL=hooks.type.d.ts.map