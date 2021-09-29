import { MaskMessages } from '../../../utils/messages'
import Services from '../../../extension/service'
import type { SocialNetworkUI } from '../../types'
import type { ValueRef } from '@dimensiondev/holoflows-kit'
import type { Profile } from '../../../database'

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

    async function query(network: string, ref: ValueRef<readonly Profile[]>) {
        const val = await Services.Identity.queryMyProfiles(network)
        if (signal.aborted) return
        ref.value = val
    }
}
