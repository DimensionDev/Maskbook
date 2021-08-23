import { ProviderType } from '@masknet/web3-shared'
import { pollingTask } from '@masknet/shared'
import { getBalance, getBlockNumber, resetAllNonce } from '../../../extension/background-script/EthereumService'
import { startEffects } from '../../../utils'
import { UPDATE_CHAIN_STATE_DELAY } from '../constants'
import { getWallet } from './wallet'
import {
    currentAccountSettings,
    currentBalanceSettings,
    currentBlockNumberSettings,
    currentChainIdSettings,
    currentProviderSettings,
} from '../settings'

const beats: true[] = []

export async function kickToUpdateChainState() {
    beats.push(true)
}

export async function updateChainState() {
    // reset the polling task cause it will be called from service call
    resetPoolTask()

    // forget those passed beats
    beats.length = 0

    // update chain state
    try {
        ;[currentBlockNumberSettings.value, currentBalanceSettings.value] = await Promise.all([
            getBlockNumber(),
            currentAccountSettings.value ? getBalance(currentAccountSettings.value) : currentBalanceSettings.value,
        ])
    } catch {
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
    currentChainIdSettings.addListener(() => {
        updateChainState()
        if (currentProviderSettings.value === ProviderType.Maskbook) resetAllNonce()
    }),
)

// revalidate chain state if the current wallet was changed
effect(() => currentAccountSettings.addListener(() => updateChainState()))
