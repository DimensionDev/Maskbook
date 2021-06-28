import { useEffect } from 'react'
import { useAsync } from 'react-use'
import { pollingTask } from '../../../utils'
import { UPDATE_CHAIN_STATE_DELAY } from '../constants'
import { WalletRPC } from '../messages'

const task = pollingTask(
    async () => {
        await WalletRPC.kickToUpdateChainState()
        return false
    },
    {
        autoStart: false,
        delay: UPDATE_CHAIN_STATE_DELAY,
    },
)

export function useStartWatchChainState() {
    useAsync(async () => {
        // emit an updating request immediately
        await WalletRPC.updateChainState()
    }, [])
    return useEffect(() => {
        // start the polling task
        task.reset()
        return () => task.cancel()
    }, [task])
}
