import { RequestConfig, RequestDetail } from "@/types/xhr.type";

export default abstract class RequestHandler {
  abstract request(config: RequestConfig): RequestDetail;
}
