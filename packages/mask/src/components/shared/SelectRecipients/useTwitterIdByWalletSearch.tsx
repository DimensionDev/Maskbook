import { EMPTY_LIST, NextIDPersonaBindings, NextIDPlatform, ProfileIdentifier } from '@masknet/shared-base'

export function useTwitterIdByWalletSearch(bindings: NextIDPersonaBindings[] | undefined, address: string) {
    if (!bindings) return EMPTY_LIST
    const temp = bindings.reduce<Record<string, any>>((pre, cur) => {
        const obj = cur.proofs.reduce<any>((obj, i) => {
            obj[i.platform] = { ...i, persona: cur.persona }
            return obj
        }, {})
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
            fingerprint: _identity.persona,
            address,
            fromNextID: true,
        })
        return res
    }, [])
}
