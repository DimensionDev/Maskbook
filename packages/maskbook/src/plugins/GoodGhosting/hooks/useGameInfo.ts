import { useAccount, useSingleContractMultipleData } from '@masknet/web3-shared'
import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { useGoodGhostingContract } from '../contracts/useGoodGhostingContract'
import type { GoodGhostingInfo, Player } from '../types'
import { ZERO_ADDRESS } from '../constants'

export function useGameInfo() {
    const contract = useGoodGhostingContract()
    const account = useAccount()
    const { names, callDatas } = useMemo(() => {
        const names = [
            'segmentPayment',
            'firstSegmentStart',
            'getCurrentSegment',
            'lastSegment',
            'segmentLength',
            'getNumberOfPlayers',
            'totalGameInterest',
            'totalGamePrincipal',
            'adaiToken',
            'lendingPool',
        ] as any
        return {
            names: [...names, 'players'],
            callDatas: [...Array(names.length).fill([]), [account]],
        }
    }, [account])

    const [results, calls, _, callback] = useSingleContractMultipleData(contract, names, callDatas)
    const asyncResult = useAsyncRetry(() => callback(calls), [calls, callback])

    const gameInfo = useMemo(() => {
        if (!contract || !results.length) return

        let failedToGetInfo = false
        const [
            segmentPayment,
            firstSegmentStart,
            currentSegment,
            lastSegment,
            segmentLength,
            numberOfPlayers,
            totalGameInterest,
            totalGamePrincipal,
            adaiToken,
            lendingPool,
            currentPlayer,
        ] = results.map((x) => {
            if (x.error) failedToGetInfo = true
            return x.error ? '' : (x.value as string)
        })

        if (failedToGetInfo) return

        const player = currentPlayer as any as Player

        return {
            segmentPayment,
            firstSegmentStart: Number.parseInt(firstSegmentStart),
            currentSegment: Number.parseInt(currentSegment),
            lastSegment: Number.parseInt(lastSegment),
            segmentLength: Number.parseInt(segmentLength),
            numberOfPlayers: Number.parseInt(numberOfPlayers),
            totalGameInterest,
            totalGamePrincipal,
            adaiTokenAddress: adaiToken,
            lendingPoolAddress: lendingPool,
            currentPlayer: player && player.addr !== ZERO_ADDRESS ? player : undefined,
        } as GoodGhostingInfo
    }, [results, contract])

    return {
        ...asyncResult,
        value: gameInfo,
    } as AsyncStateRetry<typeof gameInfo>
}
