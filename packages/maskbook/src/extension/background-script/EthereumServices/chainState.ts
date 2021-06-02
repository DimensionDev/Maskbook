import { debounce, first } from 'lodash-es'
import { unreachable } from '@dimensiondev/maskbook-shared'
import { isSameAddress, ChainId, ProviderType } from '@dimensiondev/web3-shared'
import { WalletMessages } from '../../../plugins/Wallet/messages'
import {
    currentBlockNumberSettings,
    currentBalanceSettings,
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentWalletConnectChainIdSettings,
    currentSelectedWalletAddressSettings,
    currentSelectedWalletProviderSettings,
    currentCustomNetworkChainIdSettings,
} from '../../../plugins/Wallet/settings'
import { pollingTask } from '../../../utils/utils'
import { getBalance, getBlockNumber } from './network'
import { startEffects } from '../../../utils/side-effects'
import { Flags } from '../../../utils/flags'
import { getWalletCached, getWalletsCached } from './wallet'
import { resetAllNonce } from './nonce'

const effect = startEffects(import.meta.webpackHot)

//#region tracking chain state
export const updateBlockNumber = debounce(
    async () => {
        const wallet = getWalletCached()
        currentBlockNumberSettings.value = await getBlockNumber()
        if (wallet) currentBalanceSettings.value = await getBalance(wallet.address)

        // reset the polling if chain state updated successfully
        if (typeof resetPoolTask === 'function') resetPoolTask()
    },
    3 /* seconds */ * 1000 /* milliseconds */,
    {
        trailing: true,
    },
)

// polling the newest block state from the chain
let resetPoolTask: () => void
effect(() => {
    const { reset } = pollingTask(
        async () => {
            await updateBlockNumber()
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
effect(() =>
    currentMaskbookChainIdSettings.addListener(() => {
        updateBlockNumber()
        resetAllNonce()
        WalletMessages.events.chainIdUpdated.sendToAll(undefined)
    }),
)
effect(() =>
    currentMetaMaskChainIdSettings.addListener(() => {
        updateBlockNumber()
        WalletMessages.events.chainIdUpdated.sendToAll(undefined)
    }),
)
effect(() =>
    currentWalletConnectChainIdSettings.addListener(() => {
        updateBlockNumber()
        WalletMessages.events.chainIdUpdated.sendToAll(undefined)
    }),
)

effect(() =>
    currentCustomNetworkChainIdSettings.addListener(() => {
        updateBlockNumber()
        WalletMessages.events.chainIdUpdated.sendToAll(undefined)
    }),
)

// revaldiate if the current wallet was changed
effect(() => WalletMessages.events.walletsUpdated.on(updateBlockNumber))
//#endregion

/**
 * Get the chain id which is using by the given (or default) wallet
 * @param address
 */
export function getUnsafeChainId(address?: string) {
    const wallets = getWalletsCached()
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
    if (provider === ProviderType.CustomNetwork) return currentMaskbookChainIdSettings.value
    unreachable(provider)
}

/**
 * Get the chain id which is using by the given (or default) wallet
 * It will always yield Mainnet in production mode
 * @param address
 */
export async function getChainId(address?: string) {
    const unsafeChainId = await getUnsafeChainId(address)
    return unsafeChainId !== ChainId.Mainnet && !Flags.wallet_allow_test_chain ? ChainId.Mainnet : unsafeChainId
}
