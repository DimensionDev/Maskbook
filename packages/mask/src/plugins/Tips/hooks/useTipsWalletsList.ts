import { BindingProof, EMPTY_LIST, NextIDStorageInfo } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-evm'
import { PluginId } from '@masknet/plugin-infra'
import { cloneDeep } from 'lodash-unified'
export function useTipsWalletsList(proofList: BindingProof[], identity?: string, kv?: NextIDStorageInfo) {
    const _proofList = cloneDeep(proofList)
    const _kv = cloneDeep(kv)
    if (!_proofList || !_proofList.length) return EMPTY_LIST
    _proofList
        .sort((a, b) => Number.parseInt(b.last_checked_at, 10) - Number.parseInt(a.last_checked_at, 10))
        .forEach((wallet, idx) => (wallet.rawIdx = _proofList.length - idx - 1))
    if (_kv && _kv.proofs.length > 0 && _proofList.length > 0) {
        const kvCache = _kv.proofs.find((x) => x.identity === identity)
        if (!kvCache) return EMPTY_LIST
        const result: BindingProof[] = _proofList.reduce<BindingProof[]>((res, x) => {
            x.isDefault = 0
            x.isPublic = 1
            const temp = (kvCache?.content[PluginId.Tips] as BindingProof[]).filter((i) =>
                isSameAddress(x.identity, i.identity),
            )
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
    _proofList.forEach((x, idx) => {
        x.isPublic = 1
        x.isDefault = 0
        if (idx === 0) {
            x.isDefault = 1
            return
        }
    })
    return _proofList
}
