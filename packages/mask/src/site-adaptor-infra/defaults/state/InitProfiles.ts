import Services from '#services'
import type { SiteAdaptorUI } from '@masknet/types'
import { type ValueRef, type ProfileInformation, MaskMessages } from '@masknet/shared-base'

export function InitAutonomousStateProfiles(
    signal: AbortSignal,
    ref: SiteAdaptorUI.AutonomousState['profiles'],
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
