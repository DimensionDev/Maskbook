import { hexlify } from '@ethersproject/bytes'
import * as Maskbook from './providers/Maskbook'
import * as MetaMask from './providers/MetaMask'
import * as WalletConnect from './providers/WalletConnect'
import { ChainId, ProviderType } from '../../../web3/types'
import { getWallet } from '../../../plugins/Wallet/services'
import { currentSelectedWalletProviderSettings } from '../../../plugins/Wallet/settings'
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
export async function sign(data: string, address: string, chainId: ChainId): Promise<string> {
    const wallet = await getWallet(address)
    if (!wallet) throw new Error('cannot find given wallet')
    switch (currentSelectedWalletProviderSettings.value) {
        case ProviderType.Maskbook:
            if (!wallet._private_key_ || wallet._private_key_ === '0x') throw new Error('cannot sign with given wallet')
            // Learn more about why .send is used?
            // https://github.com/ethers-io/ethers.js/issues/98#issuecomment-358186901
            return Maskbook.createProvider().send('personal_sign', [hexlify(data), address, ''])
        case ProviderType.MetaMask:
            return (await MetaMask.createProvider()).send('personal_sign', [hexlify(data), address, ''])
        case ProviderType.WalletConnect:
            return (await WalletConnect.createConnectorIfNeeded()).signPersonalMessage([data, address, ''])
        default:
            unreachable(currentSelectedWalletProviderSettings.value)
    }
}
