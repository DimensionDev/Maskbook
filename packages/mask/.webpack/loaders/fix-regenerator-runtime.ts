import type { LoaderContext } from 'webpack'

const reg = /Gp\[iteratorSymbol\]\s*=\s*function\s*\(\)\s*{\n\s*return this;\n\s*};/
export default function (this: LoaderContext<{}>, source: string) {
    if (reg.test(source)) {
        // this.emitWarning(new Error(' contains old version of regenerator runtime.'))
        return source.replace(reg, 'define(Gp, iteratorSymbol, function () { return this });')
    }
    return source
}
