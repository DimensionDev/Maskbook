import { EMPTY_LIST, NextIDPersonaBindings, NextIDPlatform, ProfileIdentifier } from '@masknet/shared-base'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { uniq } from 'lodash-unified'

export function useTwitterIdByWalletSearch(bindings: NextIDPersonaBindings[] | undefined, value: string) {
    if (!bindings) return EMPTY_LIST
    const type = isValidAddress(value)
        ? NextIDPlatform.Ethereum
        : value.length >= 44
        ? NextIDPlatform.NextID
        : /^\w{1,15}$/.test(value)
        ? NextIDPlatform.Twitter
        : null

    if (!type) return []
    const temp = bindings.reduce<Record<string, any>>((pre, cur) => {
        const boundTwitterNames = cur.proofs.reduce<string[]>((res, x) => {
            if (x.platform === NextIDPlatform.Twitter) {
                res.push(x.identity)
            }
            return uniq(res)
        }, [])
        const obj = cur.proofs.reduce<any>(
            (obj, i) => {
                obj[i.platform] = { ...i, persona: cur.persona }
                return obj
            },
            {
                linkedTwitterNames: boundTwitterNames,
            },
        )
        if (NextIDPlatform.Twitter in obj) {
            pre.push(obj)
        }
        return pre
    }, [])
    return temp.reduce((res: any, x: any) => {
        const _identity = x[NextIDPlatform.Twitter]
        res.push({
            nickname: _identity.identity,
            identifier: ProfileIdentifier.of('twitter.com', _identity.identity).unwrap(),
            publicHexKey: _identity.persona,
            address: value,
            fromNextID: true,
            linkedTwitterNames: x.linkedTwitterNames,
        })
        return res
    }, [])
}
