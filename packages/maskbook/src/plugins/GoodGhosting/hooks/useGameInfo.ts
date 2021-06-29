import { useSingleContractMultipleData } from '@masknet/web3-shared'
import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { useGoodGhostingContract } from '../contracts/useGoodGhostingContract'
import type { GoodGhostingInfo } from '../types'

export function useGameInfo() {
    const contract = useGoodGhostingContract()
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
        ] as any
        return {
            names,
            callDatas: Array(names.length).fill([]),
        }
    }, [])

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
        ] = results.map((x) => {
            if (x.error) failedToGetInfo = true
            return x.error ? undefined : (x.value as string)
        })

        if (failedToGetInfo) return

        return {
            segmentPayment,
            firstSegmentStart: firstSegmentStart && Number.parseInt(firstSegmentStart),
            currentSegment: currentSegment && Number.parseInt(currentSegment),
            lastSegment: lastSegment && Number.parseInt(lastSegment),
            segmentLength: segmentLength && Number.parseInt(segmentLength),
            numberOfPlayers: numberOfPlayers && Number.parseInt(numberOfPlayers),
            totalGameInterest,
            totalGamePrincipal,
        } as GoodGhostingInfo
    }, [results, contract])

    return {
        ...asyncResult,
        value: gameInfo,
    } as AsyncStateRetry<typeof gameInfo>
}
