export default class Template {
  public withPrefix(options: { type?: "warn" | "error"; messages: (string | number)[] }) {
    const { type = "warn", messages } = options;
    let t = `[karman ${type}] `;

    for (const item of messages) {
      t += item;
    }

    return t;
  }

  warn(...messages: (string | number)[]) {
    console.warn(this.withPrefix({ messages }));
  }

  throw(...messages: (string | number)[]) {
    throw new Error(this.withPrefix({ messages }));
  }
}
