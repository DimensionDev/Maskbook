import * as Maskbook from './providers/Maskbook'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import { ChainId, ProviderType } from '../../../web3/types'
import { getWallet } from '../../../plugins/Wallet/services'
import { currentSelectedWalletProviderSettings } from '../../../plugins/Wallet/settings'

/**
 * Sign a string
 * Learn more about why personal.sign is used?
 * https://ethereum.stackexchange.com/a/69879/61183
 *
 * @param data
 * @param address
 * @param chainId
 */
export async function sign(data: string, address: string, chainId: ChainId) {
    const wallet = await getWallet(address)
    if (!wallet) throw new Error('cannot find given wallet')
    switch (currentSelectedWalletProviderSettings.value) {
        case ProviderType.Maskbook:
            if (!wallet._private_key_ || wallet._private_key_ === '0x') throw new Error('cannot sign with given wallet')
            return Maskbook.createWeb3(chainId, [wallet._private_key_]).eth.sign(data, address)
        case ProviderType.MetaMask:
            return (await MetaMask.createWeb3()).eth.personal.sign(data, address, '')
        case ProviderType.WalletConnect:
            return WalletConnect.createWeb3().eth.personal.sign(data, address, '')
        default:
            throw new Error('cannot sign with given wallet')
    }
}
