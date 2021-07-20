import { GroupIdentifier, ProfileIdentifier } from '../../../database/type'
import { queryPublicKey } from '../../../database'
import { IdentifierMap } from '../../../database/IdentifierMap'
import type { RecipientDetail, RecipientReason } from '../../../database/post'
import { queryUserGroup } from '../UserGroupService'
import type { EC_Public_JsonWebKey } from '../../../modules/CryptoAlgorithm/interfaces/utils'
import { unreachable } from '@dimensiondev/kit'

export async function prepareRecipientDetail(to: (ProfileIdentifier | GroupIdentifier)[]) {
    const recipients = new IdentifierMap<ProfileIdentifier, RecipientDetail>(new Map(), ProfileIdentifier)
    const keys = new IdentifierMap<ProfileIdentifier, EC_Public_JsonWebKey>(new Map(), ProfileIdentifier)
    await Promise.all(
        to.map(async function self(who, _, __, detail: RecipientReason = { at: new Date(), type: 'direct' }) {
            if (who instanceof ProfileIdentifier) {
                const pub = await queryPublicKey(who)
                if (pub) keys.set(who, pub)
                append(who, detail)
            } else if (who instanceof GroupIdentifier) {
                const group = await queryUserGroup(who)
                if (!group) return // ? should we throw?
                await Promise.all(
                    group.members.map((x) => self(x, _, __, { type: 'group', at: new Date(), group: who })),
                )
            } else unreachable(who)
        }),
    )
    function append(who: ProfileIdentifier, reason: RecipientReason) {
        if (!recipients.has(who)) recipients.set(who, { reason: [] })
        recipients.get(who)!.reason.push(reason)
    }
    return [recipients, keys] as const
}
