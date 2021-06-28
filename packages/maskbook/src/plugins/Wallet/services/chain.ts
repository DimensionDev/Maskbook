import { ChainId, getNetworkTypeFromChainId, ProviderType } from '@dimensiondev/web3-shared'
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
import { WalletMessages } from '../messages'
import { getWallet } from './wallet'

const beats: true[] = []

export async function kickToUpdateChainState() {
    beats.push(true)
}

export async function updateChainState(chainId?: ChainId) {
    // forget those passed beats
    beats.length = 0

    // update network type
    if (chainId) currentNetworkSettings.value = getNetworkTypeFromChainId(chainId)

    // update chain state
    const wallet = await getWallet()
    if (chainId) currentBlockNumberSettings.value = await getBlockNumber()
    if (wallet) currentBalanceSettings.value = await getBalance(wallet.address)

    // reset the polling if chain state updated successfully
    resetPoolTask()
}

const effect = startEffects(import.meta.webpackHot)

// poll the newest chain state
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
    currentAccountSettings.addListener(() => updateChainState()),
)
