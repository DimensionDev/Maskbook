import {
    BindingProof,
    ECKeyIdentifier,
    EMPTY_LIST,
    EMPTY_OBJECT,
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
        const obj = cur.proofs.reduce<Partial<ResolvedBindings>>(
            (j, i) => {
                if (![NextIDPlatform.Twitter, NextIDPlatform.Ethereum].includes(i.platform)) return EMPTY_OBJECT
                j[i.platform] = { ...i, persona: cur.persona }
                return j
            },
            {
                linkedTwitterNames: boundTwitterNames,
            },
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
