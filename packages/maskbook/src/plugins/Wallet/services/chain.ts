import { ChainId, getNetworkTypeFromChainId, ProviderType } from '@masknet/web3-shared'
import { getBalance, getBlockNumber, resetAllNonce } from '../../../extension/background-script/EthereumService'
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
import { getWallet } from './wallet'

const beats: true[] = []

export async function kickToUpdateChainState() {
    beats.push(true)
}

export async function updateChainState(chainId?: ChainId) {
    // reset the polling task cause it will be called from service call
    resetPoolTask()

    // forget those passed beats
    beats.length = 0

    // update network type
    if (chainId) currentNetworkSettings.value = getNetworkTypeFromChainId(chainId)

    // update chain state
    try {
        const wallet = await getWallet()
        ;[currentBlockNumberSettings.value, currentBalanceSettings.value] = await Promise.all([
            getBlockNumber(),
            wallet ? getBalance(wallet.address) : currentBalanceSettings.value,
        ])
    } catch (error) {
        // do nothing
    } finally {
        // reset the polling if chain state updated successfully
        resetPoolTask()
    }
}

let resetPoolTask: () => void = () => {}

const effect = startEffects(import.meta.webpackHot)

// poll the newest chain state
effect(() => {
    const { reset, cancel } = pollingTask(
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
    return cancel
})

// revalidate chain state if the chainId of current provider was changed
effect(() =>
    currentChainIdSettings.addListener((chainId) => {
        updateChainState(chainId)
        if (currentProviderSettings.value === ProviderType.Maskbook) resetAllNonce()
    }),
)

// revalidate chain state if the current wallet was changed
effect(() => currentAccountSettings.addListener(() => updateChainState()))
