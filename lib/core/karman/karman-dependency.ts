import Karman from "@/core/karman/karman";

export default class KarmanDependency {
  private depName: string;

  constructor(depName: string) {
    this.depName = depName;
  }

  private static installFactory(depName: string) {
    return function (this: unknown, karman: typeof Karman) {
      const prototype = karman.prototype;
      const notKarman = !(karman === Karman);
      const duplicateKeys = prototype[depName as keyof Karman];
      if (notKarman || duplicateKeys) return;

      Object.defineProperty(prototype, depName, { value: this });
    };
  }

  public install(karman: typeof Karman) {
    KarmanDependency.installFactory(this.depName).call(this, karman);
  }

  public static define<D>(depName: string, dep: D) {
    if (!(dep instanceof Object)) return;

    const value = KarmanDependency.installFactory(depName).bind(dep);
    Object.defineProperty(dep, "install", { value });

    return dep;
  }
}
