import {
    ECKeyIdentifier,
    EMPTY_LIST,
    NextIDPersonaBindings,
    NextIDPlatform,
    ProfileIdentifier,
} from '@masknet/shared-base'
import { uniqBy } from 'lodash-unified'

export function useTwitterIdByWalletSearch(
    bindings: NextIDPersonaBindings[] | undefined,
    value: string,
    type?: NextIDPlatform,
) {
    if (!bindings || !type) return EMPTY_LIST

    return bindings
        .map((cur) => {
            const proofs = uniqBy(cur.proofs, (proof) => proof.platform && proof.identity).filter(
                (x) => x.platform === NextIDPlatform.Twitter,
            )
            return {
                linkedTwitterNames: proofs.map((x) => x.identity),
                persona: cur.persona,
                detail: proofs,
            }
        })
        .map((x) => ({
            nickname: x.detail[0].identity,
            identifier: ProfileIdentifier.of('twitter.com', x.detail[0].identity).unwrap(),
            walletAddress: type === NextIDPlatform.Ethereum ? value : undefined,
            fromNextID: true,
            linkedTwitterNames: x.linkedTwitterNames,
            linkedPersona: ECKeyIdentifier.fromHexPublicKeyK256(x.persona).unwrap(),
        }))
}
