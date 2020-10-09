import { useEffect, useState } from 'react'
import Services from '../../extension/service'
import { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { ChainId } from '../types'
import { pollingTask } from '../../utils/utils'
import { debounce } from 'lodash-es'
import {
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentWalletConnectChainIdSettings,
} from '../../settings/settings'
import { PluginMessageCenter } from '../../plugins/PluginMessages'

//#region tracking block state
const blockStateRef = new ValueRef({
    chainId: ChainId.Mainnet,
    blockNumber: 0,
})
const revalidate = debounce(
    async () => {
        blockStateRef.value = {
            chainId: await Services.Ethereum.getChainId(),
            blockNumber: await Services.Ethereum.getBlockNumber(),
        }
        return false // never stop
    },
    300,
    {
        trailing: true,
    },
)

// polling the newest block state from the chain
pollingTask(revalidate, {
    delay: 10 /* seconds */ * 1000 /* milliseconds */,
})

// revalidate if the chainId of current provider was changed
currentMaskbookChainIdSettings.addListener(revalidate)
currentMetaMaskChainIdSettings.addListener(revalidate)
currentWalletConnectChainIdSettings.addListener(revalidate)

// revaldiate if the current wallet was changed
PluginMessageCenter.on('maskbook.wallets.update', revalidate)
//#endregion

/**
 * Get the chain id which is using by the current wallet
 */
export function useChainId() {
    return useValueRef(blockStateRef).chainId
}

/**
 * Get the current block number
 */
export function useBlockNumber() {
    return useValueRef(blockStateRef).blockNumber
}

/**
 * Get the current block number for once
 */
export function useBlockNumberOnce() {
    const blockState_ = useValueRef(blockStateRef)
    const [blockState, setBlockState] = useState({
        chainId: ChainId.Mainnet,
        blockNumber: 0,
    })
    useEffect(() => {
        if (blockState.blockNumber === 0 || blockState.chainId !== blockState_.chainId) setBlockState(blockState_)
    }, [blockState_])
    return blockState.blockNumber
}

/**
 * Get the newest block state
 */
export function useBlockState() {
    return useValueRef(blockStateRef)
}
