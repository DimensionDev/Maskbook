import { NextIDPlatform } from '@masknet/shared-base'
import { NextIDStorage } from '@masknet/web3-providers'
import { PLUGIN_ID } from '../../constants'
export const getWalletHiddenList = async (publicKey: string) => {
    if (!publicKey) return
    const res = await NextIDStorage.get(publicKey)
    console.log('res', res)
    const hiddenObj = {
        hiddenWallets: {},
        hiddenCollections: {},
    }
    if (res) {
        res?.val?.proofs
            ?.filter((x) => x.platform === NextIDPlatform.Twitter)
            ?.forEach((y) => {
                hiddenObj.hiddenWallets[y.identity] = y?.content?.[PLUGIN_ID]?.hiddenAddresses
                hiddenObj.hiddenCollections[y.identity] = y?.content?.[PLUGIN_ID]?.unListedCollections
            })
        return hiddenObj
    }
    return
}
