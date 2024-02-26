import RequestDetail, { HttpBody, HttpConfig } from "@/types/karman/http.type";

export default abstract class RequestStrategy {
  abstract request<D>(payload: HttpBody, config: HttpConfig): RequestDetail<D>;
}
