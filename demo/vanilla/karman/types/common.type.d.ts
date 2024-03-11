export interface ConstructorOf<T, K extends any[] = any[]> {
    new (...args: K): T;
}
export type NumOrString = number | string;
export type SelectRequired<T, P extends keyof T> = Required<Pick<T, P>>;
export type ClassSignature = {
    new (...args: any[]): {};
};
export type ClassDecorator = <T extends ClassSignature>(target: T) => T | void;
//# sourceMappingURL=common.type.d.ts.map