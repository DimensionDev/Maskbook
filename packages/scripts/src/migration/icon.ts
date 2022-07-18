import { join } from 'path'
import {
    createPrinter,
    createSourceFile,
    factory,
    Identifier,
    isIdentifier,
    isImportDeclaration,
    isJsxElement,
    isJsxSelfClosingElement,
    isNamedImports,
    isSourceFile,
    JsxElement,
    JsxSelfClosingElement,
    JsxTagNamePropertyAccess,
    ModuleKind,
    Node,
    ScriptKind,
    ScriptTarget,
    SourceFile,
    StringLiteral,
    transform,
    TransformerFactory,
    visitEachChild,
} from 'typescript'
import { walk } from '../utils/walk'
import { readFile, writeFile } from 'fs/promises'
import { prettier } from '../utils'

export async function migrateIcon() {
    // change this line to migrate
    const target = join(__dirname, '../../../dashboard/src')

    for await (const path of walk(target, /\.tsx?$/)) {
        run(path)
    }
}

async function run(path: string) {
    const source = await readFile(path, 'utf8')
    const file = createSourceFile(
        path,
        source.replace(/\n\n/g, '\n/* :newline: */'),
        {
            languageVersion: ScriptTarget.Latest,
            impliedNodeFormat: ModuleKind.ESNext,
        },
        false,
        path.endsWith('.tsx') ? ScriptKind.TSX : ScriptKind.TS,
    )

    const result = transform(file, t, {})
    const code = await prettier(
        createPrinter()
            .printFile(result.transformed[0])
            .replace(/\/\* :newline: \*\//g, '\n'),
    )
    await writeFile(path, code, 'utf8')
}
function dropIcon(x: string) {
    if (x.endsWith('Icon')) return x.slice(0, -4)
    return x
}
const t: TransformerFactory<SourceFile>[] = [
    (context) => {
        // local name => real name
        const importedIcons = new Map<string, string>()

        function isTag(node: Node): node is JsxElement | JsxSelfClosingElement {
            if (isJsxElement(node) && isIdentifier(node.openingElement.tagName)) {
                return [...importedIcons.keys()].includes(node.openingElement.tagName.text)
            }
            if (isJsxSelfClosingElement(node) && isIdentifier(node.tagName)) {
                return [...importedIcons.keys()].includes(node.tagName.text)
            }
            return false
        }
        // Replace JSX
        function visitor(node: Node): Node {
            if (isImportDeclaration(node)) {
                if (
                    (node.moduleSpecifier as StringLiteral).text === '@masknet/icons' &&
                    node.importClause?.namedBindings
                ) {
                    if (isNamedImports(node.importClause.namedBindings)) {
                        for (const importSpecifier of node.importClause.namedBindings.elements) {
                            if (importSpecifier.name.text === 'GeneratedIconProps') continue
                            importedIcons.set(
                                importSpecifier.name.text,
                                importSpecifier.propertyName?.text || importSpecifier.name.text,
                            )
                        }
                    }
                }
            }
            if (isTag(node)) {
                if (isJsxElement(node)) {
                    node = visitEachChild(node, visitor, context) as JsxElement
                    if (!isJsxElement(node)) throw new Error()
                    const tagName = factory.createPropertyAccessExpression(
                        factory.createIdentifier('Icons'),
                        factory.createIdentifier(
                            dropIcon(importedIcons.get((node.openingElement.tagName as Identifier).text)!),
                        ),
                    ) as JsxTagNamePropertyAccess
                    return factory.updateJsxElement(
                        node,
                        factory.updateJsxOpeningElement(
                            node.openingElement,
                            tagName,
                            node.openingElement.typeArguments,
                            node.openingElement.attributes,
                        ),
                        node.children,
                        factory.updateJsxClosingElement(node.closingElement, tagName),
                    )
                } else {
                    node = visitEachChild(node, visitor, context) as JsxSelfClosingElement
                    if (!isJsxSelfClosingElement(node)) throw new Error()
                    const tagName = factory.createPropertyAccessExpression(
                        factory.createIdentifier('Icons'),
                        factory.createIdentifier(dropIcon(importedIcons.get((node.tagName as Identifier).text)!)),
                    ) as JsxTagNamePropertyAccess
                    return factory.updateJsxSelfClosingElement(node, tagName, node.typeArguments, node.attributes)
                }
            }
            return visitEachChild(node, visitor, context)
        }
        // insert import
        function visitor2(node: Node): Node {
            if (
                isImportDeclaration(node) &&
                node.importClause?.namedBindings &&
                (node.moduleSpecifier as StringLiteral).text === '@masknet/icons'
            ) {
                if (!isNamedImports(node.importClause.namedBindings)) return node
                return factory.updateImportDeclaration(
                    node,
                    node.decorators,
                    node.modifiers,
                    factory.updateImportClause(
                        node.importClause,
                        node.importClause.isTypeOnly,
                        node.importClause.name,
                        factory.updateNamedImports(
                            node.importClause.namedBindings,
                            node.importClause.namedBindings.elements
                                .filter((x) => !importedIcons.has(x.name.text))
                                .concat(
                                    factory.createImportSpecifier(false, undefined, factory.createIdentifier('Icons')),
                                ),
                        ),
                    ),
                    node.moduleSpecifier,
                    node.assertClause,
                )
            }
            if (isSourceFile(node)) return visitEachChild(node, visitor2, context)
            return node
        }
        return (sourceFile) => visitor2(visitor(sourceFile)) as SourceFile
    },
]
