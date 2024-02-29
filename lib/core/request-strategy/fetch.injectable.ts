import RequestStrategy from "@/abstract/request-strategy.abstract";
import RequestDetail, { HttpBody, HttpConfig } from "@/types/karman/http.type";

export default class Fetch implements RequestStrategy {
    request<D>(payload: HttpBody, config: HttpConfig): RequestDetail<D> {
        fetch
    }
}