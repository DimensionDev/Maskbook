import { debounce } from 'lodash-es'
import { ChainId, getNetworkTypeFromChainId, ProviderType } from '@dimensiondev/web3-shared'
import { getBalance, getBlockNumber, resetAllNonce } from '../../../extension/background-script/EthereumService'
import { getWalletCached } from '../../../extension/background-script/EthereumServices/wallet'
import { startEffects } from '../../../utils'
import {
    currentAccountSettings,
    currentBalanceSettings,
    currentBlockNumberSettings,
    currentChainIdSettings,
    currentNetworkSettings,
    currentProviderSettings,
} from '../settings'

async function updateChainState(chainId?: ChainId) {
    console.log('DEBUG: update chain state')
    // update network type
    if (chainId) currentNetworkSettings.value = getNetworkTypeFromChainId(chainId)

    // update chat state
    const wallet = getWalletCached()
    if (chainId) currentBlockNumberSettings.value = await getBlockNumber()
    if (wallet) currentBalanceSettings.value = await getBalance(wallet.address)
}

export const updateChainStateDebounced = debounce(updateChainState, 30 /* seconds */ * 1000 /* milliseconds */, {
    leading: true,
    trailing: true,
})

const effect = startEffects(import.meta.webpackHot)

// revalidate chain state if the chainId of current provider was changed
effect(() =>
    currentChainIdSettings.addListener((chainId) => {
        updateChainStateDebounced.cancel()
        updateChainStateDebounced(chainId)
        if (currentProviderSettings.value === ProviderType.Maskbook) resetAllNonce()
    }),
)

// revalidate chain state if the current wallet was changed
effect(() =>
    currentAccountSettings.addListener(() => {
        updateChainStateDebounced.cancel()
        updateChainStateDebounced()
    }),
)
