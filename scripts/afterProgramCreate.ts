import ts from "typescript";
import {
  addRange,
  getNewLineCharacter,
  createCompilerDiagnostic,
  getWatchErrorSummaryDiagnosticMessage,
  getErrorCountForSummary,
} from "./helpers";
import { reportDiagnostic } from "./reporters";

// We are over-riding the default implementation of afterProgramCreate with our own version that doesn't emit files.
// Most of the code is copied from ts emitFilesAndReportErrors, with the 'emit' code removed (https://github.com/microsoft/TypeScript/blob/167f954ec7cf456238cad4f2006fb330c53bba8e/src/compiler/watch.ts#L140-L200)
// See https://github.com/microsoft/TypeScript/issues/29176 for a discussion of how this technique was used by fork-ts-webpack-checker-plugin.
export function afterProgramCreate(
  this: ts.WatchCompilerHost<ts.SemanticDiagnosticsBuilderProgram>,
  program: ts.SemanticDiagnosticsBuilderProgram
) {
  console.log("** We finished making the program! **");

  // TODO: remove this (I think)?
  const isListFilesOnly = !!program.getCompilerOptions().listFilesOnly;

  // TODO: figure out whether we need to pipe through a cancellation token
  let cancellationToken: ts.CancellationToken | undefined = undefined;

  // First get and report any syntactic errors.
  const allDiagnostics = program.getConfigFileParsingDiagnostics().slice();
  const configFileParsingDiagnosticsLength = allDiagnostics.length;
  addRange(allDiagnostics, program.getSyntacticDiagnostics(/*sourceFile*/ undefined, cancellationToken));

  // If we didn't have any syntactic errors, then also try getting the global and semantic errors.
  if (allDiagnostics.length === configFileParsingDiagnosticsLength) {
    addRange(allDiagnostics, program.getOptionsDiagnostics(cancellationToken));

    if (!isListFilesOnly) {
      addRange(allDiagnostics, program.getGlobalDiagnostics(cancellationToken));

      if (allDiagnostics.length === configFileParsingDiagnosticsLength) {
        addRange(allDiagnostics, program.getSemanticDiagnostics(/*sourceFile*/ undefined, cancellationToken));
      }
    }
  }

  // This is the code we removed from the original implementation to avoid emit.
  // TODO: remove this.

  // const emitResult = isListFilesOnly
  //     ? { emitSkipped: true, diagnostics: emptyArray }
  //     : program.emit(/*targetSourceFile*/ undefined, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers);
  // const { emittedFiles, diagnostics: emitDiagnostics } = emitResult;
  // addRange(allDiagnostics, emitDiagnostics);

  const diagnostics = ts.sortAndDeduplicateDiagnostics(allDiagnostics);
  diagnostics.forEach(reportDiagnostic);

  // This code was part of the original implementation, but I don't think we need it for our purposes:
  // TODO: remove or re-implement this.

  // if (writeFileName) {
  //   const currentDir = program.getCurrentDirectory();
  //   forEach(emittedFiles, file => {
  //       const filepath = getNormalizedAbsolutePath(file, currentDir);
  //       writeFileName(`TSFILE: ${filepath}`);
  //   });
  //   listFiles(program, writeFileName);
  // }

  // This re-creates the logic to fire the onWatchStatusChange event that exists in the typescript code at:
  // https://github.com/microsoft/TypeScript/blob/167f954ec7cf456238cad4f2006fb330c53bba8e/src/compiler/watch.ts#L397-L401
  // and https://github.com/microsoft/TypeScript/blob/167f954ec7cf456238cad4f2006fb330c53bba8e/src/compiler/watch.ts#L192-L194
  // TODO: figure out whether it is necessary to re-implement this logic, and if so, if there is a simpler way of doing it.
  const compilerOptions = program.getCompilerOptions();
  const newLine = getNewLineCharacter(compilerOptions, () => ts.sys.newLine);
  const reportSummary: ts.ReportEmitErrorSummary = (errorCount: number) =>
    this.onWatchStatusChange!(
      createCompilerDiagnostic(getWatchErrorSummaryDiagnosticMessage(errorCount), errorCount),
      newLine,
      compilerOptions,
      errorCount
    );
  reportSummary(getErrorCountForSummary(diagnostics));
}
