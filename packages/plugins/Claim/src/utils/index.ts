import { type ChainId, EtherscanURL, getITOConstants, SchemaType, type Web3Connection } from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'
import isAfter from 'date-fns/isAfter'
import isEqual from 'date-fns/isEqual'
import { BigNumber } from 'bignumber.js'
import { Interface } from '@ethersproject/abi'
import ITO_ABI from '@masknet/web3-contracts/abis/ITO2.json'
import { isSameAddress, type FungibleToken, TokenType } from '@masknet/web3-shared-base'
import { ITO_CONTRACT_BASE_TIMESTAMP } from '../constants.js'
import { checkAvailability } from './checkAvailability.js'
import type { SwappedTokenType } from '../types.js'

const interFace = new Interface(ITO_ABI)

type TxType = {
    hash: string
    input: string
    from: string
    to: string
    blockNumber: string
}

export async function getClaimAllPools(
    chainId: ChainId,
    endBlock: number,
    swapperAddress: string,
    connection: Web3Connection,
) {
    const { ITO2_CONTRACT_ADDRESS, ITO2_CONTRACT_CREATION_BLOCK_HEIGHT: startBlock } = getITOConstants(chainId)

    if (!ITO2_CONTRACT_ADDRESS || !startBlock || !connection) return []
    // #region
    // 1. Filter out `swap` transactions,
    // 2. Retrieve payload major data from its decoded input param.
    const response = await fetch(
        urlcat(EtherscanURL.from(chainId), {
            action: 'txlist',
            module: 'account',
            sort: 'desc',
            startBlock,
            endBlock,
            address: ITO2_CONTRACT_ADDRESS,
            chain_id: chainId,
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

    const swapRawData: SwapRawType[] = result.flatMap((txType: TxType) => {
        if (!isSameAddress(txType.from, swapperAddress)) return []
        try {
            const decodedInputParam = interFace.decodeFunctionData('swap', txType.input) as unknown as SwapInputParam

            return {
                txHash: txType.hash,
                pid: decodedInputParam.id,
            }
        } catch {
            return []
        }
    })

    // 3. filter out pools that have unlock_time.
    const swapRawFilteredData = (
        await Promise.allSettled(
            swapRawData.map(async (value) => {
                const availability = await checkAvailability(
                    value.pid,
                    swapperAddress,
                    ITO2_CONTRACT_ADDRESS,
                    chainId,
                    connection,
                )
                const unlockTime = new Date(Number(availability.unlock_time) * 1000)
                if (isEqual(unlockTime, new Date(ITO_CONTRACT_BASE_TIMESTAMP)) || availability.claimed) return null

                return { ...value, unlockTime, isClaimable: isAfter(Date.now(), unlockTime) }
            }),
        )
    )
        .map((v) => (v.status === 'fulfilled' && v.value ? v.value : null))
        .filter((v) => !!v) as SwapRawFilteredType[]

    interface SwapSuccessEventParams {
        to_address: string
        to_value: BigNumber
    }

    // 4. Retrieve `SwapSuccess` Event to get tokenDetailed
    const swappedTokenUnmergedList = (
        await Promise.allSettled(
            swapRawFilteredData.map(async (value) => {
                const result = await connection.getTransactionReceipt(value.txHash, { chainId })
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
                    token: {
                        id: eventParams.to_address,
                        address: eventParams.to_address,
                        type: TokenType.Fungible,
                        schema: SchemaType.ERC20,
                        chainId,
                    } as FungibleToken<ChainId, SchemaType.ERC20>,
                }
            }),
        )
    )
        .map((v) => (v.status === 'fulfilled' && v.value ? v.value : null))
        .filter((v) => !!v) as SwappedTokenType[]

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
