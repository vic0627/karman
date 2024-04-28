export default class ArrayResolver {
  private get leftBracked() {
    return "[";
  }

  private get rightBracket() {
    return "]";
  }

  hasArraySyntax(type: string): boolean {}
}
