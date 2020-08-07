import type { loader } from 'webpack'
export default function loader(this: loader.LoaderContext, source: string) {
    this.cacheable(true)
    return transpileModule(source, {
        compilerOptions: {
            target: ScriptTarget.ESNext,
            module: ModuleKind.ESNext,
            jsx: JsxEmit.Preserve,
            importsNotUsedAsValues: ImportsNotUsedAsValues.Remove,
            sourceMap: false,
        },
        transformers: {
            after: [TreeShakeTransformer(source.includes('import('))],
        },
    }).outputText
}
export function transform() {
    return TreeShakeTransformer(true)
}

function TreeShakeTransformer<T extends Node>(usingImportCall: boolean): TransformerFactory<T> {
    return (context) => {
        const importCalls: CallExpression[] = []
        const visit: Visitor = (node): VisitResult<Node> => {
            if (isImportCall(node)) importCalls.push(node)
            return visitEachChild(node, (child) => visit(child), context)
        }
        return (node) => {
            if (usingImportCall) visitNode(node, visit)
            if (isSourceFile(node)) {
                const imports = node.statements.filter(isImportDeclaration).map(dropLocalImport).filter(truthy)
                const exports = node.statements.filter(isExportDeclaration).map(dropLocalExport).filter(truthy)
                return updateSourceFileNode(
                    node,
                    [
                        ...imports,
                        ...exports,
                        ...imports.map(createRegisterFromImport),
                        // @ts-ignore
                        ...exports.flatMap(createRegisterFromExport),
                        ...importCalls.map(createRegisterFromImportCall),
                    ].filter((x) => !isEmptyStatement(x)),
                    false,
                    [],
                    [],
                    false,
                    [],
                ) as any
            }
            return node
        }
    }
}
/**
 * For any external import, register them by _d(moduleName, { exports })
 */
function createRegisterFromImport(node: ImportDeclaration) {
    const c = node.importClause
    if (!c) return createEmptyStatement()
    const bindings: Expression[] = []
    if (c.namedBindings) {
        // import * as x from 'y' => _d('y', x)
        if (isNamespaceImport(c.namedBindings)) {
            bindings.push(c.namedBindings.name)
        } else {
            // import { a: b, c: d } from 'y' => _d('y', { a: b, c: d })
            bindings.push(createObjectLiteral(c.namedBindings.elements.map(createBinding)))
        }
    }
    // import x from 'y' => _d('y', { default: x })
    if (c.name) bindings.push(createObjectLiteral([createPropertyAssignment('default', c.name)]))
    return createExpressionStatement(createRegisterCall(node.moduleSpecifier, ...bindings))
    function createBinding(node: ImportSpecifier) {
        if (node.propertyName) return createPropertyAssignment(node.propertyName, node.name)
        return createShorthandPropertyAssignment(node.name)
    }
}
/**
 * import('x') => _d('x', import('x'))
 */
function createRegisterFromImportCall(node: CallExpression) {
    if (!isImportCall(node)) return createEmptyStatement()
    const arg0 = node.arguments[0]
    if (isStringLiteral(arg0) && arg0.text.startsWith('.')) return createImportDeclaration(void 0, void 0, void 0, arg0)
    return createEmptyStatement()
}
/**
 * export { x as y } from 'z'
 * =>
 * import { x as y } from 'z'
 * export { y: x }
 */
function createRegisterFromExport(e: ExportDeclaration | ImportDeclaration) {
    if (isImportDeclaration(e)) return [createRegisterFromImport(e)]
    const node = e.exportClause!
    if (isNamedExports(node)) {
        const ghostBindings = new Map<ExportSpecifier, Identifier>()
        const ghostImportDeclaration = createImportDeclaration(
            undefined,
            undefined,
            createImportClause(
                undefined,
                createNamedImports(
                    node.elements.map<ImportSpecifier>((x) => {
                        const id = createFileLevelUniqueName(x.name.text)
                        ghostBindings.set(x, id)
                        return createImportSpecifier(x.propertyName || createIdentifier(x.name.text), id)
                    }),
                ),
            ),
            e.moduleSpecifier!,
        )
        const register = createRegisterFromImport(ghostImportDeclaration)
        return [ghostImportDeclaration, register]
    } else if (isNamespaceExport?.(node)) {
        const ghostImport = createImportDeclaration(
            void 0,
            void 0,
            createImportClause(createFileLevelUniqueName(node.name.text), void 0),
            e.moduleSpecifier!,
        )
        return [ghostImport, createRegisterFromImport(ghostImport)]
    }
    return []
}
/**
 * import { x, y } from './z' => import './z'
 */
function dropLocalImport(node: ImportDeclaration) {
    const x = node.moduleSpecifier
    if (!isStringLiteral(x)) return node
    if (node.importClause?.isTypeOnly) return null
    if (!x.text.startsWith('.')) return node
    if (x.text.endsWith('.json')) return null
    return updateImportDeclaration(node, void 0, void 0, void 0, x)
}
function dropLocalExport(node: ExportDeclaration) {
    const path = node.moduleSpecifier
    if (!path) return null
    if (!isStringLiteral(path)) return null!
    if (node.isTypeOnly) return null
    // export { } from './x' => import './x'
    // export * from './x' => import './x'
    if (path.text.startsWith('.') || !node.exportClause) return createImportDeclaration(void 0, void 0, void 0, path)
    return node
}
function isImportCall(node: Node): node is CallExpression {
    if (!isCallExpression(node)) return false
    if (node.expression.kind !== SyntaxKind.ImportKeyword) return false
    return true
}
function createRegisterCall(...args: Expression[]) {
    return createCall(createIdentifier('_d'), void 0, args)
}
function truthy<T>(x: T | undefined | null): x is T {
    return !!x
}
import {
    CallExpression,
    isCallExpression,
    isSourceFile,
    ModuleKind,
    ScriptTarget,
    Node,
    SyntaxKind,
    TransformerFactory,
    transpileModule,
    updateSourceFileNode,
    visitEachChild,
    visitNode,
    Visitor,
    VisitResult,
    createExpressionStatement,
    JsxEmit,
    isExportDeclaration,
    isImportDeclaration,
    createCall,
    ImportDeclaration,
    ExportDeclaration,
    isStringLiteral,
    updateImportDeclaration,
    createEmptyStatement,
    isNamespaceImport,
    Expression,
    createObjectLiteral,
    createPropertyAssignment,
    ImportSpecifier,
    createIdentifier,
    createImportDeclaration,
    isNamedExports,
    ExportSpecifier,
    Identifier,
    createImportClause,
    createNamedImports,
    createFileLevelUniqueName,
    createImportSpecifier,
    isNamespaceExport,
    isEmptyStatement,
    ImportsNotUsedAsValues,
    createShorthandPropertyAssignment,
} from 'typescript'
