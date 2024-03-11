/**
 * 路徑模組
 * @description 處理所有路徑相關操作，包括判斷、拼接、建構等。
 */
export default class PathResolver {
    #private;
    /**
     * 修剪字串開頭的 `/`
     * @param path 路徑字串
     * @example
     * const str = DI.trimStart("//hello/world/");
     * console.log(str); // => "hello/world/"
     */
    trimStart(path: string): string;
    /**
     * 修剪字串結尾的 `/`
     * @param path 路徑字串
     * @example
     * const str = DI.trimEnd("/hello/world//");
     * console.log(str); // => "/hello/world"
     */
    trimEnd(path: string): string;
    /**
     * 修剪字串兩端的 `/`
     * @param path 路徑字串
     * @example
     * const str = DI.trim("/hello/world//");
     * console.log(str); // => "hello/world"
     */
    trim(path: string): string;
    /**
     * 去除字串的 `/` 並返回所有路徑
     * @param path 路徑字串
     * @returns
     * @example
     * const arr = DI.antiSlash("/hello/world//");
     * console.log(arr); // => ["hello", "world"]
     */
    antiSlash(path: string): string[];
    /**
     * 將所有路徑切割乾淨
     * @param paths 路徑字串們
     * @example
     * const arr = DI.split("https://wtf.com//projects/", "/srgeo/issues//");
     * console.log(arr); // => ["https://wtf.com", "projects", "srgeo", "issues"]
     */
    split(...paths: string[]): string[];
    /**
     * 合併所有路徑，但不處理相對路徑
     * @param paths 路徑字串們
     * @example
     * const str = DI.split("https://wtf.com//projects/", "/srgeo/issues//");
     * console.log(str); // => "https://wtf.com/projects/srgeo/issues"
     */
    join(...paths: string[]): string;
    /**
     * 處理、合併包含相對路徑的所有路徑
     * @param paths 路徑字串們
     * @example
     * const str = DI.resolve(
     *   "https://wtf.com/projects/",
     *   "../../srgeo//issues",
     *   "./hello/world/",
     *   "/how//../are/you///"
     * );
     * console.log(str); // => "https://wtf.com/srgeo/issues/hello/world/are/you"
     */
    resolve(...paths: string[]): string;
    /**
     * 建構完整 url 字串
     * @example
     * const url = DI.resolveURL({
     *   paths: ["https://wtf.com/", "/hello", "../world/"],
     *   query: {
     *     foo: "bar",
     *     some: "how"
     *   }
     * });
     * console.log(url); // => "https://wtf.com/world?foo=bar&some=how"
     */
    resolveURL(options: {
        query?: Record<string, string>;
        paths: string[];
    }): string;
}
//# sourceMappingURL=path-rosolver.provider.d.ts.map