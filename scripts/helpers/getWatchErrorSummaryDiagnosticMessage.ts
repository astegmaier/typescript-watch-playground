import ts from "typescript";

// TODO: This is copied from https://github.com/microsoft/TypeScript/blob/167f954ec7cf456238cad4f2006fb330c53bba8e/src/compiler/watch.ts#L104-L108
// We should figure out a way to import it instead of re-writing, or simplifying.
export function getWatchErrorSummaryDiagnosticMessage(errorCount: number) {
  return errorCount === 1 ? oneError : multiErrors;
}

function diag(
  code: number,
  category: ts.DiagnosticCategory,
  key: string,
  message: string,
  reportsUnnecessary?: {}
): ts.DiagnosticMessage {
  return { code, category, key, message, reportsUnnecessary };
}

const oneError = diag(
  6193,
  ts.DiagnosticCategory.Message,
  "Found_1_error_Watching_for_file_changes_6193",
  "Found 1 error. Watching for file changes."
);
const multiErrors = diag(
  6194,
  ts.DiagnosticCategory.Message,
  "Found_0_errors_Watching_for_file_changes_6194",
  "Found {0} errors. Watching for file changes."
);
