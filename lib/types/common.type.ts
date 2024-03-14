export interface ConstructorOf<T, K extends any[] = any[]> {
  new (...args: K): T;
}

export type NumOrString = number | string;

export type SelectRequired<T, P extends keyof T> = Required<Pick<T, P>>;

export type ClassSignature = { new (...args: any[]): {} };

export type ClassDecorator = <T extends ClassSignature>(target: T) => T | void;

export type Primitive = string | number | boolean | bigint | symbol | undefined | object;

export type SelectPrimitive<T, D = any> = T extends Primitive ? T : D;

export type SelectPrimitive2<S, P, D = any> = P extends Primitive ? P : S extends Primitive ? S : D;

export type SelectPrimitive3<T, S, F, D = any> = F extends Primitive
  ? F
  : S extends Primitive
    ? S
    : T extends Primitive
      ? T
      : D;