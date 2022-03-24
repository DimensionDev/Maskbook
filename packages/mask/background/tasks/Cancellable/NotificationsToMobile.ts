import { notify } from 'async-call-rpc/full'
import { MaskMessages } from '@masknet/plugin-wallet'
import { nativeAPI, hasNativeAPI } from '../../../shared/native-rpc'
export default function NotificationsToMobile(signal: AbortSignal) {
    if (!hasNativeAPI) return

    // we don't need response
    const forwardToMobile = notify(nativeAPI!.api.notify_visible_detected_profile_changed)
    MaskMessages.events.Native_visibleSNS_currentDetectedProfileUpdated.on(forwardToMobile, { signal })
}
