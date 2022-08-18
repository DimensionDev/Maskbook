import type { MaskSettingsEvents } from '@masknet/shared-base'
import { ToBeListened } from '../../../shared/legacy-settings/listener'
import { MaskMessages } from '../../../shared/messages'
import { hmr } from '../../../utils-pure'

const { signal } = hmr(import.meta.webpackHot)
const listeners = ToBeListened()
const keys = Object.keys(listeners) as Array<keyof MaskSettingsEvents>
for (const key of keys) {
    signal.addEventListener(
        'abort',
        listeners[key].addListener((data) => MaskMessages.events[key].sendToAll(data as never)),
    )
}
