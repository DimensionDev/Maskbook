import { useAccount } from '@masknet/web3-shared'
import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { useGoodGhostingContract } from '../contracts/useGoodGhostingContract'
import type { Player } from '../types'
import { ZERO_ADDRESS } from '../constants'

export function useCurrentPlayer() {
    const contract = useGoodGhostingContract()
    const account = useAccount()

    const asyncResult = useAsyncRetry(async () => {
        const player = await contract?.methods.players(account).call()
        if (!player || player.addr === ZERO_ADDRESS) return
        return player
    })

    return asyncResult as AsyncStateRetry<Player>
}
