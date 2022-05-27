import { Environment, isEnvironment } from '@dimensiondev/holoflows-kit'
import type { MaskSettingsEvents } from '@masknet/shared-base'
import { ToBeListened } from '../../../settings/listener'
import { MaskMessages } from '../../../utils'

export default function (signal: AbortSignal) {
    if (!isEnvironment(Environment.ManifestBackground)) return
    const listeners = ToBeListened()
    const keys = Object.keys(listeners) as Array<keyof MaskSettingsEvents>
    for (const key of keys) {
        signal.addEventListener(
            'abort',
            listeners[key].addListener((data) => MaskMessages.events[key].sendToAll(data as never)),
        )
    }
}
