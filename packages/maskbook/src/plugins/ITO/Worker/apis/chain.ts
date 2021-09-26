import { ChainId, getChainConstants, getITOConstants, isSameAddress } from '@masknet/web3-shared'
import { Interface } from '@ethersproject/abi'
import ITO_ABI from '@masknet/web3-contracts/abis/ITO2.json'
import urlcat from 'urlcat'
import BigNumber from 'bignumber.js'
import type { PoolFromNetwork, JSON_PayloadFromChain } from '../../types'
import { MSG_DELIMITER, ITO_CONTRACT_BASE_TIMESTAMP } from '../../constants'
import { getTransactionReceipt } from '../../../../extension/background-script/EthereumService'
import { checkAvailability } from './checkAvailability'

const interFace = new Interface(ITO_ABI)

export async function getAllPoolsAsSeller(
    chainId: ChainId,
    startBlock: number | undefined,
    endBlock: number,
    sellerAddress: string,
) {
    const { EXPLORER_API, EXPLORER_API_KEY } = getChainConstants(chainId)
    const { ITO2_CONTRACT_ADDRESS } = getITOConstants(chainId)

    if (!EXPLORER_API || !ITO2_CONTRACT_ADDRESS || !startBlock) return []

    //#region
    // 1. Filter out `Fill_Pool` transactions,
    // 2. Retrieve payload major data from its decoded input param.
    const response = await fetch(
        urlcat(EXPLORER_API, {
            apikey: EXPLORER_API_KEY,
            action: 'txlist',
            module: 'account',
            sort: 'desc',
            startBlock,
            endBlock,
            address: ITO2_CONTRACT_ADDRESS,
        }),
    )
    if (!response.ok) return []

    type TxType = {
        hash: string
        input: string
        from: string
        to: string
        blockNumber: string
    }

    type FillPoolInputParam = {
        _end: BigNumber
        _exchange_addrs: string[]
        _hash: string
        _limit: BigNumber
        _message: string
        _qualification: string
        _ratios: BigNumber[]
        _start: BigNumber
        _token_addr: string
        _total_tokens: BigNumber
        _unlock_time: BigNumber
    }

    const payloadList: { payload: JSON_PayloadFromChain; hash: string }[] = (await response.json()).result.reduce(
        (acc: { payload: JSON_PayloadFromChain; hash: string }[], cur: TxType) => {
            if (!isSameAddress(cur.from, sellerAddress)) return acc
            try {
                const decodedInputParam = interFace.decodeFunctionData(
                    'fill_pool',
                    cur.input,
                ) as unknown as FillPoolInputParam

                const [sellerName = '', message = '', regions = '-'] = decodedInputParam._message.split(MSG_DELIMITER)

                const payload: JSON_PayloadFromChain = {
                    end_time: (decodedInputParam._end.toNumber() + ITO_CONTRACT_BASE_TIMESTAMP / 1000) * 1000,
                    exchange_token_addresses: decodedInputParam._exchange_addrs,
                    limit: decodedInputParam._limit.toString(),
                    message,
                    qualification_address: decodedInputParam._qualification,
                    exchange_amounts: decodedInputParam._ratios.map((v) => v.toString()),
                    start_time: (decodedInputParam._start.toNumber() + ITO_CONTRACT_BASE_TIMESTAMP / 1000) * 1000,
                    token_address: decodedInputParam._token_addr,
                    total: decodedInputParam._total_tokens.toString(),
                    unlock_time:
                        (decodedInputParam._unlock_time.toNumber() + ITO_CONTRACT_BASE_TIMESTAMP / 1000) * 1000,
                    seller: {
                        address: cur.from,
                        name: sellerName,
                    },
                    contract_address: cur.to,
                    chain_id: chainId,
                    regions,
                    block_number: Number(cur.blockNumber),
                    //#region Retrieve at step 3
                    pid: '',
                    creation_time: 0,
                    //#endregion
                    //#region Retrieve at step 4
                    total_remaining: '',
                    //#endregion
                    //#region Retrieve from database
                    password: '',
                    //#endregion
                }

                return acc.concat({ payload, hash: cur.hash })
            } catch {
                return acc
            }
        },
        [],
    )
    //#endregion

    //#region
    // 3. Decode event log to retrieve `pid` and `creation_time` for payload.
    type FillPoolSuccessEventParams = {
        id: string
        creation_time: BigNumber
    }

    const eventLogResponse = await Promise.allSettled(
        payloadList.map(async (entity) => {
            const result = await getTransactionReceipt(entity.hash)
            if (!result) return null

            const log = result.logs.find((log) => isSameAddress(log.address, ITO2_CONTRACT_ADDRESS))
            if (!log) return null

            const eventParams = interFace.decodeEventLog(
                'FillSuccess',
                log.data,
                log.topics,
            ) as unknown as FillPoolSuccessEventParams

            entity.payload.pid = eventParams.id
            entity.payload.creation_time = eventParams.creation_time.toNumber()

            // 4. retrieve `total_remaining`, `exchange_in_volumes` and `exchange_out_volumes`
            const data = await checkAvailability(
                entity.payload.pid,
                entity.payload.seller.address,
                entity.payload.contract_address,
                chainId,
            )

            entity.payload.total_remaining = new BigNumber(data.remaining).toString()

            return {
                pool: entity.payload,
                exchange_in_volumes: data.exchanged_tokens,
                // Calculate out later after fetching token detailed.
                exchange_out_volumes: [],
            }
        }),
    )
    //#endregion

    return eventLogResponse
        .map((v) => (v.status === 'fulfilled' && v.value ? v.value : null))
        .filter((v) => Boolean(v)) as PoolFromNetwork[]
}
