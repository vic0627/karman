import RequestStrategy from "@/abstract/request-strategy.abstract";
import RequestDetail, { HttpBody, HttpConfig, ReqStrategyTypes } from "@/types/karman/http.type";
import TypeCheck from "@/utils/type-check.provider";
export default class Xhr implements RequestStrategy {
    private readonly typeCheck;
    constructor(typeCheck: TypeCheck);
    request<D, T extends ReqStrategyTypes>(payload: HttpBody, config: HttpConfig<T>): RequestDetail<D, T>;
    private initXhr;
    private setBasicSettings;
    private getAuthHeaders;
    private setRequestHeader;
    private buildPromise;
    private hooksHandlerFactory;
    private handleAbort;
    private handleTimeout;
    private handleError;
    private handleLoadend;
    private getHeaderMap;
}
//# sourceMappingURL=xhr.injectable.d.ts.map