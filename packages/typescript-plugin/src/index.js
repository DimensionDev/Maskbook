// @ts-check
/** @import { server, LanguageService, SourceFile, Node, ObjectLiteralExpression } from 'typescript' */
/** @type {server.PluginModuleFactory} */
// TODO: add rename, getAllReference, getQuickInfoAtPosition
module.exports = ({ typescript: ts }) => {
    const { SyntaxKind, forEachChild, TypeFlags } = ts
    return {
        create({ languageService, config }) {
            const define = config?.define || ['makeStyle', 'makeStyles']

            // Set up decorator object
            /** @type {LanguageService} */ const wrapped = /** @type {any} */ ({ __proto__: null })
            for (let k of Object.keys(languageService)) {
                const method = languageService[k]
                wrapped[k] = method.bind(languageService)
            }

            wrapped.getDefinitionAndBoundSpan = (fileName, position) => {
                const orig = languageService.getDefinitionAndBoundSpan(fileName, position)
                const program = languageService.getProgram()
                if (!program) return orig
                const sourceFile = program.getSourceFile(fileName)
                if (!sourceFile) return orig
                const checker = program.getTypeChecker()
                const node = getNodeAtPosition(sourceFile, position)
                // test if position is in object.property
                //                               ^ here
                if (
                    ts.isIdentifier(node) &&
                    node.parent &&
                    ts.isPropertyAccessExpression(node.parent) &&
                    ts.isIdentifier(node.parent.expression) &&
                    node.parent.name === node &&
                    checker.getTypeAtLocation(node).flags & TypeFlags.String
                ) {
                    const objectDef = languageService.getDefinitionAtPosition(
                        fileName,
                        node.parent.expression.getStart(),
                    )
                    if (!objectDef?.length) return orig
                    const objectNode = getNodeAtPosition(sourceFile, objectDef[0].textSpan.start)
                    if (
                        // test if object comes from "{ object, ... } = useSomeName()"
                        !(
                            ts.isIdentifier(objectNode) &&
                            objectNode.parent &&
                            ts.isBindingElement(objectNode.parent) &&
                            ts.isObjectBindingPattern(objectNode.parent.parent) &&
                            ts.isVariableDeclaration(objectNode.parent.parent.parent) &&
                            objectNode.parent.parent.parent.initializer &&
                            ts.isCallExpression(objectNode.parent.parent.parent.initializer) &&
                            ts.isIdentifier(objectNode.parent.parent.parent.initializer.expression) &&
                            objectNode.parent.parent.parent.initializer.expression.text.startsWith('use')
                        )
                    )
                        return orig
                    const hookDefinition = languageService.getDefinitionAtPosition(
                        fileName,
                        objectNode.parent.parent.parent.initializer.expression.getStart(),
                    )
                    if (!hookDefinition?.length) return orig
                    const [definition] = hookDefinition

                    const hookDefinitionFile = program.getSourceFile(definition.fileName)
                    if (!hookDefinitionFile) return orig
                    const hookDefinitionNode = getNodeAtPosition(hookDefinitionFile, definition.textSpan.start)
                    if (
                        // const useSomeName = ...
                        ts.isVariableDeclaration(hookDefinitionNode.parent) &&
                        hookDefinitionNode.parent.initializer &&
                        // const useSomeName = ...()
                        ts.isCallExpression(hookDefinitionNode.parent.initializer) &&
                        // const useSomeName = makeStyles(...) or const useSomeName = makeStyles()(...)
                        ((ts.isIdentifier(hookDefinitionNode.parent.initializer.expression) &&
                            define.includes(hookDefinitionNode.parent.initializer.expression.text)) ||
                            (ts.isCallExpression(hookDefinitionNode.parent.initializer.expression) &&
                                ts.isIdentifier(hookDefinitionNode.parent.initializer.expression.expression) &&
                                define.includes(hookDefinitionNode.parent.initializer.expression.expression.text)))
                    ) {
                        const styleContainer = hookDefinitionNode.parent.initializer.arguments[0]
                        const span = { start: 0, length: 0 }
                        /** @type {ObjectLiteralExpression | undefined} */ let styleDefinitionNode
                        // makeStyles({ ... })
                        if (ts.isObjectLiteralExpression(styleContainer)) {
                            styleDefinitionNode = styleContainer
                        } else if (
                            ts.isParenthesizedExpression(styleContainer) &&
                            ts.isObjectLiteralExpression(styleContainer.expression)
                        ) {
                            styleDefinitionNode = styleContainer.expression
                        }
                        // makeStyles(() => ({ ... }))
                        else if (ts.isFunctionLike(styleContainer) && styleContainer.body) {
                            if (ts.isObjectLiteralExpression(styleContainer.body)) {
                                styleDefinitionNode = styleContainer.body
                            } else if (
                                ts.isParenthesizedExpression(styleContainer.body) &&
                                ts.isObjectLiteralExpression(styleContainer.body.expression)
                            ) {
                                styleDefinitionNode = styleContainer.body.expression
                            } else if (ts.isBlock(styleContainer.body)) {
                                const returnStatement = styleContainer.body.statements.findLast(ts.isReturnStatement)
                                if (
                                    returnStatement &&
                                    returnStatement.expression &&
                                    ts.isObjectLiteralExpression(returnStatement.expression)
                                )
                                    styleDefinitionNode = returnStatement.expression
                            }
                        }
                        if (!styleDefinitionNode) return orig
                        for (const property of styleDefinitionNode.properties || []) {
                            if (ts.isPropertyAssignment(property) && property.name && ts.isIdentifier(property.name)) {
                                if (property.name.text === node.text) {
                                    span.start = property.name.getStart()
                                    span.length = property.name.getWidth()
                                    break
                                }
                            }
                        }
                        return {
                            textSpan: span,
                            definitions: [
                                {
                                    containerKind: ts.ScriptElementKind.unknown,
                                    containerName: '',
                                    fileName: hookDefinitionFile.fileName,
                                    kind: ts.ScriptElementKind.memberVariableElement,
                                    name: node.text,
                                    textSpan: span,
                                    unverified: true,
                                },
                            ],
                        }
                    }
                }
                return orig
            }

            return wrapped
        },
    }

    /**
     * @param {SourceFile} sourceFile
     * @param {number} position
     * @returns {Node}
     */
    function getNodeAtPosition(sourceFile, position) {
        /** @type {Node} */
        let current = sourceFile
        const getContainingChild = (/** @type {Node} */ child) => {
            if (
                child.pos <= position &&
                (position < child.end || (position === child.end && child.kind === SyntaxKind.EndOfFileToken))
            ) {
                return child
            }
        }
        while (true) {
            const child = forEachChild(current, getContainingChild)
            if (!child) {
                return current
            }
            current = child
        }
    }
}
