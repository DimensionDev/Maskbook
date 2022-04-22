/* cspell:disable-next-line */
import { async, awrap, isGeneratorFunction, keys, mark, values, wrap } from 'regenerator-runtime'

globalThis.regeneratorRuntime = new Proxy(
    Object.freeze({
        async,
        /* cspell:disable-next-line */
        awrap,
        isGeneratorFunction,
        keys,
        mark,
        values,
        wrap,
    }),
    {
        get(...args) {
            console.debug('Try to access regeneratorRuntime')
            return Reflect.get(...args)
        },
    },
)
