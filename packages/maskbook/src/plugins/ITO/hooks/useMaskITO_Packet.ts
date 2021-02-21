import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import type { MaskITO } from '../../../contracts/MaskITO'
import { useSingleContractMultipleData } from '../../../web3/hooks/useMulticall'
import { useITO_Contract } from '../contracts/useITO_Contract'

export function useMaskITO_Packet() {
    const ITO_CONTRACT = useITO_Contract(true) as MaskITO | null

    // compose calls
    const { names, callDatas } = useMemo(
        () => ({
            names: ['getUnlockTime', 'check_claimable'] as 'getUnlockTime'[],
            callDatas: [[], []] as [][],
        }),
        [],
    )

    // validte
    const [results, calls, _, callback] = useSingleContractMultipleData(ITO_CONTRACT, names, callDatas)
    const asyncResult = useAsyncRetry(() => callback(calls), [calls, callback])

    // compose
    const packet = useMemo(() => {
        if (!ITO_CONTRACT) return
        const [unlockTime, claimable = '0'] = results.map((x) => (x.error ? undefined : x.value))
        if (!unlockTime) return
        return {
            unlockTime,
            claimable,
        }
    }, [ITO_CONTRACT, results])

    return {
        ...asyncResult,
        value: packet,
    }
}
