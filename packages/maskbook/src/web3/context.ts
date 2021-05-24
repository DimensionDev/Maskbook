import { ChainId, Wallet, Web3Context as Context } from '@dimensiondev/web3-shared'
import Services from '../extension/service'
import { WalletMessages, WalletRPC } from '../plugins/Wallet/messages'
import { currentSelectedWalletAddressSettings, currentSelectedWalletProviderSettings } from '../plugins/Wallet/settings'
import { noop, pick } from 'lodash-es'
import { Flags } from '../utils/flags'

let currentChain: ChainId = ChainId.Mainnet
let wallets: Wallet[] = []
export const Web3Context: Context = {
    allowTestChain: {
        getCurrentValue: () => !Flags.wallet_allow_test_chain,
        subscribe: () => noop,
    },
    currentChain: {
        getCurrentValue: () => currentChain,
        subscribe: (f) =>
            WalletMessages.events.chainIdUpdated.on(async () => {
                currentChain = await Services.Ethereum.getChainId()
                f()
            }),
    },
    walletProvider: {
        getCurrentValue: () => currentSelectedWalletProviderSettings.value,
        subscribe: (f) => currentSelectedWalletProviderSettings.addListener(f),
    },
    wallets: {
        getCurrentValue: () => wallets,
        subscribe: (f) =>
            WalletMessages.events.walletsUpdated.on(async () => {
                const raw = await WalletRPC.getWallets()
                wallets = raw.map<Wallet>((record) => ({
                    ...pick(record, [
                        'address',
                        'name',
                        'erc1155_token_whitelist',
                        'erc1155_token_blacklist',
                        'erc20_token_whitelist',
                        'erc20_token_blacklist',
                        'erc721_token_whitelist',
                        'erc721_token_blacklist',
                    ] as (keyof typeof record)[]),
                    hasPrivateKey: Boolean(record._private_key_ || record.mnemonic),
                }))
                f()
            }),
    },
    selectedWalletAddress: {
        getCurrentValue: () => currentSelectedWalletAddressSettings.value,
        subscribe: (f) => currentSelectedWalletAddressSettings.addListener(f),
    },
}
