import { debounce } from 'lodash-es'
import { ChainId, ProviderType, getNetworkTypeFromChainId } from '@dimensiondev/web3-shared'
import { WalletMessages } from '../../../plugins/Wallet/messages'
import {
    currentBlockNumberSettings,
    currentBalanceSettings,
    currentChainIdSettings,
    currentProviderSettings,
    currentNetworkSettings,
    currentAccountSettings,
} from '../../../plugins/Wallet/settings'
import { pollingTask } from '../../../utils/utils'
import { getBalance, getBlockNumber } from './network'
import { startEffects } from '../../../utils/side-effects'
import { getWalletCached } from './wallet'
import { resetAllNonce } from './nonce'

const effect = startEffects(import.meta.webpackHot)

//#region tracking chain state
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
        updateChainState(chainId)
        if (currentProviderSettings.value === ProviderType.Maskbook) resetAllNonce()
    }),
)

// revaldiate if the current wallet was changed
effect(() =>
    currentAccountSettings.addListener(() => {
        updateChainState()
    }),
)
//#endregion

// revaldiate if the current wallet was updated
effect(() => WalletMessages.events.walletsUpdated.on(() => updateChainState()))
//#endregion
