import { createContext, useEffect, useContext, type PropsWithChildren, type RefAttributes } from 'react'
import { noop } from 'lodash-es'
import type { Plugin } from '../types.js'

export interface PluginWrapperComponentProps<T extends Plugin.Shared.Definition = Plugin.Shared.Definition>
    extends PropsWithChildren,
        RefAttributes<PluginWrapperMethods> {
    definition: T
    lackHostPermission?: boolean
}

const emptyPluginWrapperMethods = {
    setWrap: noop,
    setWrapperName: noop,
    setWidth: noop,
}
/** @internal */
export const PluginWrapperMethodsContext = createContext<PluginWrapperMethods>(emptyPluginWrapperMethods)
PluginWrapperMethodsContext.displayName = 'PluginWrapperMethodsContext'
export interface PluginWrapperMethods {
    setWrap(open: boolean): void
    setWrapperName(name: string | undefined): void
    setWidth(width: number | undefined): void
}

export function usePluginWrapper(
    open: boolean,
    options?: {
        width?: number
        name?: string
    },
) {
    const { setWidth, setWrap, setWrapperName } = useContext(PluginWrapperMethodsContext)
    const { width, name } = options || {}

    useEffect(() => {
        setWrap(open)
        return () => setWrap(open)
    }, [open, setWrap])
    useEffect(() => setWidth(width), [width, setWidth])
    useEffect(() => setWrapperName(name), [name, setWrapperName])
}
