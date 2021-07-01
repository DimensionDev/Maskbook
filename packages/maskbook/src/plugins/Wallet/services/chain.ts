import { debounce } from 'lodash-es'
import { ChainId, ProviderType, getNetworkTypeFromChainId } from '@masknet/web3-shared'
import { WalletMessages } from '../messages'
import {
    currentBlockNumberSettings,
    currentBalanceSettings,
    currentChainIdSettings,
    currentProviderSettings,
    currentNetworkSettings,
    currentAccountSettings,
} from '../settings'
import { pollingTask } from '../../../utils/utils'
import { startEffects } from '../../../utils/side-effects'
import { getWalletCached } from '../../../extension/background-script/EthereumServices/wallet'
import { getBalance, getBlockNumber, resetAllNonce } from '../../../extension/background-script/EthereumService'

const effect = startEffects(import.meta.webpackHot)

//#region tracking chain state
const resetChainState = () => {
    currentBalanceSettings.value = '0'
}
const updateChainState = debounce(
    async (chainId?: ChainId) => {
        // update network type
        if (chainId) currentNetworkSettings.value = getNetworkTypeFromChainId(chainId)

        // update chat state
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

// polling the newest chain state
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
effect(() =>
    currentChainIdSettings.addListener((chainId) => {
        resetChainState()
        updateChainState(chainId)
        if (currentProviderSettings.value === ProviderType.Maskbook) resetAllNonce()
    }),
)

// revaldiate if the current wallet was changed
effect(() =>
    currentAccountSettings.addListener(() => {
        resetChainState()
        updateChainState()
    }),
)
//#endregion

// revaldiate if the current wallet was updated
effect(() =>
    WalletMessages.events.walletsUpdated.on(() => {
        resetChainState()
        updateChainState()
    }),
)
//#endregion
