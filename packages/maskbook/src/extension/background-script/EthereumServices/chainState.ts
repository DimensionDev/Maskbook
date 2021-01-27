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
import { ChainId, ProviderType } from '../../../web3/types'
import { getBlockNumber } from './network'
import { startEffects } from '../../../utils/side-effects'
import { Flags } from '../../../utils/flags'

const effect = startEffects(module.hot)

//#region tracking chain state
export const updateChainState = debounce(
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
        // reset the polling if chain state updated successfully
        if (typeof resetPoolTask === 'function') resetPoolTask()
    },
    300,
    {
        trailing: true,
    },
)

// polling the newest block state from the chain
let resetPoolTask: () => void
effect(() => {
    const { reset } = pollingTask(
        async () => {
            await updateChainState()
            return false // never stop the polling
        },
        {
            delay: 30 /* seconds */ * 1000 /* milliseconds */,
        },
    )
    resetPoolTask = reset
    return reset
})

// revalidate ChainState if the chainId of current provider was changed
effect(() => currentMaskbookChainIdSettings.addListener(updateChainState))
effect(() => currentMetaMaskChainIdSettings.addListener(updateChainState))
effect(() => currentWalletConnectChainIdSettings.addListener(updateChainState))

// revaldiate if the current wallet was changed
effect(() => WalletMessages.events.walletsUpdated.on(updateChainState))
//#endregion

//#region tracking wallets
let wallets: WalletRecord[] = []
const revalidateWallets = async () => {
    wallets = await getWallets()
}
effect(() => WalletMessages.events.walletsUpdated.on(revalidateWallets))
revalidateWallets()
//#endregion

/**
 * Get the chain id which is using by the given (or default) wallet
 * It will always yield Mainnet in production mode
 * @param address
 */
export async function getUnsafeChainId(address?: string) {
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

/**
 * Get the chain id which is using by the given (or default) wallet
 * @param address
 */
export async function getChainId(address?: string) {
    const unsafeChainId = await getUnsafeChainId(address)
    return unsafeChainId !== ChainId.Mainnet && Flags.wallet_network_strict_mode_enabled
        ? ChainId.Mainnet
        : unsafeChainId
}
