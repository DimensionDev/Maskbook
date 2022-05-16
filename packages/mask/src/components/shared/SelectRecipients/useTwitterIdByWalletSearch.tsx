import {
    BindingProof,
    ECKeyIdentifier,
    EMPTY_LIST,
    NextIDPersonaBindings,
    NextIDPlatform,
    ProfileIdentifier,
} from '@masknet/shared-base'
import { uniq } from 'lodash-unified'

interface ExpandedNextIDBindings extends BindingProof {
    persona: string
}
interface ResolvedBindings extends Record<NextIDPlatform, ExpandedNextIDBindings> {
    linkedTwitterNames: string[]
}

export function useTwitterIdByWalletSearch(
    bindings: NextIDPersonaBindings[] | undefined,
    value: string,
    type?: NextIDPlatform,
) {
    if (!bindings || !type) return EMPTY_LIST
    const temp = bindings.reduce<ResolvedBindings[]>((pre, cur) => {
        const boundTwitterNames = uniq(
            cur.proofs.filter((x) => x.platform === NextIDPlatform.Twitter).map((x) => x.identity),
        )
        const obj: Partial<ResolvedBindings> = Object.assign(
            { linkedTwitterNames: boundTwitterNames },
            ...cur.proofs.filter((x) => [NextIDPlatform.Twitter, NextIDPlatform.Ethereum].includes(x.platform)),
        )
        pre.push(obj as ResolvedBindings)
        return pre
    }, [])
    return temp.map((x) => {
        const _identity = x[NextIDPlatform.Twitter]
        return {
            nickname: _identity.identity,
            identifier: ProfileIdentifier.of('twitter.com', _identity.identity).unwrap(),
            walletAddress: type === NextIDPlatform.Ethereum ? value : undefined,
            fromNextID: true,
            linkedTwitterNames: x.linkedTwitterNames,
            linkedPersona: ECKeyIdentifier.fromHexPublicKeyK256(_identity.persona).unwrap(),
        }
    })
}
