import { describe, beforeEach, it, expect, jest } from "@jest/globals";
import Template from "@/utils/template.provider";

describe("Template", () => {
  let template: Template;

  beforeEach(() => {
    template = new Template();
  });

  describe("withPrefix", () => {
    // eslint-disable-next-line quotes
    it('should prefix messages with default type "warn"', () => {
      const result = template.withPrefix({ messages: ["Test message"] });
      expect(result).toBe("[karman warn] Test message");
    });

    it("should prefix messages with specified type", () => {
      const result = template.withPrefix({ type: "error", messages: ["Test message"] });
      expect(result).toBe("[karman error] Test message");
    });
  });

  describe("warn", () => {
    it("should call console.warn with prefixed message", () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
      template.warn("Test message");
      expect(consoleWarnSpy).toHaveBeenCalledWith("[karman warn] Test message");
      consoleWarnSpy.mockRestore();
    });
  });

  describe("throw", () => {
    it("should throw an Error with prefixed message", () => {
      const errorMessage = "[karman error] Test message";
      expect(() => template.throw("Test message")).toThrowError(errorMessage);
    });
  });
});
