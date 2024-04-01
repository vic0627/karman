import { describe, beforeEach, expect, jest, it } from "@jest/globals";
import FunctionalValidator from "@/core/validation-engine/validators/functional-validator.injectable";
import TypeCheck from "@/utils/type-check.provider";
import ValidationError from "@/core/validation-engine/validation-error/validation-error";
import type { ParamRules } from "@/types/rules.type";

describe("FunctionalValidator", () => {
  let validator: FunctionalValidator;
  let typeCheck: TypeCheck;

  beforeEach(() => {
    typeCheck = new TypeCheck();
    validator = new FunctionalValidator(typeCheck);
  });

  describe("validate", () => {
    it("should call custom validator function if rule is a custom validator", () => {
      const mockCustomValidator = jest.fn();
      Object.defineProperty(mockCustomValidator, "_karman", { value: true });
      const option = { rule: mockCustomValidator, param: "param", value: "value", required: false };

      validator.validate(option);

      expect(mockCustomValidator).toHaveBeenCalledWith("param", "value");
    });

    it("should call instanceValidator if rule is a prototype", () => {
      const rule = class {};
      const value = new rule();
      const option = { rule, param: "param", value, required: false };
      const instanceValidatorSpy = jest.spyOn(validator, "instanceValidator" as keyof FunctionalValidator);

      validator.validate(option);

      expect(instanceValidatorSpy).toHaveBeenCalledWith(option);
    });
  });

  describe("isPrototype", () => {
    it("should return true if rule is a prototype", () => {
      const mockRule = class {};

      const result = validator["isPrototype"](mockRule);

      expect(result).toBe(true);
    });

    it("should return false if rule is not a prototype", () => {
      const mockRule = jest.fn();
      Object.defineProperty(mockRule, "_karman", { value: true });

      const result = validator["isPrototype"](mockRule);

      expect(result).toBe(false);
    });
  });

  describe("isCustomValidator", () => {
    it("should return true if rule is a custom validator", () => {
      const mockRule = jest.fn();
      Object.defineProperty(mockRule, "_karman", { value: true });

      const result = validator["isCustomValidator"](mockRule);

      expect(result).toBe(true);
    });

    it("should return false if rule is not a custom validator", () => {
      const mockRule = (() => {}) as ParamRules;

      const result = validator["isCustomValidator"](mockRule);

      expect(result).toBe(false);
    });
  });

  describe("instanceValidator", () => {
    it("should throw ValidationError if value is not an instance of rule", () => {
      const mockRule = class {};
      const option = { rule: mockRule, param: "param", value: {}, required: false };

      expect(() => validator["instanceValidator"](option)).toThrow(ValidationError);
    });

    it("should not throw ValidationError if value is an instance of rule", () => {
      const mockRule = class {};
      const option = { rule: mockRule, param: "param", value: new mockRule(), required: false };

      expect(() => validator["instanceValidator"](option)).not.toThrow(ValidationError);
    });
  });
});
