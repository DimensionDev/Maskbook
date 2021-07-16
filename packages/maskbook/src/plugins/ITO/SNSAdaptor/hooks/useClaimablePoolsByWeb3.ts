import { useAsyncRetry } from 'react-use'
import { flatten } from 'lodash-es'
import { sha3 } from 'web3-utils'
import type { PastLogsOptions, Log } from 'web3-core'
import {
    useWeb3,
    useAccount,
    useITOConstants,
    useChainId,
    useBlockNumber,
    FungibleTokenDetailed,
    EthereumTokenType,
    useGetPastLogsParams,
    ChainId,
} from '@masknet/web3-shared'
import type { ClaimablePool } from '../../types'
import { useMemo } from 'react'
import Services from '../../../../extension/service'

const SWAP_SUCCESS_TOPIC = sha3('SwapSuccess(bytes32,address,address,address,uint256,uint256,uint128,bool)')
const SWAP_SUCCESS_TYPES = [
    { type: 'address', name: 'from_address' },
    { type: 'address', name: 'to_address' },
    { type: 'uint256', name: 'from_value' },
    { type: 'uint256', name: 'to_value' },
    { type: 'uint128', name: 'input_total' },
    { type: 'bool', name: 'claimed' },
]

export function useClaimablePoolsByWeb3() {
    const web3 = useWeb3()
    const account = useAccount()
    const chainId = useChainId()
    const currentBlock = useBlockNumber()
    const fixedCurrentBlock = useMemo(() => currentBlock, [])
    const { ITO2_CONTRACT_CREATION_BLOCK_HEIGHT: fromBlock, ITO2_CONTRACT_ADDRESS: address } = useITOConstants()

    // https://github.com/binance-chain/bsc/issues/113
    // getPastLogs block range limitations on BSC is only 5000, which is absurd. Sometimes 4500 also fails.
    const maxBlockRange = chainId === ChainId.BSC ? 4500 : 10000
    const queryParams = useGetPastLogsParams(fromBlock, fixedCurrentBlock, maxBlockRange, {
        address,
        topics: [SWAP_SUCCESS_TOPIC],
    })

    return useAsyncRetry(async () => {
        const logs = flatten<Log>(
            await Promise.all(
                queryParams.map(
                    async (queryParam: PastLogsOptions) => await Services.Ethereum.getPastLogs(queryParam, chainId),
                ),
            ),
        )
        const results = logs.reduce<ClaimablePool[]>((acc, log) => {
            const data = web3.eth.abi.decodeParameters(SWAP_SUCCESS_TYPES, log.data) as {
                claimed: boolean
                to_address: string
            }
            const pid = log.topics[1]
            if (!data.claimed && acc.every((p) => p.pid !== pid)) {
                acc.push({
                    pid,
                    token: { address: data.to_address, type: EthereumTokenType.ERC20 } as FungibleTokenDetailed,
                })
            }
            return acc
        }, [])
        return results
    }, [account, address, chainId, JSON.stringify(queryParams)])
}
