import { Environment, isEnvironment } from '@dimensiondev/holoflows-kit'
import type { MaskSettingsEvents } from '@masknet/shared-base'
import { ToBeListened } from '../../../settings/listener'
import { MaskMessages } from '../../../utils'

export default function (signal: AbortSignal) {
    if (!isEnvironment(Environment.ManifestBackground)) return
    const obj = ToBeListened()
    for (const _key in obj) {
        const key = _key as keyof MaskSettingsEvents
        signal.addEventListener(
            'abort',
            obj[key].addListener((data: any) => MaskMessages.events[key].sendToAll(data as never)),
        )
    }
}
