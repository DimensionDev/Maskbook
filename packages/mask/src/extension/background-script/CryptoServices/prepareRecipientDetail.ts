import { ProfileIdentifier } from '../../../database/type'
import { queryPublicKey } from '../../../database'
import { IdentifierMap } from '../../../database/IdentifierMap'
import type { RecipientDetail, RecipientReason } from '../../../../background/database/post'
import type { EC_Public_JsonWebKey } from '../../../modules/CryptoAlgorithm/interfaces/utils'

export async function prepareRecipientDetail(to: ProfileIdentifier[]) {
    const recipients = new IdentifierMap<ProfileIdentifier, RecipientDetail>(new Map(), ProfileIdentifier)
    const keys = new IdentifierMap<ProfileIdentifier, EC_Public_JsonWebKey>(new Map(), ProfileIdentifier)
    await Promise.all(
        to.map(async function self(who, _, __, detail: RecipientReason = { at: new Date(), type: 'direct' }) {
            const pub = await queryPublicKey(who)
            if (pub) keys.set(who, pub)
            append(who, detail)
        }),
    )
    function append(who: ProfileIdentifier, reason: RecipientReason) {
        if (!recipients.has(who)) recipients.set(who, { reason: [] })
        recipients.get(who)!.reason.push(reason)
    }
    return [recipients, keys] as const
}
