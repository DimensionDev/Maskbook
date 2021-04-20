import type { TransactionConfig } from 'web3-core'
import { getWallet } from '../../../plugins/Wallet/services'
import { currentSelectedWalletProviderSettings } from '../../../plugins/Wallet/settings'
import { unreachable } from '../../../utils/utils'
import { ProviderType } from '../../../web3/types'
import { createWeb3 } from './provider'

export async function signTransaction(config: TransactionConfig) {
    if (!config.from)
        throw new Error(
            'You cannot sign the transaction without knowing its account, and please provide it by using from.',
        )
    const web3 = await createWeb3()
    return new Promise<string>(async (resolve, reject) => {
        const providerType = currentSelectedWalletProviderSettings.value
        switch (providerType) {
            case ProviderType.Maskbook:
                const wallet = await getWallet()
                if (!wallet?._private_key_) throw new Error('unable to sign transaction.')
                web3.eth.accounts.signTransaction(config, wallet._private_key_, (err, signed) => {
                    if (err) reject(err)
                    else resolve(signed.rawTransaction ?? '')
                })
                break
            case ProviderType.MetaMask:
            case ProviderType.WalletConnect:
                web3.eth.signTransaction(config, (err, signed) => {
                    if (err) reject(err)
                    else resolve(signed.raw)
                })
                break
            default:
                unreachable(providerType)
        }
    })
}
