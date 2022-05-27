import { notify } from 'async-call-rpc/full'
import { MaskMessages } from '../../../shared'
import { nativeAPI, hasNativeAPI } from '../../../shared/native-rpc'
import { __deprecated__setStorage } from '../../services/helper/deprecated-storage'
import { queryOwnedPersonaInformation } from '../../services/identity'

export default function NotificationsToMobile(signal: AbortSignal) {
    if (!hasNativeAPI) return

    // we don't need response
    const forwardToMobile = notify(nativeAPI!.api.notify_visible_detected_profile_changed)
    MaskMessages.events.Native_visibleSNS_currentDetectedProfileUpdated.on((x) => forwardToMobile(x.toText()), {
        signal,
    })

    // Persona notification
    MaskMessages.events.ownPersonaChanged.on(
        async () => {
            const personas = await queryOwnedPersonaInformation(true)
            await __deprecated__setStorage<boolean>('mobileIsMyPersonasInitialized', personas.length > 0)
        },
        { signal },
    )
}
