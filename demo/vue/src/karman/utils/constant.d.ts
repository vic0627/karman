interface Constant {
  min: number;
}

declare const _constant: Constant;

export default _constant;

declare module "@vic0627/karman" {
  interface KarmanDependencies {
    _constant: Constant;
  }
}
