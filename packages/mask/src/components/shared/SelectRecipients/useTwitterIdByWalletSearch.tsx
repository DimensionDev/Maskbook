import {
    BindingProof,
    ECKeyIdentifier,
    EMPTY_LIST,
    EMPTY_OBJECT,
    NextIDPersonaBindings,
    NextIDPlatform,
    ProfileIdentifier,
    ProfileInformationFromNextID,
} from '@masknet/shared-base'
import { uniq } from 'lodash-unified'

interface ExpandedNextIDBindings extends BindingProof {
    persona: string
}

type ResolvedBindingsByPlatform = {
    [key in NextIDPlatform]: ExpandedNextIDBindings
}
interface ResolvedBindings extends ResolvedBindingsByPlatform {
    linkedTwitterNames: string[]
}

export function useTwitterIdByWalletSearch(
    bindings: NextIDPersonaBindings[] | undefined,
    value: string,
    type?: NextIDPlatform,
) {
    if (!bindings || !type) return EMPTY_LIST
    const temp = bindings.reduce<ResolvedBindings[]>((pre, cur) => {
        const boundTwitterNames = cur.proofs.reduce<string[]>((res, x) => {
            if (x.platform === NextIDPlatform.Twitter) {
                res.push(x.identity)
            }
            return uniq(res)
        }, [])
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
        if (NextIDPlatform.Twitter in obj) {
            pre.push(obj as ResolvedBindings)
        }
        return pre
    }, [])
    return temp.reduce<ProfileInformationFromNextID[]>((res, x) => {
        const _identity = x[NextIDPlatform.Twitter]
        res.push({
            nickname: _identity.identity,
            identifier: ProfileIdentifier.of('twitter.com', _identity.identity).unwrap(),
            walletAddress: value,
            fromNextID: true,
            linkedTwitterNames: x.linkedTwitterNames,
            linkedPersona: ECKeyIdentifier.fromHexPublicKeyK256(_identity.persona).unwrap(),
        })
        return res
    }, [])
}
