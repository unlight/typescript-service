import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

type CreateProgramArgument = {
    configFile: string;
    compilerOptions?: ts.CompilerOptions;
    projectDirectory?: string;
};

export function createProgram({ configFile, projectDirectory = path.dirname(configFile), compilerOptions = {} }: CreateProgramArgument) {
    const { config, error } = ts.readConfigFile(configFile, ts.sys.readFile);
    if (error !== undefined) {
        throw new Error(ts.formatDiagnostics([error], {
            getCanonicalFileName: f => f,
            getCurrentDirectory: process.cwd,
            getNewLine: () => '\n',
        }));
    }
    const parseConfigHost: ts.ParseConfigHost = {
        fileExists: (path: string) => {
            return fs.existsSync(path);
        },
        readDirectory: ts.sys.readDirectory,
        readFile: (file) => {
            return fs.readFileSync(file, 'utf8');
        },
        useCaseSensitiveFileNames: true,
    };
    config.compilerOptions = { ...(config.compilerOptions || {}), ...compilerOptions };
    const parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, path.resolve(projectDirectory), {
        noEmit: true,
        sourceMap: false,
        inlineSources: false,
        inlineSourceMap: false,
    });
    if (parsed.errors !== undefined) {
        // ignore warnings and 'TS18003: No inputs were found in config file ...'
        const errors = parsed.errors.filter(d => d.category === ts.DiagnosticCategory.Error && d.code !== 18003);
        if (errors.length !== 0) {
            throw new Error(ts.formatDiagnostics(errors, {
                getCanonicalFileName: f => f,
                getCurrentDirectory: process.cwd,
                getNewLine: () => '\n',
            }));
        }
    }
    const host = ts.createCompilerHost(parsed.options, true);
    const program = ts.createProgram(parsed.fileNames, parsed.options, host);

    return { program, host };
}
