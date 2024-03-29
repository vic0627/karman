export default function convertToBase64(file: File): Promise<string>;

declare module "@vic0627/karman" {
  interface KarmanDependencies {
    _convertToBase64: typeof convertToBase64;
  }
}
