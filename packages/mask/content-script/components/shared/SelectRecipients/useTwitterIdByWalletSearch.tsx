import {
    ECKeyIdentifier,
    EMPTY_LIST,
    type NextIDPersonaBindings,
    NextIDPlatform,
    ProfileIdentifier,
} from '@masknet/shared-base'
import { compact, uniqBy } from 'lodash-es'

export function useTwitterIdByWalletSearch(
    bindings: NextIDPersonaBindings[] | undefined,
    value: string,
    type?: NextIDPlatform,
) {
    if (!bindings?.length || !type) return EMPTY_LIST

    const nextIdAccounts = bindings.map((binding) => {
        const proofs = uniqBy(
            binding.proofs.filter((x) => x.platform === NextIDPlatform.Twitter),
            (proof) => proof.identity,
        )
        if (!proofs.length) return null
        const linkedTwitterNames = proofs.map((x) => x.identity)
        return {
            nickname: proofs[0].identity,
            identifier: ProfileIdentifier.of('twitter.com', proofs[0].identity).expect(
                `${proofs[0].identity} should be a valid user id`,
            ),
            walletAddress: type === NextIDPlatform.Ethereum ? value : undefined,
            fromNextID: true,
            linkedTwitterNames,
            linkedPersona: ECKeyIdentifier.fromHexPublicKeyK256(binding.persona).expect(
                `${binding.persona} should be a valid hex public key in k256`,
            ),
        }
    })
    return compact(nextIdAccounts)
}
