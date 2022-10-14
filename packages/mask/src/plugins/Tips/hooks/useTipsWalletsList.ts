import { BindingProof, EMPTY_LIST, NextIDStorageInfo } from '@masknet/shared-base'
import { PluginId } from '@masknet/plugin-infra'
import { sortBy } from 'lodash-unified'
import { isSameAddress } from '@masknet/web3-shared-base'

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
        const bindings = kv.proofs.find((x) => x.identity === identity)?.content[PluginId.Tips]
        const result = proofs.map((x) => {
            x.isDefault = 0
            x.isPublic = 1
            const matched = bindings as any as {
                defaultAddress: string
                hiddenAddresses: string[]
            }
            if (matched) {
                x.isDefault = matched.defaultAddress === x.identity ? 1 : 0
                x.isPublic = matched.hiddenAddresses.some((y) => isSameAddress(y, x.identity)) ? 0 : 1
            }
            return x
        })
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
