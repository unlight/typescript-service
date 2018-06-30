import * as ts from 'typescript';
import { readFileSync, existsSync } from 'fs';
import { normalizeCompilerOptions } from './utils';

type createServiceOptions = {
    configFile: string;
    compilerOptions?: ts.CompilerOptions;
};

export function createService({ compilerOptions, configFile }: createServiceOptions) {

    const config = ts.readConfigFile(configFile, ts.sys.readFile);
    if (config.error) {
        throw new Error(ts.formatDiagnostics([config.error], {
            getCanonicalFileName: file => file,
            getCurrentDirectory: process.cwd,
            getNewLine: () => '\n',
        }));
    }

    const compilationSettings: ts.CompilerOptions = normalizeCompilerOptions({
        ...((config.config && config.config.compilerOptions) || {}),
        ...(compilerOptions || {}),
        noEmit: true,
        sourceMap: false,
        inlineSources: false,
        inlineSourceMap: false,
    });

    const files: ts.MapLike<{ version: number, snapshot: ts.IScriptSnapshot | undefined }> = {};

    // Caches
    const fileExistsCache = Object.create(null);
    const readFileCache = Object.create(null);

    // Create the language service host to allow the LS to communicate with the host
    const servicesHost: ts.LanguageServiceHost = {
        getScriptFileNames: () => {
            return Object.keys(files);
        },
        getScriptVersion: (fileName) => {
            return files[fileName] && String(files[fileName].version);
        },
        getScriptSnapshot(this: typeof servicesHost, fileName: string) {
            let fileRef = files[fileName];
            if (!fileRef) {
                files[fileName] = fileRef = { version: 0, snapshot: undefined };
                if (fileName === 'lib.d.ts') {
                    fileName = require.resolve('typescript/lib/lib.d.ts').replace(/\\/g, '/');
                }
            }
            if (fileRef.snapshot === undefined) {
                const data = this.readFile && this.readFile(fileName);
                fileRef.snapshot = (data != null) ? ts.ScriptSnapshot.fromString(data) : undefined;
            }
            return fileRef.snapshot;
        },
        getCurrentDirectory: ts.sys.getCurrentDirectory,
        getCompilationSettings: () => compilationSettings,
        getDefaultLibFileName: (options) => {
            return ts.getDefaultLibFileName(options);
        },
        fileExists: (file) => {
            let result = fileExistsCache[file];
            if (result === undefined) {
                fileExistsCache[file] = result = existsSync(file);
            }
            return result;
        },
        readFile: (file) => {
            let result = readFileCache[file];
            if (result === undefined) {
                readFileCache[file] = result = readFileSync(file, 'utf8');
            }
            return result;
        },
        getDirectories: (directory) => {
            if (existsSync(directory)) {
                return ts.sys.getDirectories(directory);
            }
            return [];
        }
    };

    // Adding libs
    (compilationSettings.lib || []).forEach(lib => {
        const fileName = require.resolve(`typescript/lib/lib.${lib}.d.ts`).replace(/\\/g, '/');
        files[fileName] = { version: 0, snapshot: servicesHost.getScriptSnapshot(fileName) };
    });

    // Create the language service files
    const service = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());

    return {
        update({ fileName, fileContent }: { fileName: string, fileContent: string }) {
            fileName = fileName.replace(/\\/g, '/');
            let fileRef = files[fileName];
            if (!fileRef) {
                files[fileName] = fileRef = { version: 0, snapshot: undefined };
            }
            fileRef.snapshot = ts.ScriptSnapshot.fromString(fileContent);
            fileRef.version++;

            fileExistsCache[fileName] = true;
            readFileCache[fileName] = fileContent;
        },
        getDiagnostics(fileName: string) {
            const program = service.getProgram();
            const sourceFile = program.getSourceFile(fileName);
            return [
                ...program.getSyntacticDiagnostics(sourceFile),
                ...program.getSemanticDiagnostics(sourceFile),
            ];
        },
        getProgram: () => service.getProgram(),
    };
}
