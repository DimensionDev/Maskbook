import { NextIDPlatform } from '@masknet/shared-base'
import { NextIDStorage } from '@masknet/web3-providers'

export const getWalletHiddenList = async (publicKey: string) => {
    if (!publicKey) return
    const res = await NextIDStorage.get(publicKey)
    if (res) {
        return res?.val?.proofs?.find((x) => x.platform === NextIDPlatform.Twitter)?.content?.['com.mask.plugin']
    }
}
