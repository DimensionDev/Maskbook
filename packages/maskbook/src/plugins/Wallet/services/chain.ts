import { ChainId, getNetworkTypeFromChainId, ProviderType } from '@dimensiondev/web3-shared'
import { getBalance, getBlockNumber, resetAllNonce } from '../../../extension/background-script/EthereumService'
import { getWalletCached } from '../../../extension/background-script/EthereumServices/wallet'
import { pollingTask, startEffects } from '../../../utils'
import {
    currentAccountSettings,
    currentBalanceSettings,
    currentBlockNumberSettings,
    currentChainIdSettings,
    currentNetworkSettings,
    currentProviderSettings,
} from '../settings'
import { UPDATE_CHAIN_STATE_DELAY } from '../constants'

const beats: true[] = []

export async function kickToUpdateChainState() {
    beats.push(true)
}

export async function updateChainState(chainId?: ChainId) {
    // forget those passed beats
    beats.length = 0

    // update network type
    if (chainId) currentNetworkSettings.value = getNetworkTypeFromChainId(chainId)

    // update chat state
    const wallet = getWalletCached()
    if (chainId) currentBlockNumberSettings.value = await getBlockNumber()
    if (wallet) currentBalanceSettings.value = await getBalance(wallet.address)

    // reset the polling if chain state updated successfully
    resetPoolTask()
}

const effect = startEffects(import.meta.webpackHot)

// polling the newest chain state
let resetPoolTask: () => void = () => {}
effect(() => {
    const { reset } = pollingTask(
        async () => {
            if (beats.length <= 0) return false
            await updateChainState()
            return false
        },
        {
            delay: UPDATE_CHAIN_STATE_DELAY,
        },
    )
    resetPoolTask = reset
    return reset
})

// revalidate chain state if the chainId of current provider was changed
effect(() =>
    currentChainIdSettings.addListener((chainId) => {
        updateChainState(chainId)
        if (currentProviderSettings.value === ProviderType.Maskbook) resetAllNonce()
    }),
)

// revalidate chain state if the current wallet was changed
effect(() =>
    currentAccountSettings.addListener(() => {
        updateChainState()
    }),
)
