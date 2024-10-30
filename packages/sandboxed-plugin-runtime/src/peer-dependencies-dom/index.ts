import * as react from 'react'
import * as react_jsx_runtime from 'react/jsx-runtime'
import * as react_dom from 'react-dom'
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
