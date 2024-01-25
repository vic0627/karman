type FD = typeof FormData;

export default class ServiceFormData {
  #formData?: FD;

  #init() {
    if (window?.FormData) {
      this.#formData = FormData;

      return;
    }

    if (typeof require === "function") {
      this.#formData = require("form-data");

      return;
    }

    throw new Error("FormData is not supplied in current enviroment");
  }

  constructor() {
    this.#init();
  }

  #createFormData() {
    return new (this.#formData as FD)();
  }

  buildFormData(object: Record<string, any> | any[]) {
    const fd = this.#createFormData();

    Object.entries(object).forEach(([key, value]) => {
      fd.append(key, value);
    });

    return fd;
  }

  deepBuildFormData(object: Record<string, any>) {
    const fd = this.#createFormData();

    const recursion = (_object: Record<string, any> | any[], key?: string) => {
      Object.entries(_object).forEach(([_key, value]) => {
        if (key) {
          _key = `${_key}[${key}]`;
        }

        if (typeof value === "object" && value !== null) {
          return recursion(value, _key);
        }

        fd.append(_key, value);
      });
    };

    recursion(object);

    return fd;
  }
}
