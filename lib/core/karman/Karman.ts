export default class Karman {
  private _baseURL: string = "";

  public get baseURL() {
    return this._baseURL;
  }

  public set baseURL(value) {
    if (typeof value !== "string") {
      throw new TypeError("`baseURL` must remains string type.");
    }

    this._baseURL = value;
  }

  constructor(url: string, route?: string) {
    this._baseURL = this._concatURL(url, route);
  }

  private _concatURL(url: string, route?: string) {
    if (typeof route !== "string") {
      throw new TypeError("`route` must remains string type.");
    }

    return url + route;
  }

  public createAPI(): {}
}
