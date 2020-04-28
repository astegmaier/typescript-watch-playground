import ts from "typescript";

import { afterProgramCreate } from "./afterProgramCreate";
import { reportDiagnostic, reportWatchStatusChanged } from "./reporters";

function watchMain() {
  const configPath = ts.findConfigFile(/*searchPath*/ "project/src", ts.sys.fileExists, "tsconfig.json");
  if (!configPath) {
    throw new Error("Could not find a valid 'tsconfig.json'.");
  }

  // TypeScript can use several different program creation "strategies":
  //  * ts.createEmitAndSemanticDiagnosticsBuilderProgram,
  //  * ts.createSemanticDiagnosticsBuilderProgram
  //  * ts.createAbstractBuilder
  // The first two produce "builder programs". These use an incremental strategy to only re-check and emit files whose contents may have changed, or whose
  // dependencies may have changes which may impact change the result of prior type-check and emit.
  // The last uses an ordinary program which does a full type check after every change.
  // Between `createEmitAndSemanticDiagnosticsBuilderProgram` and `createSemanticDiagnosticsBuilderProgram`, the only difference is emit.
  // For pure type-checking scenarios, or when another tool/process handles emit, using `createSemanticDiagnosticsBuilderProgram` may be more desirable.
  const createProgram = ts.createSemanticDiagnosticsBuilderProgram;

  // Note that there is another overload for `createWatchCompilerHost` that takes a set of root files.
  const host = ts.createWatchCompilerHost(
    configPath,
    { noEmit: true }, // see: https://github.com/microsoft/TypeScript/issues/32385#issue-467653373;
    ts.sys,
    createProgram,
    reportDiagnostic,
    reportWatchStatusChanged
  );

  // You can technically override any given hook on the host, though you probably don't need to.
  // Note that we're assuming `origCreateProgram` and `origPostProgramCreate` doesn't use `this` at all.
  const origCreateProgram = host.createProgram;
  host.createProgram = (rootNames: ReadonlyArray<string> | undefined, options, host, oldProgram) => {
    console.log("** We're about to create the program! **");
    return origCreateProgram(rootNames, options, host, oldProgram);
  };

  // We are over-riding the default implementation of afterProgramCreate with our own version that doesn't emit files.
  // Most of the code is copied from ts emitFilesAndReportErrors, with the 'emit' code removed (https://github.com/microsoft/TypeScript/blob/167f954ec7cf456238cad4f2006fb330c53bba8e/src/compiler/watch.ts#L140-L200)
  // See https://github.com/microsoft/TypeScript/issues/29176 for a discussion of how this technique was used by fork-ts-webpack-checker-plugin.
  // host.afterProgramCreate = afterProgramCreate;

  // `createWatchProgram` creates an initial program, watches files, and updates the program over time.
  ts.createWatchProgram(host);
}

watchMain();
