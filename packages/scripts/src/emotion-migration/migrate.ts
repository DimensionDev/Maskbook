/// <reference lib="esnext" />
import { resolve } from 'path'
import { visitAllTSFiles } from '../utils'
import {
    createSourceFile,
    Node,
    Identifier,
    isImportDeclaration,
    ScriptKind,
    ScriptTarget,
    VisitResult,
    transform,
    SourceFile,
    createPrinter,
    visitEachChild,
    isNamedImports,
    StringLiteral,
    isCallExpression,
    isIdentifier,
    isVariableDeclaration,
    NamedImports,
    isArrowFunction,
    isParameterPropertyDeclaration,
    VariableDeclaration,
    CallExpression,
    isBlock,
    isReturnStatement,
    EmitHint,
} from 'typescript'
export async function stats() {
    let old = new Set<string>()
    let new_ = new Set<string>()
    for await (const file of visitAllTSFiles()) {
        const f = await file.content
        if (containsMakeStylesFrom(f)) old.add(file.path)
        else if (containsMakeStylesFrom(f, '@masknet/theme')) new_.add(file.path)
    }

    const per = (100 * (new_.size / (old.size + new_.size))).toPrecision(2)
    for (const each of old) console.log(each.replaceAll('\\\\', '/'))
    console.log(`${new_.size} files migrated, ${old.size} need to migrate. ${per}% completed.`)
}
stats.displayName = 'makeStyles-stats'
stats.description = 'Count how many makeStyles needs to be migrated'

export async function migrate() {
    const target = resolve(process.cwd(), process.argv[3].slice(7))
    console.log('Migrate', target)

    for await (const file of visitAllTSFiles(target)) {
        const f = await file.content
        if (!containsMakeStylesFrom(f)) continue

        await file.setContent(migrateWorker(f))
    }
}
migrate.displayName = 'makeStyles-migrate'
migrate.description = 'Migrate files in a folder. makeStyles-migrate --path=[path]'

function containsMakeStylesFrom(source: string, target: string = '@material-ui/core') {
    const file = createSourceFile(
        'test.tsx',
        source.replaceAll('Stlye', 'Style'),
        ScriptTarget.ESNext,
        undefined,
        ScriptKind.TSX,
    )
    return file.statements
        .filter(isImportDeclaration)
        .filter((x) => (x.moduleSpecifier as Identifier).text.startsWith(target))
        .find((x) => x.importClause?.getText(file).includes('makeStyles'))
}

function migrateWorker(source: string) {
    const file = createSourceFile(
        'test.tsx',
        source.replaceAll('Stlye', 'Style'),
        ScriptTarget.ESNext,
        undefined,
        ScriptKind.TSX,
    )
    const f = transform(file, [
        (context) => (sf) => {
            const { factory } = context
            let append = false
            return visitEachChild(sf, visitor, context) as SourceFile
            function visitor(node: Node): VisitResult<Node> {
                if (isImportDeclaration(node)) {
                    if (!(node.moduleSpecifier as StringLiteral).text.startsWith('@material-ui/core')) return node
                    const result = visitEachChild(node, visitor, context)
                    if (!append) return result
                    append = false
                    // import { makeStyles } from "@masknet/theme"
                    const newOne = factory.createImportDeclaration(
                        undefined,
                        undefined,
                        factory.createImportClause(
                            false,
                            undefined,
                            factory.createNamedImports([
                                factory.createImportSpecifier(undefined, factory.createIdentifier('makeStyles')),
                            ]),
                        ),
                        factory.createStringLiteral('@masknet/theme'),
                    )
                    if ((result.importClause?.namedBindings as NamedImports)?.elements?.length === 0) return newOne
                    return [result, newOne]
                }
                if (isNamedImports(node)) {
                    const elements = node.elements.filter(
                        (x) => x.name.text !== 'makeStyles' && x.name.text !== 'Theme',
                    )
                    if (elements.length === node.elements.length) return node
                    append = true
                    return factory.updateNamedImports(node, elements)
                }

                if (isCallExpression(node)) return visitCallExpression(node)
                if (isVariableDeclaration(node)) return visitVariableDeclaration(node)

                // remove (theme: Theme) to (theme)
                if (isParameterPropertyDeclaration(node, node.parent)) {
                    if (node.type && isIdentifier(node.type) && node.type.text === 'Theme') {
                        return factory.updateParameterDeclaration(
                            node,
                            undefined,
                            undefined,
                            undefined,
                            node.name,
                            undefined,
                            undefined,
                            undefined,
                        )
                    }
                }
                return visitEachChild(node, visitor, context)
            }

            function visitVariableDeclaration(node: VariableDeclaration) {
                // const classes = useStyles()
                // to
                // const { classes } = useStyles()
                if (
                    isIdentifier(node.name) &&
                    node.initializer &&
                    isCallExpression(node.initializer) &&
                    likeUseStyle(node.initializer.expression)
                ) {
                    return factory.updateVariableDeclaration(
                        node,
                        factory.createObjectBindingPattern([
                            factory.createBindingElement(
                                undefined,
                                node.name.text === 'classes' ? undefined : factory.createIdentifier('classes'),
                                node.name,
                            ),
                        ]),
                        undefined,
                        undefined,
                        visitEachChild(node.initializer, visitor, context),
                    )
                }
                return visitEachChild(node, visitor, context)
            }

            function visitCallExpression(node: CallExpression) {
                // makeStyles(expr) => makeStyles()(expr)
                if (isIdentifier(node.expression) && node.expression.text === 'makeStyles') {
                    let [a, ...z] = node.arguments
                    // () => { return expr } to expr
                    if (a && isArrowFunction(a)) {
                        if (isBlock(a.body)) {
                            if (
                                a.parameters.length === 0 ||
                                !createPrinter().printNode(EmitHint.Unspecified, a.body, sf).includes('theme')
                            ) {
                                const [s, ...r] = a.body.statements
                                if (r.length === 0 && s && isReturnStatement(s)) a = s.expression!
                            }
                        } else if (a.parameters.length === 0) {
                            a = a.body
                        } else {
                            // (theme: Theme) => (theme)
                            a = factory.updateArrowFunction(
                                a,
                                undefined,
                                a.typeParameters,
                                a.parameters.map((x) =>
                                    factory.updateParameterDeclaration(
                                        x,
                                        undefined,
                                        undefined,
                                        undefined,
                                        x.name,
                                        undefined,
                                        undefined,
                                        undefined,
                                    ),
                                ),
                                undefined,
                                a.equalsGreaterThanToken,
                                a.body,
                            )
                        }
                    }
                    return factory.updateCallExpression(
                        node,
                        factory.createCallExpression(node.expression, undefined, undefined),
                        undefined,
                        [a, ...z],
                    )
                }
                return visitEachChild(node, visitor, context)
            }
            function likeUseStyle(x: Node) {
                if (!isIdentifier(x)) return false
                return x.text.match(/use.{0,}Styles?$/)
            }
        },
    ])
    return createPrinter({ removeComments: false }).printFile(f.transformed[0])
}
