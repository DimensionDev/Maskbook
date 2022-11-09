import { MaskMessages } from '../../../utils/messages.js'
import Services from '../../../extension/service.js'
import type { SocialNetworkUI } from '@masknet/types'
import type { ValueRef } from '@dimensiondev/holoflows-kit'
import type { ProfileInformation } from '@masknet/shared-base'

export function InitAutonomousStateProfiles(
    signal: AbortSignal,
    ref: SocialNetworkUI.AutonomousState['profiles'],
    network: string,
) {
    query(network, ref)
    signal.addEventListener(
        'abort',
        MaskMessages.events.ownPersonaChanged.on(() => query(network, ref)),
    )

    async function query(network: string, ref: ValueRef<readonly ProfileInformation[]>) {
        const val = await Services.Identity.queryOwnedProfilesInformation(network)
        if (signal.aborted) return
        ref.value = val
    }
}
