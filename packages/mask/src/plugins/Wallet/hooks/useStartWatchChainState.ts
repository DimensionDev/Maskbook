import { useEffect } from 'react'
import { pollingTask } from '@masknet/shared-base'
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
    useEffect(() => {
        // emit an updating request immediately
        WalletRPC.updateChainState()
    }, [])
    return useEffect(() => {
        // start the polling task
        task.reset()
        return () => task.cancel()
    }, [])
}
