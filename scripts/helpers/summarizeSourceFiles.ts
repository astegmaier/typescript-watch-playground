import ts from "typescript";
import path from "path";

export function summarizeSourceFiles(sourceFiles: readonly ts.SourceFile[]): string[] {
  let libFilesCount: { [libFileDirectory: string]: number } = {};
  let summarizedSourceFiles: string[] = [];

  sourceFiles.forEach((sourceFile) => {
    let relativePath = path.relative(process.cwd(), sourceFile.fileName);
    if (relativePath.startsWith("node_modules")) {
      let dir = path.dirname(relativePath);
      libFilesCount[dir] = (libFilesCount[dir] ?? 0) + 1;
    } else {
      summarizedSourceFiles.push(relativePath);
    }
  });

  Object.entries(libFilesCount).forEach(([dir, count]) => {
    summarizedSourceFiles.push(`${dir}: ${count} files`);
  });
  return summarizedSourceFiles;
}
