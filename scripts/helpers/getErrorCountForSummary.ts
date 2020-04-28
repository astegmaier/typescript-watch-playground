import ts from "typescript";

// TODO: this is copied from https://github.com/microsoft/TypeScript/blob/167f954ec7cf456238cad4f2006fb330c53bba8e/src/compiler/watch.ts#L100-L102
// We should figure out how to directly import this or simplify the logic.

export function getErrorCountForSummary(diagnostics: readonly ts.Diagnostic[]) {
  return countWhere(diagnostics, (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
}

function countWhere<T>(array: readonly T[], predicate: (x: T, i: number) => boolean): number {
  let count = 0;
  if (array) {
    for (let i = 0; i < array.length; i++) {
      const v = array[i];
      if (predicate(v, i)) {
        count++;
      }
    }
  }
  return count;
}
