import ts from "typescript";

// TODO: this was copied from https://github.com/microsoft/TypeScript/blob/167f954ec7cf456238cad4f2006fb330c53bba8e/src/compiler/utilities.ts#L5319-L5337
// We should figure out if there is a way to import it instead of re-writing it.
export function createCompilerDiagnostic(message: ts.DiagnosticMessage, ...args: (string | number | undefined)[]): ts.Diagnostic;
export function createCompilerDiagnostic(message: ts.DiagnosticMessage): ts.Diagnostic {
  let text = getLocaleSpecificMessage(message);

  if (arguments.length > 1) {
    text = formatStringFromArgs(text, arguments, 1);
  }

  return {
    file: undefined,
    start: undefined,
    length: undefined,

    messageText: text,
    category: message.category,
    code: message.code,
    reportsUnnecessary: message.reportsUnnecessary,
  };
}

function formatStringFromArgs(text: string, args: ArrayLike<string | number>, baseIndex = 0): string {
  return text.replace(/{(\d+)}/g, (_match, index: string) => "" + checkDefined(args[+index + baseIndex]));
}

/**
 * Type of objects whose values are all of the same type.
 * The `in` and `for-in` operators can *not* be safely used,
 * since `Object.prototype` may be modified by outside code.
 */
interface MapLike<T> {
  [index: string]: T;
}

let localizedDiagnosticMessages: MapLike<string> | undefined;

function getLocaleSpecificMessage(message: ts.DiagnosticMessage) {
  return (localizedDiagnosticMessages && localizedDiagnosticMessages[message.key]) || message.message;
}

function checkDefined<T>(value: T | null | undefined, message?: string, stackCrawlMark?: AnyFunction): T {
  assertIsDefined(value, message, stackCrawlMark || checkDefined);
  return value;
}

function assertIsDefined<T>(value: T, message?: string, stackCrawlMark?: AnyFunction): asserts value is NonNullable<T> {
  // eslint-disable-next-line no-null/no-null
  if (value === undefined || value === null) {
    fail(message, stackCrawlMark || assertIsDefined);
  }
}

function fail(message?: string, stackCrawlMark?: AnyFunction): never {
  debugger;
  const e = new Error(message ? `Debug Failure. ${message}` : "Debug Failure.");
  if ((<any>Error).captureStackTrace) {
    (<any>Error).captureStackTrace(e, stackCrawlMark || fail);
  }
  throw e;
}

/**
 * Safer version of `Function` which should not be called.
 * Every function should be assignable to this, but this should not be assignable to every function.
 */
type AnyFunction = (...args: never[]) => void;
