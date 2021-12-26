import { throttle } from 'lodash-es'
import { ProviderType } from '@masknet/web3-shared-evm'
import { pollingTask } from '@masknet/shared'
import { getBalance, getBlockNumber, resetAllNonce } from '../../../extension/background-script/EthereumService'
import { startEffects } from '../../../utils'
import { UPDATE_CHAIN_STATE_DELAY } from '../constants'
import {
    currentMaskWalletAccountSettings,
    currentAccountSettings,
    currentBalanceSettings,
    currentBlockNumberSettings,
    currentChainIdSettings,
    currentMaskWalletBalanceSettings,
    currentMaskWalletChainIdSettings,
    currentProviderSettings,
} from '../settings'

let beats = 0

export async function kickToUpdateChainState() {
    beats += 1
}

export async function updateChainState() {
    // reset the polling task cause it will be called from service call
    resetPoolTask()

    // forget those passed beats
    beats = 0

    // update chain state
    try {
        ;[currentBlockNumberSettings.value, currentBalanceSettings.value, currentMaskWalletBalanceSettings.value] =
            await Promise.all([
                getBlockNumber(),
                currentAccountSettings.value
                    ? getBalance(currentAccountSettings.value, {
                          chainId: currentChainIdSettings.value,
                          providerType: currentProviderSettings.value,
                      })
                    : currentBalanceSettings.value,
                currentMaskWalletAccountSettings.value
                    ? getBalance(currentMaskWalletAccountSettings.value, {
                          chainId: currentMaskWalletChainIdSettings.value,
                          providerType: ProviderType.MaskWallet,
                      })
                    : currentMaskWalletBalanceSettings.value,
            ])
    } catch {
        // do nothing
    } finally {
        // reset the polling if chain state updated successfully
        resetPoolTask()
    }
}

export const updateChainStateThrottled = throttle(updateChainState, 300, {
    leading: false,
    trailing: true,
})

let resetPoolTask: () => void = () => {}

const effect = startEffects(import.meta.webpackHot)

// poll the newest chain state
effect(() => {
    const { reset, cancel } = pollingTask(
        async () => {
            if (beats <= 0) return false
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
        updateChainStateThrottled()
        if (currentProviderSettings.value === ProviderType.MaskWallet) resetAllNonce()
    }),
)
effect(() =>
    currentMaskWalletChainIdSettings.addListener(() => {
        updateChainStateThrottled()
        resetAllNonce()
    }),
)

// revalidate chain state if the current wallet was changed
effect(() => currentAccountSettings.addListener(() => updateChainStateThrottled()))
effect(() => currentMaskWalletAccountSettings.addListener(() => updateChainStateThrottled()))
