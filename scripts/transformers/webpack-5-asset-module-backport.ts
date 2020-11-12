// This is a backward port of Webpack 5 AssetModules and native worker to Webpack 4
// https://webpack.js.org/guides/asset-modules/#root
// https://webpack.js.org/blog/2020-10-10-webpack-5-release/#asset-modules
// https://webpack.js.org/blog/2020-10-10-webpack-5-release/#native-worker-support

// This is not a full-implement.
// If you need any AssetModules feature that not supported yet, please contact @Jack-Works

// Support for AssetModules
// ✔️ `new URL("./file.png", import.meta.url)` as asset module
// ✔️ Type: asset/resource (always)
// ❌ Type: asset/inline (not supported)
// ❌ Type: asset/source (not support)
// ❌ Loaders for asset modules
// ❌ assetModuleFilename

// Support for native Workers
// ✔️ `new *Worker(new URL("./file", import.meta.url))` as worker
// ✔️ `new *Worklet(new URL("./file", import.meta.url))` as worker
// ❌ Service Worker (it will be treaded as asset module, not a worker)

// After upgraded to webpack 5, remove this file, worker-plugin and file-loader.
import {
    SourceFile,
    TransformerFactory,
    VisitResult,
    Node,
    isNewExpression,
    isIdentifier,
    isPropertyAccessExpression,
    isMetaProperty,
    SyntaxKind,
    PropertyAccessExpression,
    visitEachChild,
    Expression,
    NodeFactory,
    isStringLiteralLike,
} from 'typescript'

export default (options: { isWorker?: (name: string) => boolean } = {}): TransformerFactory<SourceFile> => {
    const isWorkerConstructor = options?.isWorker || ((name) => name.endsWith('Worker') || name.endsWith('Worklet'))
    return (context) => (file) => {
        return visit(file) as SourceFile
        function visit(node: Node): VisitResult<Node> {
            const assetPath = getAssetModule(node)
            if (assetPath) {
                if (isWorkerAsset(node)) {
                    return createRequire(context.factory, assetPath, '!worker-plugin/loader!')
                } else {
                    return createRequire(context.factory, assetPath, '!file-loader!')
                }
            }
            return visitEachChild(node, visit, context)
        }
    }
    function isWorkerAsset(node: Node) {
        const { parent } = node
        if (!parent) return false
        if (!isNewExpression(parent)) return false
        const { expression } = parent
        if (!isIdentifier(expression)) return false
        return isWorkerConstructor(expression.text)
    }
}
// create require("loaderExpr") or require(`loader${Expr}`) based on what expr is.
function createRequire(ts: NodeFactory, expr: Expression, loader: string) {
    const args: Expression[] = []
    if (isStringLiteralLike(expr)) args.push(ts.createStringLiteral(loader + expr.text))
    else
        args.push(
            ts.createTemplateExpression(ts.createTemplateHead(loader, loader), [
                ts.createTemplateSpan(expr, ts.createTemplateTail('', '')),
            ]),
        )
    return ts.createCallExpression(ts.createIdentifier('require'), void 0, args)
}
// node is new URL(?, import.meta.url)
function getAssetModule(node: Node): false | Expression {
    if (!isNewExpression(node)) return false
    const { expression, arguments: [arg0, arg1] = [] } = node
    if (!isIdentifier(expression) || expression.text !== 'URL') return false
    if (!isImportMetaURL(arg1)) return false
    return arg0
}
function isImportMetaURL(node: Node): node is PropertyAccessExpression {
    if (!isPropertyAccessExpression(node)) return false
    if (node.name.text !== 'url') return false
    node = node.expression
    if (!isMetaProperty(node)) return false
    const { keywordToken, name } = node
    if (keywordToken !== SyntaxKind.ImportKeyword) return false
    if (name.text !== 'meta') return false
    return true
}
