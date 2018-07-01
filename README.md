typescript-service
===
Language service which helps to get diagnostic messages from typescript source files.

## INSTALL
```
npm install --save-dev typescript-service
```

## USAGE
```ts
import { createService } from 'typescript-service';

const service = createService({ configFile, compilerOptions });
const diagnostics = service.getDiagnostics(fileName);
```

## API
```
createService({ configFile, compilerOptions })
```
`configFile` (required, string) Path to tsconfig.json file  
`compilerOptions` (optional, Object) Compiler options to overwrite defined in tsconfig.json  

Returns object with properties which are functions:

* `update({ fileName: string, fileContent?: string })` Update (add) information about file in typescript service  
`fileName` (required, string) Path to typescript file  
`fileContent (optional, string)` File content of this file  

* `getDiagnostics(fileName: string): Array<ts.DiagnosticWithLocation>` Get diagnostic messages for `fileName`  
`fileName` (required, string) Path to typescript file  

* `getProgram(): ts.Program` Get `ts.Program`  

## CHANGELOG
See [CHANGELOG.md](CHANGELOG.md)
