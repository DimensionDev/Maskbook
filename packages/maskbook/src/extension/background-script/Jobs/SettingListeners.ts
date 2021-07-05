import { Environment, isEnvironment } from '@dimensiondev/holoflows-kit'
import { SettingsEventName, ToBeListened } from '../../../settings/listener'
import { MaskMessage } from '../../../utils'

export default function (signal: AbortSignal) {
    if (!isEnvironment(Environment.ManifestBackground)) return
    const obj = ToBeListened()
    for (const _key in obj) {
        const key = _key as keyof SettingsEventName
        signal.addEventListener(
            'abort',
            obj[key].addListener((data) => MaskMessage.events[key].sendToAll(data as never)),
        )
    }
}
