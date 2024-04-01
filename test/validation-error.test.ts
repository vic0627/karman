import { describe, expect, it } from "@jest/globals";
import ValidationError, { ValidationErrorOptions } from "@/core/validation-engine/validation-error/validation-error";

describe("ValidationError", () => {
  it("should create an instance with given message", () => {
    const errorMessage = "Custom error message";
    const error = new ValidationError(errorMessage);

    expect(error instanceof ValidationError).toBeTruthy();
    expect(error.message).toBe(errorMessage);
  });

  it("should create an instance with given options", () => {
    const options: ValidationErrorOptions = {
      prop: "testProp",
      value: 42,
      type: "string",
    };

    const error = new ValidationError(options);

    expect(error instanceof ValidationError).toBeTruthy();
    expect(error.message).toContain(options.prop);
    expect(error.message).toContain(options.type);
    expect(error.message).toContain(options.value.toString());
  });

  it("should handle different validation scenarios", () => {
    const options: ValidationErrorOptions = {
      prop: "testProp",
      value: "hello",
      min: 5,
      max: 10,
    };

    const error = new ValidationError(options);

    expect(error instanceof ValidationError).toBeTruthy();
    expect(error.message).toContain(options.prop);
    expect(error.message).toContain("should be within the range of");
    expect(error.message).toContain(options.min?.toString());
    expect(error.message).toContain(options.max?.toString());
    expect(error.message).toContain(options.value.toString());
  });

  it("should handle custom messages", () => {
    const options: ValidationErrorOptions = {
      prop: "testProp",
      value: null,
      message: "Custom validation message",
    };

    const error = new ValidationError(options);

    expect(error instanceof ValidationError).toBeTruthy();
    expect(error.message).toBe(options.message);
  });

  it("should handle undefined and null values", () => {
    const options: ValidationErrorOptions = {
      prop: "testProp",
      value: undefined,
      required: true,
    };

    const error = new ValidationError(options);

    expect(error instanceof ValidationError).toBeTruthy();
    expect(error.message).toContain(options.prop);
    expect(error.message).toContain("is required");
  });
});
