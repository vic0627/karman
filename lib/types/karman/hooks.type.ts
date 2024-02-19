export interface ValidationHooks {
    onBeforeValidate?(payload: Record<string, any>): void;
    onValidateFailed?(error: Error): void;
}