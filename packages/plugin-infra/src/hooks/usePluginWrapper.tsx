import { noop } from 'lodash-unified'
import { createContext, useEffect, useContext, ForwardRefExoticComponent, RefAttributes } from 'react'
import type { Plugin } from '../types'
export type PluginWrapperComponent<T extends Plugin.Shared.Definition = Plugin.Shared.Definition> =
    ForwardRefExoticComponent<React.PropsWithChildren<RefAttributes<PluginWrapperMethods> & { definition: T }>>

/** @internal */
const emptyPluginWrapperMethods = {
    setWrap: noop,
    setWrapperName: noop,
    setWidth: noop,
}
/** @internal */
export const PluginWrapperMethodsContext = createContext<PluginWrapperMethods>(emptyPluginWrapperMethods)
export interface PluginWrapperMethods {
    setWrap(open: boolean): void
    setWrapperName(name: string | undefined): void
    setWidth(width: number | undefined): void
}

export function usePluginWrapper(open: boolean, options?: { width?: number; name?: string }) {
    const { setWidth, setWrap, setWrapperName } = useContext(PluginWrapperMethodsContext)
    const { width, name } = options || {}

    useEffect(() => {
        setWrap(open)
        return () => setWrap(false)
    }, [open, setWrap])
    useEffect(() => setWidth(width), [width, setWidth])
    useEffect(() => setWrapperName(name), [name, setWrapperName])
}
