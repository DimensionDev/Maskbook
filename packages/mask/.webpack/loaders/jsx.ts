/* cspell:disable jsxs */
import type { LoaderContext } from 'webpack'

const dev = `import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";`
const prod = `import { jsx as _jsx } from "react/jsx-runtime";`
const prodN = `import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";`
export default function (this: LoaderContext<{}>, source: string) {
    if (source.includes(dev)) {
        return (
            source.replace(dev, `var _jsxDEV = $jsxDev;`.padEnd(dev.length)) + `;` + dev.replace('_jsxDEV', '$jsxDev')
        )
    } else if (source.includes(prod)) {
        return source.replace(prod, `var _jsx = $jsx;`.padEnd(prod.length)) + `;` + prod.replace('_jsx', '$jsx')
    } else if (source.includes(prodN)) {
        return (
            source.replace(prodN, `var _jsx = $jsx, _jsxs = $jsxs;`.padEnd(prodN.length)) +
            `;` +
            prodN.replace('_jsxs', '$jsxs').replace('_jsx', '$jsx')
        )
    }
    return source
}
