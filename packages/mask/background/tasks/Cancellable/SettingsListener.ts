import { MaskMessages, type MaskSettingsEvents } from '@masknet/shared-base'
import { hmr } from '../../../utils-pure/index.js'
import { ToBeListened } from '../../../shared/legacy-settings/listener.js'

const { signal } = hmr(import.meta.webpackHot)
const listeners = ToBeListened()
const keys = Object.keys(listeners) as Array<keyof MaskSettingsEvents>
for (const key of keys) {
    signal.addEventListener(
        'abort',
        listeners[key].addListener((data) => MaskMessages.events[key].sendToAll(data as never)),
    )
}
