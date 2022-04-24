import {
    ChainId,
    getExplorerConstants,
    getITOConstants,
    isSameAddress,
    FungibleTokenDetailed,
    SchemaType,
} from '@masknet/web3-shared-evm'
import { Interface } from '@ethersproject/abi'
import ITO_ABI from '@masknet/web3-contracts/abis/ITO2.json'
import urlcat from 'urlcat'
import { first } from 'lodash-unified'
import BigNumber from 'bignumber.js'
import type { PoolFromNetwork, JSON_PayloadFromChain, SwappedTokenType } from '../../types'
import { MSG_DELIMITER, ITO_CONTRACT_BASE_TIMESTAMP } from '../../constants'
import { getTransactionReceipt } from '../../../../extension/background-script/EthereumService'
import { checkAvailability } from './checkAvailability'
import isAfter from 'date-fns/isAfter'
import isEqual from 'date-fns/isEqual'

const interFace = new Interface(ITO_ABI)

type TxType = {
    hash: string
    input: string
    from: string
    to: string
    blockNumber: string
}

export async function getAllPoolsAsSeller(
    chainId: ChainId,
    startBlock: number | undefined,
    endBlock: number,
    sellerAddress: string,
) {
    const { EXPLORER_API, API_KEYS = [] } = getExplorerConstants(chainId)
    const { ITO2_CONTRACT_ADDRESS } = getITOConstants(chainId)

    if (!EXPLORER_API || !ITO2_CONTRACT_ADDRESS || !startBlock) return []

    // #region
    // 1. Filter out `Fill_Pool` transactions,
    // 2. Retrieve payload major data from its decoded input param.
    const response = await fetch(
        urlcat(EXPLORER_API, {
            apikey: first(API_KEYS),
            action: 'txlist',
            module: 'account',
            sort: 'desc',
            startBlock,
            endBlock,
            address: ITO2_CONTRACT_ADDRESS,
        }),
    )
    if (!response.ok) return []

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

    const payloadList: { payload: JSON_PayloadFromChain; hash: string }[] = (await response.json()).result?.reduce(
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
                    // #region Retrieve at step 3
                    pid: '',
                    creation_time: 0,
                    // #endregion
                    // #region Retrieve at step 4
                    total_remaining: '',
                    // #endregion
                    // #region Retrieve from database
                    password: '',
                    // #endregion
                }

                return acc.concat({ payload, hash: cur.hash })
            } catch {
                return acc
            }
        },
        [],
    )
    // #endregion

    // #region
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
    // #endregion

    return eventLogResponse
        .map((v) => (v.status === 'fulfilled' && v.value ? v.value : null))
        .filter((v) => Boolean(v)) as PoolFromNetwork[]
}

