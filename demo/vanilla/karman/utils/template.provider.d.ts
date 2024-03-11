export default class Template {
    withPrefix(options: {
        type?: "warn" | "error";
        messages: (string | number)[];
    }): string;
    warn(...messages: (string | number)[]): void;
    throw(...messages: (string | number)[]): void;
}
//# sourceMappingURL=template.provider.d.ts.map