import "reflect-metadata";
import core from "@/core";
import ValidationError from "./core/validation-engine/validation-error/validation-error";

const facade = new core();

const defineKarman = facade.LayerBuilder.configure.bind(facade.LayerBuilder);
const defineAPI = facade.ApiFactory.createAPI.bind(facade.ApiFactory);
const isValidationError = facade.ValidationEngine.isValidationError.bind(facade.ValidationEngine);
const defineCustomValidator = facade.ValidationEngine.defineCustomValidator.bind(facade.ValidationEngine);
const defineIntersectionRules = facade.ValidationEngine.defineIntersectionRules.bind(facade.ValidationEngine);
const defineSchemaType = facade.ValidationEngine.defineSchemaType.bind(facade.ValidationEngine);
const defineUnionRules = facade.ValidationEngine.defineUnionRules.bind(facade.ValidationEngine);

export {
  defineKarman,
  defineAPI,
  isValidationError,
  defineCustomValidator,
  defineIntersectionRules,
  defineUnionRules,
  defineSchemaType,
  ValidationError,
};
