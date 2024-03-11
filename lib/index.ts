import "reflect-metadata";
import core from "@/core";

const facade = new core();

const defineKarman = facade.LayerBuilder.configure.bind(facade.LayerBuilder);
const defineAPI = facade.ApiFactory.createAPI.bind(facade.ApiFactory);
const defineCustomValidator = facade.ValidationEngine.defineCustomValidator.bind(facade.ValidationEngine);
const defineIntersectionRules = facade.ValidationEngine.defineIntersectionRules.bind(facade.ValidationEngine);
const defineUnionRules = facade.ValidationEngine.defineUnionRules.bind(facade.ValidationEngine);

export { defineKarman, defineAPI, defineCustomValidator, defineIntersectionRules, defineUnionRules };
