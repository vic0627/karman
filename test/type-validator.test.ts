import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";
import TypeValidator from "@/core/validation-engine/validators/type-validator.injectable";
import TypeCheck from "@/utils/type-check.provider";
import Template from "@/utils/template.provider"; // Import Template implementation
import ValidationError from "@/core/validation-engine/validation-error/validation-error";

describe("TypeValidator", () => {
  let typeValidator: TypeValidator;
  let typeCheckMock: TypeCheck;
  let templateMock: Template;

  beforeEach(() => {
    typeCheckMock = new TypeCheck();
    templateMock = new Template();

    typeValidator = new TypeValidator(typeCheckMock, templateMock);
  });

  describe("validate method", () => {
    test("should not throw error for valid type", () => {
      const option = { rule: "string", param: "param", value: "value", required: false };

      expect(() => typeValidator.validate(option)).not.toThrow();
    });

    test("should warn for invalid type", () => {
      const option = { rule: "sting", param: "param", value: "value", required: false };
      typeValidator.validate(option);
      expect(templateMock.warn).toHaveBeenCalledWith(
        // eslint-disable-next-line quotes
        '[karman warn] invalid type "sting" was provided in rules for parameter "param"',
      );
    });

    test("should throw ValidationError for invalid value", () => {
      const option = { rule: "string", param: "param", value: 1, required: false };

      expect(() => typeValidator.validate(option)).toThrowError(ValidationError);
    });
  });

  describe("legalType method", () => {
    test("should return true for legal type", () => {
      expect(typeValidator["legalType"]("string")).toBe(true);
    });

    test("should return false for illegal type", () => {
      expect(typeValidator["legalType"]("strng")).toBe(false);
    });
  });

  describe("getValidator method", () => {
    test("should return validator function", () => {
      const validator = typeValidator["getValidator"]("string");

      expect(typeof validator).toBe("function");
    });
  });
});