export async function getClaimAllPools(chainId: ChainId, endBlock: number, swapperAddress: string) {
    const { EXPLORER_API, API_KEYS = [] } = getExplorerConstants(chainId)
    const { ITO2_CONTRACT_ADDRESS, ITO2_CONTRACT_CREATION_BLOCK_HEIGHT: startBlock } = getITOConstants(chainId)

    if (!EXPLORER_API || !ITO2_CONTRACT_ADDRESS || !startBlock) return []
    // #region
    // 1. Filter out `swap` transactions,
    // 2. Retrieve payload major data from its decoded input param.
    const response = await fetch(
        urlcat(EXPLORER_API, {
            apikey: first(API_KEYS),
            action: 'txlist',
            module: 'account',
            sort: 'desc',
            startBlock,
            endBlock,
            address: ITO2_CONTRACT_ADDRESS,
        }),
    )
    if (!response.ok) return []

    type SwapInputParam = {
        id: string
        verification: string
        exchange_addr_i: BigNumber
        data: string[]
    }

    interface SwapRawType {
        txHash: string
        pid: string
    }

    interface SwapRawFilteredType extends SwapRawType {
        isClaimable: boolean
        unlockTime: Date
    }

    const result = (await response.json()).result

    if (!Array.isArray(result)) return []

    const swapRawData: SwapRawType[] = result.reduce((acc: SwapRawType[], cur: TxType) => {
        if (!isSameAddress(cur.from, swapperAddress)) return acc
        try {
            const decodedInputParam = interFace.decodeFunctionData('swap', cur.input) as unknown as SwapInputParam
            return acc.concat({
                txHash: cur.hash,
                pid: decodedInputParam.id,
            })
        } catch {
            return acc
        }
    }, [])

    // 3. filter out pools that have unlock_time.
    const swapRawFilteredData = (
        await Promise.allSettled(
            swapRawData.map(async (value) => {
                const availability = await checkAvailability(value.pid, swapperAddress, ITO2_CONTRACT_ADDRESS, chainId)
                const unlockTime = new Date(Number(availability.unlock_time) * 1000)
                if (isEqual(unlockTime, new Date(ITO_CONTRACT_BASE_TIMESTAMP)) || availability.claimed) return null

                return { ...value, unlockTime, isClaimable: isAfter(Date.now(), unlockTime) }
            }),
        )
    )
        .map((v) => (v.status === 'fulfilled' && v.value ? v.value : null))
        .filter((v) => Boolean(v)) as SwapRawFilteredType[]

    interface SwapSuccessEventParams {
        to_address: string
        to_value: BigNumber
    }

    // 4. Retrieve `SwapSuccess` Event to get tokenDetailed
    const swappedTokenUnmergedList = (
        await Promise.allSettled(
            swapRawFilteredData.map(async (value) => {
                const result = await getTransactionReceipt(value.txHash, { chainId })
                if (!result) return null
                const log = result.logs.find((log) => isSameAddress(log.address, ITO2_CONTRACT_ADDRESS))
                if (!log) return null
                const eventParams = interFace.decodeEventLog(
                    'SwapSuccess',
                    log.data,
                    log.topics,
                ) as unknown as SwapSuccessEventParams

                return {
                    pids: [value.pid],
                    amount: new BigNumber(Number(eventParams.to_value)),
                    isClaimable: value.isClaimable,
                    unlockTime: value.unlockTime,
                    token: { address: eventParams.to_address, type: SchemaType.ERC20 } as FungibleTokenDetailed,
                }
            }),
        )
    )
        .map((v) => (v.status === 'fulfilled' && v.value ? v.value : null))
        .filter((v) => Boolean(v)) as SwappedTokenType[]

    // 5. merge same swap token pools into one
    const swappedTokenList = swappedTokenUnmergedList.reduce((acc: SwappedTokenType[], cur) => {
        if (acc.some(checkClaimable(cur)) && cur.isClaimable) {
            // merge same claimable tokens to one
            const existToken = acc.find(checkClaimable(cur))
            const existTokenIndex = acc.findIndex(checkClaimable(cur))
            acc[existTokenIndex] = mergeTokens(existToken!, cur)
        } else if (acc.some(checkUnlockTimeEqual(cur))) {
            // merge same unlock time tokens to one
            const existToken = acc.find(checkUnlockTimeEqual(cur))
            const existTokenIndex = acc.findIndex(checkUnlockTimeEqual(cur))
            acc[existTokenIndex] = mergeTokens(existToken!, cur)
        } else {
            acc.push(cur)
        }
        return acc
    }, [])

    return swappedTokenList
}

function mergeTokens(a: SwappedTokenType, b: SwappedTokenType) {
    a.pids = a.pids.concat(b.pids)
    a.amount = a.amount.plus(b.amount)
    return a
}

function checkUnlockTimeEqual(cur: SwappedTokenType) {
    return (t: SwappedTokenType) =>
        isSameAddress(t.token.address, cur.token.address) && isEqual(t.unlockTime, cur.unlockTime)
}

function checkClaimable(cur: SwappedTokenType) {
    return (t: SwappedTokenType) => isSameAddress(t.token.address, cur.token.address) && t.isClaimable
}
