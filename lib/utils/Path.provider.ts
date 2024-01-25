/**
 * 路徑模組
 * @description 處理所有路徑相關操作，包括判斷、拼接、建構等。
 */
export default class Path {
  get #dot() {
    return ".";
  }

  get #dbDot() {
    return "..";
  }

  get #slash() {
    return "/";
  }

  get #dbSlash() {
    return "//";
  }

  get #http() {
    return "http:";
  }

  get #https() {
    return "https:";
  }

  /**
   * 路徑是否以 `.` 開頭
   * @param path 路徑字串
   * @param position 從哪個索引值開始判斷
   */
  #dotStart(path: string, position?: number) {
    return path.startsWith(this.#dot, position);
  }

  /**
   * 路徑是否以 `.` 結尾
   * @param path 路徑字串
   * @param position 從哪個索引值開始判斷
   */
  #dotEnd(path: string, endPosition?: number) {
    return path.endsWith(this.#dot, endPosition);
  }

  /**
   * 路徑是否以 `/` 開頭
   * @param path 路徑字串
   * @param position 從哪個索引值開始判斷
   */
  #slashStart(path: string, position?: number) {
    return path.startsWith(this.#slash, position);
  }

  /**
   * 路徑是否以 `/` 結尾
   * @param path 路徑字串
   * @param position 從哪個索引值開始判斷
   */

  #slashEnd(path: string, endPosition?: number) {
    return path.endsWith(this.#slash, endPosition);
  }

  /**
   * 修剪字串開頭的 `/`
   * @param path 路徑字串
   * @example
   * const str = DI.trimStart("//hello/world/");
   * console.log(str); // => "hello/world/"
   */
  trimStart(path: string) {
    while (this.#slashStart(path) || this.#dotStart(path)) {
      path = path.slice(1);
    }

    return path;
  }

  /**
   * 修剪字串結尾的 `/`
   * @param path 路徑字串
   * @example
   * const str = DI.trimEnd("/hello/world//");
   * console.log(str); // => "/hello/world"
   */
  trimEnd(path: string) {
    while (this.#slashEnd(path) || this.#dotEnd(path)) {
      path = path.slice(0, -1);
    }

    return path;
  }

  /**
   * 修剪字串兩端的 `/`
   * @param path 路徑字串
   * @example
   * const str = DI.trim("/hello/world//");
   * console.log(str); // => "hello/world"
   */
  trim(path: string) {
    path = this.trimStart(path);

    return this.trimEnd(path);
  }

  /**
   * 去除字串的 `/` 並返回所有路徑
   * @param path 路徑字串
   * @example
   * const arr = DI.antiSlash("/hello/world//");
   * console.log(arr); // => ["hello", "world"]
   */
  antiSlash(path: string) {
    return path.split(/\/+/).filter((segment) => !!segment);
  }

  /**
   * 將所有路徑切割乾淨
   * @param paths 路徑字串們
   * @example
   * const arr = DI.split("https://wtf.com//projects/", "/srgeo/issues//");
   * console.log(arr); // => ["https://wtf.com", "projects", "srgeo", "issues"]
   */
  split(...paths: string[]) {
    const splitPaths: string[] = paths.map(this.antiSlash).flat();

    if (splitPaths[0] === this.#http || splitPaths[0] === this.#https) {
      splitPaths[0] = splitPaths[0] + this.#dbSlash + splitPaths[1];
      splitPaths.splice(1, 1);
    }

    return splitPaths;
  }

  /**
   * 合併所有路徑，但不處理相對路徑
   * @param paths 路徑字串們
   * @example
   * const str = DI.split("https://wtf.com//projects/", "/srgeo/issues//");
   * console.log(str); // => "https://wtf.com/projects/srgeo/issues"
   */
  join(...paths: string[]) {
    return this.split(...paths).join(this.#slash);
  }

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
  resolve(...paths: string[]) {
    return this.split(...paths).reduce((pre, cur, i) => {
      if (cur === this.#dot) {
        return pre;
      }

      if (cur === this.#dbDot) {
        const lastSlash = pre.lastIndexOf(this.#slash);

        const noSlash = lastSlash === -1;

        const httpLeft = [5, 6, 7].includes(lastSlash) && (pre.startsWith(this.#http) || pre.startsWith(this.#https));

        if (noSlash || httpLeft) {
          return pre;
        }

        return pre.slice(0, lastSlash);
      }

      if (!i) {
        return cur;
      }

      return (pre += this.#slash + cur);
    }, "");
  }

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
  resolveURL(options: { query?: Record<string, string>; paths: string[] }) {
    const { query, paths } = options;

    let url = this.resolve(...paths);

    if (!query) {
      return url;
    }

    const queryParams = Object.entries(query);

    queryParams.length &&
      queryParams.forEach(([key, value], i) => {
        if (!i) {
          url += "?";
        } else {
          url += "&";
        }

        url += key + "=" + value;
      });

    return url;
  }
}
