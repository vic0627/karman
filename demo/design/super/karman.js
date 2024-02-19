export class Karman {
  $baseURL = "";

  /**
   * @param {string} baseURL
   * @param {string} route
   */
  constructor(baseURL, route) {
    if (typeof baseURL === "string") {
      this.$baseURL = baseURL;
    }

    if (typeof route === "string") {
      this.$baseURL += "/" + route;
    }
  }

  /**
   * @protected
   */
  $createAPI(apiConfig = {}, requestConfig = {}) {
    const { endpoint = "" } = apiConfig;
    const requestURL = endpoint ? this.$baseURL + "/" + endpoint : this.$baseURL;

    return () => {
      console.log(requestURL);
    };
  }
}

/**
 * 
 * @param {{
 *   karman: typeof T;
 *   baseURL: string;
 *   children: Karman[];
 * }} option 
 * @returns {T}
 * @template T
 */
export const createKarmanLine = (option = {}) => {
  const { karman, baseURL, children } = option;

  if (Object.getPrototypeOf(karman) === Karman) {
    const instance = new karman(baseURL);

    return instance;
  }
};
