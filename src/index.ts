import * as ts from 'typescript';
import { createProgram } from './create-program';

type createServiceOptions = {
    configFile: string;
    compilerOptions?: ts.CompilerOptions;
};

export function createService({ compilerOptions, configFile }: createServiceOptions) {
    let { program, host } = createProgram({ configFile, compilerOptions });
    const api = {
        getProgram: () => program,
        getSourceFile: (fileName: string, sourceText?: string) => {
            // todo: fix me optimization sourceText is not used
            let sourceFile = program.getSourceFile(fileName);
            if (sourceFile === undefined) {
                const rootFileNames = [...program.getRootFileNames(), fileName];
                program = ts.createProgram(rootFileNames, program.getCompilerOptions(), host, program);
                sourceFile = program.getSourceFile(fileName);
            }
            return sourceFile;
        },
        getDiagnostics: (fileName: string, sourceText?: string) => {
            const sourceFile = api.getSourceFile(fileName, sourceText);
            return [
                ...program.getSyntacticDiagnostics(sourceFile),
                ...program.getSemanticDiagnostics(sourceFile),
            ];
        },
    };
    return api;
}
