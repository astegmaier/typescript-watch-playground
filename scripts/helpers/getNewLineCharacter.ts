import ts from "typescript";

// TODO: this was copied from https://github.com/microsoft/TypeScript/blob/167f954ec7cf456238cad4f2006fb330c53bba8e/src/compiler/utilities.ts#L4690-L4700
// We should figure out if there is a way to import it instead of re-writing it.
const carriageReturnLineFeed = "\r\n";
const lineFeed = "\n";
export function getNewLineCharacter(options: ts.CompilerOptions | ts.PrinterOptions, getNewLine?: () => string): string {
  switch (options.newLine) {
    case ts.NewLineKind.CarriageReturnLineFeed:
      return carriageReturnLineFeed;
    case ts.NewLineKind.LineFeed:
      return lineFeed;
  }
  return getNewLine ? getNewLine() : ts.sys ? ts.sys.newLine : carriageReturnLineFeed;
}
