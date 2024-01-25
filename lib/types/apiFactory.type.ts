import Service from "src/classes/Service";
import { Payload } from "./ruleObject.type";
import { FinalApiConfig } from "./userService.type";
import { RequestExecutorResult } from "./xhr.type";

/**
 * The final user interface of request function
 */
export type FinalApi = (payload?: Payload, requestConfig?: FinalApiConfig, service?: Service) => RequestExecutorResult;
