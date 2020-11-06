import { MaskMessage } from '../../utils/messages'
import Services from '../../extension/service'
import type { SocialNetworkUI } from '../ui'
import type { Profile } from '../../database'
import produce from 'immer'
import { IdentifierMap } from '../../database/IdentifierMap'
import { ProfileIdentifier } from '../../database/type'

function hasFingerprint(x: Profile) {
    return !!x.linkedPersona?.fingerprint
}
export function InitFriendsValueRef(self: SocialNetworkUI, network: string) {
    const ref = self.friendsRef
    Services.Identity.queryProfiles(network).then((p) => {
        const next = new IdentifierMap<ProfileIdentifier, Profile>(new Map(), ProfileIdentifier)
        for (const each of p) {
            if (!hasFingerprint(each)) continue
            next.set(each.identifier, each)
        }
        ref.value = next
    })
    MaskMessage.events.profilesChanged.on(async (events) => {
        ref.value = await produce(ref.value, async (draft) => {
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
    })
}
