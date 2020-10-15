import stringify from 'json-stable-stringify'
import { debounce } from 'lodash-es'
import { PluginMessageCenter } from '../../../plugins/PluginMessages'
import {
    currentChainStateSettings,
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentWalletConnectChainIdSettings,
} from '../../../settings/settings'
import { pollingTask } from '../../../utils/utils'
import { getChainId } from './chainId'
import { getBlockNumber } from './network'

//#region tracking chain state
const revalidate = debounce(
    async () => {
        currentChainStateSettings.value = stringify({
            chainId: await getChainId(),
            blockNumber: await getBlockNumber(),
        })
        return false // never stop
    },
    300,
    {
        trailing: true,
    },
)

// polling the newest block state from the chain
pollingTask(revalidate, {
    delay: 30 /* seconds */ * 1000 /* milliseconds */,
})

// revalidate if the chainId of current provider was changed
currentMaskbookChainIdSettings.addListener(revalidate)
currentMetaMaskChainIdSettings.addListener(revalidate)
currentWalletConnectChainIdSettings.addListener(revalidate)

// revaldiate if the current wallet was changed
PluginMessageCenter.on('maskbook.wallets.update', revalidate)
//#endregion
