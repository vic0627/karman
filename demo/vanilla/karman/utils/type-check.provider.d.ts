import { ObjectLiteral, Type } from "@/types/karman/rules.type";
export default class TypeCheck {
    get CorrespondingMap(): Record<Type, keyof this>;
    get TypeSet(): Type[];
    isChar(value: any): boolean;
    isString(value: any): value is string;
    isNumber(value: any): value is number;
    isInteger(value: any): boolean;
    isFloat(value: any): boolean;
    isNaN(value: any): boolean;
    isBoolean(value: any): value is boolean;
    isObject(value: any): value is object;
    isNull(value: any): value is null;
    isFunction(value: any): value is Function;
    isArray(value: any): value is any[];
    isObjectLiteral(value: any): value is ObjectLiteral;
    isUndefined(value: any): value is undefined;
    isUndefinedOrNull(value: any): value is null | undefined;
    isBigInt(value: any): value is bigint;
    isSymbol(value: any): value is symbol;
}
export declare const typeCheck: TypeCheck;
//# sourceMappingURL=type-check.provider.d.ts.map