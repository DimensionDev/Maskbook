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

    return bindings.map((binding) => {
        const proofs = uniqBy(
            binding.proofs.filter((x) => x.platform === NextIDPlatform.Twitter),
            (proof) => proof.identity,
        )
        const linkedTwitterNames = proofs.map((x) => x.identity)
        return {
            nickname: proofs[0].identity,
            identifier: ProfileIdentifier.of('twitter.com', proofs[0].identity).unwrap(),
            walletAddress: type === NextIDPlatform.Ethereum ? value : undefined,
            fromNextID: true,
            linkedTwitterNames,
            linkedPersona: ECKeyIdentifier.fromHexPublicKeyK256(binding.persona).unwrap(),
        }
    })
}
