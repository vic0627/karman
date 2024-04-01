import { describe, it, expect, beforeEach } from "@jest/globals";
import PathResolver from "@/utils/path-rosolver.provider";

describe("PathResolver", () => {
  let pathResolver: PathResolver;

  beforeEach(() => {
    pathResolver = new PathResolver();
  });

  describe("trimStart", () => {
    it("should trim leading slashes and dots", () => {
      expect(pathResolver.trimStart("//hello/world/")).toBe("hello/world/");
      expect(pathResolver.trimStart("./hello/world/")).toBe("hello/world/");
      expect(pathResolver.trimStart("/./hello/world/")).toBe("hello/world/");
    });
  });

  describe("trimEnd", () => {
    it("should trim trailing slashes and dots", () => {
      expect(pathResolver.trimEnd("/hello/world//")).toBe("/hello/world");
      expect(pathResolver.trimEnd("/hello/world/./")).toBe("/hello/world");
      expect(pathResolver.trimEnd("/hello/world/../")).toBe("/hello/world");
    });
  });

  describe("trim", () => {
    it("should trim both leading and trailing slashes and dots", () => {
      expect(pathResolver.trim("/hello/world//")).toBe("hello/world");
      expect(pathResolver.trim("./hello/world/./")).toBe("hello/world");
      expect(pathResolver.trim("/./hello/world/../")).toBe("hello/world");
    });
  });

  describe("antiSlash", () => {
    it("should split the path into segments", () => {
      expect(pathResolver.antiSlash("/hello/world//")).toEqual(["hello", "world"]);
    });
  });

  describe("split", () => {
    it("should split paths correctly", () => {
      expect(pathResolver.split("https://wtf.com//projects/", "/srgeo/issues//")).toEqual([
        "https://wtf.com",
        "projects",
        "srgeo",
        "issues",
      ]);
    });
  });

  describe("join", () => {
    it("should join paths correctly", () => {
      expect(pathResolver.join("https://wtf.com//projects/", "/srgeo/issues//")).toBe(
        "https://wtf.com/projects/srgeo/issues",
      );
    });
  });

  describe("resolve", () => {
    it("should resolve relative paths correctly", () => {
      expect(
        pathResolver.resolve(
          "https://wtf.com/projects/",
          "../../srgeo//issues",
          "./hello/world/",
          "/how//../are/you///",
        ),
      ).toBe("https://wtf.com/srgeo/issues/hello/world/are/you");
    });
  });

  describe("resolveURL", () => {
    it("should resolve URL correctly with query parameters", () => {
      const url = pathResolver.resolveURL({
        paths: ["https://wtf.com/", "/hello", "../world/"],
        query: {
          foo: "bar",
          some: "how",
        },
      });

      expect(url).toBe("https://wtf.com/world?foo=bar&some=how");
    });

    it("should resolve URL correctly without query parameters", () => {
      const url = pathResolver.resolveURL({
        paths: ["https://wtf.com/", "/hello", "../world/"],
      });

      expect(url).toBe("https://wtf.com/world");
    });
  });
});
