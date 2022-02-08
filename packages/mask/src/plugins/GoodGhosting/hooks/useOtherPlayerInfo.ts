import { useSingleContractMultipleData } from '@masknet/web3-shared-evm'
import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { useGoodGhostingContract } from '../contracts/useGoodGhostingContract'
import type { GoodGhostingInfo, Player } from '../types'

export function useOtherPlayerInfo(info: GoodGhostingInfo) {
    const contract = useGoodGhostingContract(info.contractAddress)

    const { addressNames, addressCallDatas } = useMemo(
        () => ({
            addressNames: Array(info.numberOfPlayers).fill('iterablePlayers'),
            addressCallDatas: Array(info.numberOfPlayers)
                .fill('')
                .map((_, i) => [i]),
        }),
        [info.numberOfPlayers],
    )

    const [addressResults, addressCalls, _, addressCallback] = useSingleContractMultipleData(
        contract,
        addressNames,
        addressCallDatas,
    )

    const {
        loading: addressLoading,
        error: addressError,
        retry: addressRetry,
    } = useAsyncRetry(() => addressCallback(addressCalls), [addressCalls])

    const { playerNames, playerCallDatas } = useMemo(
        () => ({
            playerNames: Array(addressResults.length).fill('players'),
            playerCallDatas: Array(addressResults.length)
                .fill('')
                .map((_, i) => [addressResults[i].value]),
        }),
        [addressResults],
    )

    const [playerResults, playerCalls, __, playerCallback] = useSingleContractMultipleData(
        contract,
        playerNames,
        playerCallDatas,
    )

    const {
        loading: playerLoading,
        error: playerError,
        retry: playerRetry,
    } = useAsyncRetry(() => playerCallback(playerCalls), [playerCalls])

    const players: Player[] = useMemo(() => playerResults.map((res) => res.value), [playerResults])

    return {
        error: addressError || playerError,
        loading: addressLoading || playerLoading,
        retry: addressError ? addressRetry : playerRetry,
        value: players,
    } as AsyncStateRetry<typeof players>
}
