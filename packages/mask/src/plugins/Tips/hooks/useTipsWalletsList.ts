import { BindingProof, EMPTY_LIST, NextIDStorageInfo } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-evm'
import { PluginId } from '@masknet/plugin-infra'
import { sortBy } from 'lodash-unified'

export function useTipsWalletsList(
    proofList: BindingProof[] | undefined,
    identity?: string,
    kv?: NextIDStorageInfo<BindingProof[]>,
) {
    if (!proofList || !proofList.length) return EMPTY_LIST
    const proofs = sortBy(proofList, (x) => -Number.parseInt(x.last_checked_at, 10)).map(
        (wallet, index, list): BindingProof => ({
            ...wallet,
            rawIdx: list.length - index - 1,
        }),
    )
    if (kv && kv.proofs.length > 0 && proofs.length > 0) {
        const kvCache = kv.proofs.find((x) => x.identity === identity)
        if (!kvCache) return EMPTY_LIST
        const result = proofs.reduce<BindingProof[]>((res, x) => {
            x.isDefault = 0
            x.isPublic = 1
            const temp = (kvCache?.content[PluginId.Tips]).filter((i) => isSameAddress(x.identity, i.identity))
            if (temp && temp.length > 0) {
                x.isDefault = temp[0].isDefault
                x.isPublic = temp[0].isPublic
            }
            res.push(x)
            return res
        }, [])
        const idx = result.findIndex((i) => i.isDefault)
        if (idx !== -1) {
            result.unshift(result.splice(idx, 1)[0])
        } else {
            result[0].isDefault = 1
        }
        return result
    }
    proofs.forEach((x, idx) => {
        x.isPublic = 1
        x.isDefault = 0
        if (idx === 0) {
            x.isDefault = 1
        }
    })
    return proofs
}
