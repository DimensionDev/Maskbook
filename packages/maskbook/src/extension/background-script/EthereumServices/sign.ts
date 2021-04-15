import { ProviderType } from '../../../web3/types'
import { currentSelectedWalletProviderSettings } from '../../../plugins/Wallet/settings'
import { createWeb3 } from './provider'
import { unreachable } from '../../../utils/utils'

/**
 * Sign a string
 * Learn more about why personal.sign is used?
 * https://ethereum.stackexchange.com/a/69879/61183
 *
 * @param data
 * @param address
 * @param chainId
 */
export async function sign(data: string, address: string) {
    const web3 = await createWeb3()
    const providerType = currentSelectedWalletProviderSettings.value
    switch (providerType) {
        case ProviderType.Maskbook:
            return web3.eth.sign(data, address)
        case ProviderType.MetaMask:
        case ProviderType.WalletConnect:
            return web3.eth.personal.sign(data, address, '')
        default:
            unreachable(providerType)
    }
}
