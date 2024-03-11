import type { ClassSignature } from "./common.type";
export type Provider = [token: symbol, instance: {}];
export type Importer = [
    token: symbol,
    injectableInfo: {
        constructor: ClassSignature;
        requirements: symbol[];
    }
];
//# sourceMappingURL=ioc.type.d.ts.map