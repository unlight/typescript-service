import * as ts from 'typescript';
import { createProgram } from './create-program';
import { getSourceFile } from './get-source-file';

type createServiceOptions = {
    configFile: string;
    compilerOptions?: ts.CompilerOptions;
};

export function createService({ compilerOptions, configFile }: createServiceOptions) {
    const program = createProgram({ configFile, compilerOptions });
    return {
        getProgram: () => program,
        getSourceFile: (fileName: string, sourceText: string | undefined = ts.sys.readFile(fileName)) => {
            return getSourceFile(program, fileName, sourceText);
        },
        getDiagnostics: (fileName: string, sourceText?: string) => {
            const sourceFile = getSourceFile(program, fileName, sourceText);
            return [
                ...program.getSyntacticDiagnostics(sourceFile),
                ...program.getSemanticDiagnostics(sourceFile),
            ];
        },
    };
}
