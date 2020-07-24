import React, { useEffect, useRef, useState } from 'react'
import { registerHMR } from './hmr-client'
import { useUpdate } from 'react-use'
const symb = Symbol.for('HMR')
// Future work: React refresh https://github.com/facebook/react/issues/16604#issuecomment-528663101
export function hmr<T extends Function>(component: T, meta: ImportMeta, key = component.name): typeof component {
    if (process.env.NODE_ENV === 'production') return component
    let Component = component
    const WrappedElement = React.forwardRef((props, ref: any) => {
        const C = useRef(Component)
        const refresh = useUpdate()
        useEffect(() => {
            return registerHMR(meta, async () => {
                const newModule = await import(meta.url + '?now' + Date.now())
                if (!newModule[key])
                    return console.warn(
                        'HMR: please ensure the export function name is',
                        key,
                        'or you can provide the third function to specify one.',
                    )
                Component = newModule[key][symb]
                C.current = Component
                refresh()
            })
        })
        return <C.current {...props} ref={ref} />
    })
    // @ts-ignore
    WrappedElement.displayName = (Component.displayName || Component.name) + ' (HMR)'
    // @ts-ignore
    WrappedElement.defaultProps = Component.defaultProps
    // @ts-ignore
    WrappedElement[symb] = component
    return WrappedElement as any
}
