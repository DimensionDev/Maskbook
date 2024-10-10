import * as react from 'react'
import * as react_jsx_runtime from 'react/jsx-runtime'
import * as react_dom from 'react-dom'
import { Trans as Trans2, useTranslation } from 'react-i18next'
import * as mui_material from '@mui/material'
import { makeStyles, MaskDialog } from '@masknet/theme'
import * as masknet_icons from '@masknet/icons/jsx'
import type { PluginRuntime } from '../runtime/runtime.js'

export function addPeerDependenciesDOM(runtime: PluginRuntime) {
    runtime.addNamespaceModule('react', esModuleInterop(react))
    runtime.addNamespaceModule('react/jsx-runtime', esModuleInterop(react_jsx_runtime))
    runtime.addNamespaceModule('react-dom', esModuleInterop(react_dom))
    runtime.addNamespaceModule('@mui/material', mui_material)
    runtime.addNamespaceModule('@masknet/theme', { makeStyles, MaskDialog })
    runtime.addNamespaceModule('@masknet/icons', { Icons: masknet_icons })
}

function esModuleInterop(object: any) {
    return { default: object, ...object }
}

function createProxy(initValue: (key: string) => any) {
    function set(key: string) {
        const value = initValue(key)
        Object.defineProperty(container, key, { value, configurable: true })
        return value
    }
    const container = {
        __proto__: new Proxy(
            { __proto__: null },
            {
                get(_, key) {
                    if (typeof key === 'symbol') return undefined
                    return set(key)
                },
            },
        ),
    }
    return new Proxy(container, {
        getPrototypeOf: () => null,
        setPrototypeOf: (_, v) => v === null,
        getOwnPropertyDescriptor: (_, key) => {
            if (typeof key === 'symbol') return undefined
            if (!(key in container)) set(key)
            return Object.getOwnPropertyDescriptor(container, key)
        },
    })
}
export function createI18nHooksAndTranslate(id: string) {
    return {
        useI18N() {
            const { t } = useTranslation(id)
            return react.useMemo(() => createProxy((key) => t.bind(null, key)), [t])
        },
        Translate: createProxy(
            (key: string) => (props: any) => react.createElement(Trans2, { i18nKey: key, ns: id, ...props }),
        ),
    }
}
