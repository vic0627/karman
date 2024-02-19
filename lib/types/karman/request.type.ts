interface PromiseHooks {
    onSuccess?(res: Response): any;
    onError?(err: Error): void;
    onFinally?(): void;
}

interface FinalAPIHooks extends PromiseHooks {
    onBeforeValidate?(rules: PayloadRules, payload: any): void;
    onBeforeRequest?<T = any>(payload: T): FormData | T;
}

interface RuntimeOptions {

}

type FinalAPI = (payload: any, runtimeOptions: RuntimeOptions) => Promise<any>;