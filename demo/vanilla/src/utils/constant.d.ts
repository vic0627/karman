interface Constant {
  min: number;
}

declare const _constant: Constant;

export default _constant;

declare module "@karman" {
  interface IKarman {
    _constant: Constant;
  }
}
