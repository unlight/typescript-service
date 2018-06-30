import * as assert from 'assert';
import * as lib from './index';

let service: ReturnType<typeof lib.createService>;

it('smoke', () => {
    assert(lib);
});

describe('create service', () => {

    before(() => {
        const configFile = `${__dirname}/test-project/tsconfig.json`;
        service = lib.createService({ configFile });
        assert(service);
    });

    it('errors', () => {
        const testFile = `${__dirname}/test-project/errors.ts`;
        service.update({ fileName: testFile });
        const sourceFile = service.getProgram().getSourceFile(testFile);
        assert(sourceFile);
        const diagnostics = service.getDiagnostics(testFile);
        assert.equal(diagnostics.length, 2);
        assert.equal(diagnostics[0].messageText, `Type '1' is not assignable to type 'string'.`);
        assert.equal(diagnostics[1].messageText, `Type '"foo"' is not assignable to type 'number'.`);
    });

    it('number', () => {
        const testFile = `${__dirname}/test-project/number.ts`;
        service.update({ fileName: testFile });
        const sourceFile = service.getProgram().getSourceFile(testFile);
        assert(sourceFile);
        const diagnostics = service.getDiagnostics(testFile);
        assert.equal(diagnostics.length, 0);
    });

    it('built in', () => {
        const testFile = `${__dirname}/test-project/builtin.ts`;
        service.update({ fileName: testFile });
        const sourceFile = service.getProgram().getSourceFile(testFile);
        assert(sourceFile);
        const diagnostics = service.getDiagnostics(testFile);
        assert.equal(diagnostics.length, 0);
    });

    it('types', () => {
        const testFile = `${__dirname}/test-project/types.ts`;
        service.update({ fileName: testFile });
        const sourceFile = service.getProgram().getSourceFile(testFile);
        assert(sourceFile);
        const diagnostics = service.getDiagnostics(testFile);
        assert.equal(diagnostics.length, 0);
    });

    it('decorator', () => {
        const testFile = `${__dirname}/test-project/decorator.ts`;
        service.update({ fileName: testFile });
        const sourceFile = service.getProgram().getSourceFile(testFile);
        assert(sourceFile);
        const diagnostics = service.getDiagnostics(testFile);
        assert.equal(diagnostics.length, 0);
    });

    it('global types', () => {
        const testFile = `${__dirname}/test-project/global-types.ts`;
        service.update({ fileName: testFile });
        const sourceFile = service.getProgram().getSourceFile(testFile);
        assert(sourceFile);
        const diagnostics = service.getDiagnostics(testFile);
        assert.equal(diagnostics.length, 0);
    });

    it('date', () => {
        const testFile = `${__dirname}/test-project/date.ts`;
        service.update({ fileName: testFile });
        const sourceFile = service.getProgram().getSourceFile(testFile);
        assert(sourceFile);
        const diagnostics = service.getDiagnostics(testFile);
        assert.equal(diagnostics.length, 0);
    });

});

it('create service no libs', () => {
    const configFile = `${__dirname}/test-project/tsconfig-nolibs.json`;
    service = lib.createService({ configFile });
    assert(service);
});