import * as ts from 'typescript';

export function normalizeCompilerOptions(options: ts.CompilerOptions = {}) {
    if (options.target) {
        options.target = toEnum(ts.ScriptTarget, options.target);
    }
    if (options.module) {
        options.module = toEnum(ts.ModuleKind, options.module);
    }
    if (options.moduleResolution) {
        if (String(options.moduleResolution).toLowerCase() === 'node') {
            options.moduleResolution = ts.ModuleResolutionKind.NodeJs;
        }
        options.moduleResolution = toEnum(ts.ModuleResolutionKind, options.moduleResolution);
    }
    return options;
}

export function toEnum(collection: any, value: any) {
    let result = value;
    const valueLower = String(value).toLowerCase();
    const key = Object.keys(collection).find(value => String(value).toLowerCase() === valueLower);
    if (key !== undefined) {
        result = Number(collection[key]);
        if (Number.isNaN(result)) {
            result = value;
        }
    }
    return result;
}
