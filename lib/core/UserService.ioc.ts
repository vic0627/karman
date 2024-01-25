import IOCContainer from "../decorator/IOCContainer.decorator";
import { Byte, ByteConvertor } from "../utils/Byte.provider";
import TypeLib from "./validationEngine/TypeLib.provider";
import StringRule from "./validationEngine/StringRule.injectable";
import RuleArray from "./validationEngine/RuleArray.injectable";
import RuleObject from "./validationEngine/RuleObject.injectable";
import XHR from "./requestHandler/requestStrategy/XHR.provider";
import ServiceFactory from "./serviceLayer/ServiceFactory.injectable";
import APIFactory from "./requestHandler/APIFactory.injectable";
import CacheManager from "./requestHandler/requestPipe/CacheManager.injectable";
import PromiseInterceptors from "./requestHandler/requestPipe/PromiseInterceptors.provider";
import ScheduledTask from "./scheduledTask/ScheduledTask.provider";
import WebStorage from "./requestHandler/requestPipe/cacheStrategy/WebStorage.provider";
import Path from "src/utils/Path.provider";
import { TypeValidator } from "src/types/ruleLiteral.type";
import { RuleObjectInterface, ValidRule } from "src/types/ruleObject.type";
import { ServiceConfigRoot, ServiceInterceptor } from "src/types/userService.type";
import ServiceFormData from "src/core/formData/ServcieFormData.provider";

@IOCContainer({
  provides: [TypeLib, Byte, ByteConvertor, XHR, PromiseInterceptors, ScheduledTask, WebStorage, Path, ServiceFormData],
  imports: [StringRule, RuleArray, RuleObject, ServiceFactory, APIFactory, CacheManager],
})
class UserService {
  scheduledTask;

  constructor(
    private readonly st: ScheduledTask,
    private readonly serviceFactory: ServiceFactory,
    private readonly ruleArray: RuleArray,
    private readonly ruleObject: RuleObject,
    private readonly typeLib: TypeLib,
    private readonly serviceFormData: ServiceFormData,
  ) {
    this.scheduledTask = this.st;
  }

  defineType(type: string, validator: TypeValidator) {
    return this.typeLib.defineType(type, validator);
  }

  defineUnion(...rules: ValidRule[]) {
    return this.ruleArray.defineUnion(...rules);
  }
  defineIntersection(...rules: ValidRule[]) {
    return this.ruleArray.defineIntersection(...rules);
  }

  mergeRules(...targets: RuleObjectInterface[]) {
    return this.ruleObject.mergeRules(...targets);
  }

  partialRules(target: RuleObjectInterface) {
    return this.ruleObject.partialRules(target);
  }

  requiredRules(target: RuleObjectInterface) {
    return this.ruleObject.requiredRules(target);
  }

  pickRules(target: RuleObjectInterface, ...args: (keyof RuleObjectInterface)[]) {
    return this.ruleObject.pickRules(target, ...args);
  }

  omitRules(target: RuleObjectInterface, ...args: (keyof RuleObjectInterface)[]) {
    return this.ruleObject.omitRules(target, ...args);
  }

  createService(serviceConfig: ServiceConfigRoot) {
    return this.serviceFactory.createService(serviceConfig);
  }

  createFormData(object: Record<string, any> | any[], deep?: boolean) {
    if (deep) {
      return this.serviceFormData.deepBuildFormData(object);
    }

    return this.serviceFormData.buildFormData(object);
  }
}

export default UserService;
