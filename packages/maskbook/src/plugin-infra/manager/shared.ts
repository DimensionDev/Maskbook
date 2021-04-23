import type { Plugin } from '../types'

export interface ActivatedPluginInstance<U extends Plugin.UI.Definition | Plugin.Worker.Definition> {
    instance: U
    controller: AbortController
}
