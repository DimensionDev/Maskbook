import { NextIDPlatform } from '@masknet/shared-base'
import { NextIDStorage } from '@masknet/web3-providers'
import { PLUGIN_ID } from '../../constants'
import type { personaKV, WalletsCollection } from '../types'
export const getWalletHiddenList = async (publicKey: string) => {
    if (!publicKey) return
    const res = await NextIDStorage.get<personaKV>(publicKey)
    console.log('res', res)
    const hiddenObj:
        | {
              hiddenWallets: Record<string, WalletsCollection>
              hiddenCollections: Record<
                  string,
                  Record<
                      string,
                      {
                          Donations: string[]
                          Footprints: string[]
                      }
                  >
              >
          }
        | undefined = { hiddenWallets: {}, hiddenCollections: {} }
    if (res) {
        ;(res?.val as personaKV)?.proofs
            ?.filter((x) => x.platform === NextIDPlatform.Twitter)
            ?.forEach((y) => {
                hiddenObj.hiddenWallets[y.identity] = y?.content?.[PLUGIN_ID]?.hiddenAddresses!
                hiddenObj.hiddenCollections[y.identity] = y?.content?.[PLUGIN_ID]?.unListedCollections!
            })
        return hiddenObj
    }
    return
}
