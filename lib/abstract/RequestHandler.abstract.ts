import { RequestConfig, RequestDetail } from "src/types/xhr.type";

export default abstract class RequestHandler {
  abstract request(config: RequestConfig): RequestDetail;
}
