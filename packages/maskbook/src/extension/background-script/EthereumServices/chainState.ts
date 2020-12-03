import stringify from 'json-stable-stringify'
import { debounce, first, uniq } from 'lodash-es'
import { WalletMessages } from '../../../plugins/Wallet/messages'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { getWallets } from '../../../plugins/Wallet/services'
import {
    currentSelectedWalletAddressSettings,
    currentSelectedWalletProviderSettings,
} from '../../../plugins/Wallet/settings'
import {
    currentChainStateSettings,
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentWalletConnectChainIdSettings,
} from '../../../settings/settings'
import { pollingTask, unreachable } from '../../../utils/utils'
import { isSameAddress } from '../../../web3/helpers'
import { ProviderType } from '../../../web3/types'
import { getBlockNumber } from './network'

//#region tracking chain state
const revalidateChainState = debounce(
    async () => {
        const wallets = await getWallets()
        const chainIds = uniq(await Promise.all(wallets.map((x) => getChainId(x.address))))
        currentChainStateSettings.value = stringify(
            await Promise.all(
                chainIds.map(async (chainId) => ({
                    chainId,
                    blockNumber: await getBlockNumber(chainId),
                })),
            ),
        )
        return false // never stop
    },
    300,
    {
        trailing: true,
    },
)

// polling the newest block state from the chain
pollingTask(revalidateChainState as any, {
    delay: 30 /* seconds */ * 1000 /* milliseconds */,
})

// revalidate ChainState if the chainId of current provider was changed
currentMaskbookChainIdSettings.addListener(revalidateChainState)
currentMetaMaskChainIdSettings.addListener(revalidateChainState)
currentWalletConnectChainIdSettings.addListener(revalidateChainState)

// revaldiate if the current wallet was changed
WalletMessages.events.walletsUpdated.on(revalidateChainState)
//#endregion

//#region tracking wallets
let wallets: WalletRecord[] = []
const revalidateWallets = async () => {
    wallets = await getWallets()
}
WalletMessages.events.walletsUpdated.on(revalidateWallets)
revalidateWallets()
//#endregion

/**
 * Get the chain id which is using by the given (or default) wallet
 * @param address
 */
export async function getChainId(address: string) {
    const address_ = currentSelectedWalletAddressSettings.value
    const provider = currentSelectedWalletProviderSettings.value
    const wallet =
        (address ? wallets.find((x) => isSameAddress(x.address, address)) : undefined) ??
        (address_ ? wallets.find((x) => isSameAddress(x.address, address_)) : undefined) ??
        first(wallets)
    if (!wallet) return currentMaskbookChainIdSettings.value
    if (provider === ProviderType.Maskbook) return currentMaskbookChainIdSettings.value
    if (provider === ProviderType.MetaMask) return currentMetaMaskChainIdSettings.value
    if (provider === ProviderType.WalletConnect) return currentWalletConnectChainIdSettings.value
    unreachable(provider)
}
