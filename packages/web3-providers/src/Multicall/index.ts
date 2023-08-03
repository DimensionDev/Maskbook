import type { AbiOutput } from 'web3-utils'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { Multicall } from '@masknet/web3-contracts/types/Multicall.js'
import type { BaseContract, NonPayableTx } from '@masknet/web3-contracts/types/types.js'
import {
    type ChainId,
    ContractTransaction,
    decodeOutputString,
    getEthereumConstant,
    type UnboxTransactionObject,
} from '@masknet/web3-shared-evm'
import { ContractReadonlyAPI } from '../Web3/EVM/apis/ContractReadonlyAPI.js'
import { ConnectionReadonlyAPI } from '../Web3/EVM/apis/ConnectionReadonlyAPI.js'
import { CONSERVATIVE_BLOCK_GAS_LIMIT, DEFAULT_GAS_LIMIT, DEFAULT_GAS_REQUIRED } from './constants.js'
import type { MulticallBaseAPI } from '../entry-types.js'

const Contract = new ContractReadonlyAPI()
const Web3 = new ConnectionReadonlyAPI()

export class MulticallAPI implements MulticallBaseAPI.Provider {
    private results: {
        [chainId: number]: {
            blockNumber: number
            results: Record<string, MulticallBaseAPI.Result>
        }
    } = {}

    private createContract(chainId: ChainId) {
        const address = getEthereumConstant(chainId, 'MULTICALL_ADDRESS')
        if (!address) throw new Error('Failed to create multicall contract.')

        const contract = Contract.getMulticallContract(address, { chainId })
        if (!contract) throw new Error('Failed to create multicall contract.')

        return contract
    }

    private toCallKey(call: MulticallBaseAPI.Call) {
        return call.join('-')
    }

    private getCallResult(call: MulticallBaseAPI.Call, chainId: ChainId, blockNumber: number) {
        const cache = this.results[chainId]
        const blockNumber_ = cache?.blockNumber ?? 0
        if (blockNumber_ < blockNumber) return
        return cache.results[this.toCallKey(call)]
    }

    private setCallResult(
        call: MulticallBaseAPI.Call,
        result: MulticallBaseAPI.Result,
        chainId: ChainId,
        blockNumber: number,
    ) {
        const cache = this.results[chainId] ?? {
            results: [],
            blockNumber: 0,
        }
        const blockNumber_ = cache.blockNumber
        if (blockNumber_ > blockNumber) return
        if (blockNumber_ < blockNumber) cache.blockNumber = blockNumber
        cache.results[this.toCallKey(call)] = result
        this.results[chainId] = cache
    }

    // evenly distributes items among the chunks
    private chunkArray(
        items: MulticallBaseAPI.Call[],
        gasLimit = CONSERVATIVE_BLOCK_GAS_LIMIT * 10,
    ): MulticallBaseAPI.Call[][] {
        const chunks: MulticallBaseAPI.Call[][] = []
        let currentChunk: MulticallBaseAPI.Call[] = []
        let currentChunkCumulativeGas = 0

        for (const item of items) {
            // calculate the gas required by the current item
            const gasRequired = item[1] ?? DEFAULT_GAS_REQUIRED

            // if the current chunk is empty, or the current item wouldn't push it over the gas limit,
            // append the current item and increment the cumulative gas
            if (currentChunk.length === 0 || currentChunkCumulativeGas + gasRequired < gasLimit) {
                currentChunk.push(item)
                currentChunkCumulativeGas += gasRequired
            } else {
                // otherwise, push the current chunk and create a new chunk
                chunks.push(currentChunk)
                currentChunk = [item]
                currentChunkCumulativeGas = gasRequired
            }
        }
        if (currentChunk.length > 0) chunks.push(currentChunk)
        return chunks
    }

    async call<
        T extends BaseContract,
        K extends keyof T['methods'],
        R extends UnboxTransactionObject<ReturnType<T['methods'][K]>>,
    >(
        chainId: ChainId,
        contracts: T[],
        names: K[],
        calls: MulticallBaseAPI.Call[],
        overrides?: NonPayableTx,
        blockNumber?: number,
    ): Promise<Array<MulticallBaseAPI.DecodeResult<T, K, R>>> {
        if (!calls.length) return EMPTY_LIST

        const contract = this.createContract(chainId)
        if (!contract) return EMPTY_LIST

        const blockNumber_ = blockNumber ?? (await Web3.getBlockNumber({ chainId }))

        // filter out cached calls
        const unresolvedCalls = calls.filter((call_) => !this.getCallResult(call_, chainId, blockNumber_))

        // resolve the calls by chunks
        if (unresolvedCalls.length) {
            await Promise.all(
                this.chunkArray(unresolvedCalls).map(async (chunk) => {
                    // we don't mind the actual block number of the current call
                    const tx = new ContractTransaction(contract).fill(contract.methods.multicall(chunk), overrides)
                    const hex = await Web3.callTransaction(tx, { chainId })

                    const outputType = contract.options.jsonInterface.find(({ name }) => name === 'multicall')?.outputs
                    if (!outputType) return

                    const decodeResult = decodeOutputString(outputType, hex) as
                        | UnboxTransactionObject<ReturnType<Multicall['methods']['multicall']>>
                        | undefined

                    if (!decodeResult) return

                    decodeResult.returnData.forEach((result, index) =>
                        this.setCallResult(chunk[index], result, chainId, blockNumber_),
                    )
                }),
            )
        }

        const results = calls.map(
            (call) =>
                this.getCallResult(call, chainId, blockNumber_) ?? ([false, '0x0', '0x0'] as MulticallBaseAPI.Result),
        )

        return results.map<MulticallBaseAPI.DecodeResult<T, K, R>>(([succeed, gasUsed, result], index) => {
            const outputs: AbiOutput[] =
                contracts[index].options.jsonInterface.find(
                    ({ type, name }) => type === 'function' && name === names[index],
                )?.outputs ?? []
            try {
                const value = decodeOutputString(outputs, result) as R
                return { succeed, gasUsed, value, error: null }
            } catch (error) {
                return { succeed: false, gasUsed, value: null, error }
            }
        })
    }

    createSingleContractMultipleData<T extends BaseContract, K extends keyof T['methods']>(
        contract: T,
        names: K[],
        callDatas: Array<Parameters<T['methods'][K]>>,
        gasLimit = DEFAULT_GAS_LIMIT,
    ) {
        return callDatas.map<MulticallBaseAPI.Call>((data, i) => [
            contract.options.address,
            gasLimit,
            contract.methods[names[i]](...data).encodeABI() as string,
        ])
    }

    createMultipleContractSingleData<T extends BaseContract, K extends keyof T['methods']>(
        contracts: T[],
        names: K[],
        callData: Parameters<T['methods'][K]>,
        gasLimit = DEFAULT_GAS_LIMIT,
    ) {
        return contracts.map<MulticallBaseAPI.Call>((contract, i) => [
            contract.options.address,
            gasLimit,
            contract.methods[names[i]](...callData).encodeABI() as string,
        ])
    }

    createMultipleContractMultipleData<T extends BaseContract, K extends keyof T['methods']>(
        contracts: T[],
        names: K[],
        callDatas: Array<Parameters<T['methods'][K]>>,
        gasLimit = DEFAULT_GAS_LIMIT,
    ) {
        return contracts.map<MulticallBaseAPI.Call>((contract, i) => [
            contract.options.address,
            gasLimit,
            contract.methods[names[i]](callDatas[i]).encodeABI() as string,
        ])
    }
}
