import ts from 'typescript'

export function getUsedKeys(content: string) {
    const keys = new Set<string>()
    const transformer = (context: ts.TransformationContext) => (rootNode: ts.Node) => {
        const setFromVariableWrapper = (variableValue: string): ((node: ts.Node) => ts.Node) => {
            const setFromVariable = (node: ts.Node): ts.Node => {
                if (
                    ts.isVariableDeclaration(node) &&
                    ts.isVariableDeclarationList(node.parent) &&
                    !(node.parent.flags ^ ts.NodeFlags.Const) &&
                    ts.isIdentifier(node.name) &&
                    node.name.text === variableValue &&
                    node.initializer &&
                    ts.isStringLiteralLike(node.initializer)
                ) {
                    keys.add(node.initializer.text)
                }
                return ts.visitEachChild(node, setFromVariable, context)
            }
            return setFromVariable
        }
        const addKey = (node: ts.Node) => {
            if (ts.isStringLiteralLike(node)) {
                keys.add(node.text)
            } else if (ts.isIdentifier(node)) {
                setFromVariableWrapper(node.text)(rootNode)
            } else if (ts.isJsxExpression(node) && node.expression) {
                setFromVariableWrapper(node.expression.getText())(rootNode)
            }
        }
        const checkCallExpression = (node: ts.LeftHandSideExpression | undefined): boolean => {
            if (node === undefined) {
                return false
            } else if (ts.isIdentifier(node)) {
                return node.text === 't'
            } else if (ts.isPropertyAccessExpression(node)) {
                return node.name.text === 't'
            }
            return false
        }
        const visit: ts.Visitor = (node) => {
            if (ts.isIdentifier(node) && node.text === 't') {
                const expression = ts.findAncestor(node, ts.isCallExpression)
                if (!checkCallExpression(expression?.expression)) {
                    return node
                }
                const localeKey = expression?.arguments[0]
                if (localeKey === undefined) {
                    return node
                } else if (ts.isConditionalExpression(localeKey)) {
                    addKey(localeKey.whenTrue)
                    addKey(localeKey.whenFalse)
                } else {
                    addKey(localeKey)
                }
            } else if (ts.isJsxAttribute(node) && node.name.escapedText === 'i18nKey' && node.initializer) {
                addKey(node.initializer)
            }
            return ts.visitEachChild(node, visit, context)
        }
        return ts.visitNode(rootNode, visit)
    }
    ts.transform(ts.createSourceFile('', content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX), [transformer])
    return keys
}
