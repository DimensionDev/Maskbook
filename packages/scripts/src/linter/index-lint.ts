import { task } from '../utils/task.js'
import { readFile } from 'fs/promises'
import { ROOT_PATH } from '../utils/paths.js'
import ts from 'typescript'

const pattern = 'packages/**/index.ts'
export async function lintIndex() {
    const { glob } = await import('glob')
    /* cspell:disable-next-line */
    const filePaths = await glob(pattern, { cwd: ROOT_PATH, nodir: true, ignore: ['**/node_modules/**'] })

    const hasSideEffect: string[] = []
    await Promise.all(
        filePaths.map(async (file) => {
            const content = await readFile(file, 'utf-8')
            if (!isOk(content)) hasSideEffect.push(file)
        }),
    )

    let msg = ''
    if (hasSideEffect.length) {
        msg += `${hasSideEffect.length} index.ts includes side effect. That blocks the optimization:\n`
        for (const f of hasSideEffect) msg += `    ${new URL(f, ROOT_PATH)}\n`
    }

    if (hasSideEffect.length) throw new Error(msg)
}
function isOk(file: string) {
    const sourceFile = ts.createSourceFile('file.ts', file, ts.ScriptTarget.ESNext, false, ts.ScriptKind.TS)
    if (sourceFile.statements.some((x) => ts.isExportDeclaration(x) && x.moduleSpecifier)) {
        return sourceFile.statements.every(isSideEffectFree)
    }
    return true
}
function isSideEffectFree(node: ts.Node) {
    const { SyntaxKind } = ts
    switch (node.kind) {
        case SyntaxKind.ImportDeclaration:
            return (node as ts.ImportDeclaration).importClause?.isTypeOnly
        case SyntaxKind.ExportDeclaration:
            return (node as ts.ExportDeclaration).moduleSpecifier || (node as ts.ExportDeclaration).isTypeOnly
        case SyntaxKind.ModuleDeclaration:
            return ts.getModifiers(node as ts.ModuleDeclaration)?.some((x) => x.kind === SyntaxKind.DeclareKeyword)
        case SyntaxKind.EmptyStatement:
        case SyntaxKind.TypeAliasDeclaration:
        case SyntaxKind.InterfaceDeclaration:
            return true
    }
    return false
}

task(lintIndex, 'lint-index', 'Lint all index file should be re-export only.')
