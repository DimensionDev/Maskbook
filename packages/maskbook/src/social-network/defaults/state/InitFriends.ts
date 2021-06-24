import { IdentifierMap, ProfileIdentifier } from '@masknet/shared'
import produce from 'immer'
import type { Profile } from '../../../database'
import Services from '../../../extension/service'
import { MaskMessage } from '../../../utils/messages'
import type { SocialNetworkUI } from '../../types'

function hasFingerprint(x: Profile) {
    return !!x.linkedPersona?.fingerprint
}
export function InitAutonomousStateFriends(
    signal: AbortSignal,
    ref: SocialNetworkUI.AutonomousState['friends'],
    network: string,
) {
    Services.Identity.queryProfiles(network).then((p) => {
        if (signal.aborted) return
        const next = new IdentifierMap<ProfileIdentifier, Profile>(new Map(), ProfileIdentifier)
        for (const each of p) {
            if (!hasFingerprint(each)) continue
            next.set(each.identifier, each)
        }
        ref.value = next
    })
    signal.addEventListener(
        'abort',
        MaskMessage.events.profilesChanged.on(async (events) => {
            // eslint-disable-next-line @typescript-eslint/await-thenable
            const newVal = await produce(ref.value, async (draft) => {
                for (const event of events) {
                    if (event.of.network !== network) continue
                    if (event.reason === 'delete') draft.delete(event.of)
                    else {
                        const data = await Services.Identity.queryProfile(event.of)
                        // Argument of type 'Profile' is not assignable to parameter of type 'WritableDraft<Profile>'.
                        if (data) draft.set(event.of, data as any)
                        else draft.delete(event.of)
                    }
                }
            })
            if (signal.aborted) return
            ref.value = newVal
        }),
    )
}
