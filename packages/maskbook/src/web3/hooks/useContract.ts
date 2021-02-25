import { useMemo } from 'react'
import { EthereumAddress } from 'wallet.ts'
import type { Contract } from 'web3-eth-contract'
import type { TransactionConfig } from 'web3-core'
import type { AbiItem } from 'web3-utils'
import { pickBy } from 'lodash-es'
import Services, { ServicesWithProgress } from '../../extension/service'
import { useAccount } from './useAccount'
import { nonFunctionalWeb3 } from '../web3'
import { iteratorToPromiEvent, Stage, StageType } from '../../utils/promiEvent'
import type { EstimateGasOptions } from '@dimensiondev/contracts/types/types'
import { decodeOutputString, decodeEvents } from '../helpers'
import { TransactionEventType } from '../types'

function createContract<T extends Contract>(from: string, address: string, ABI: AbiItem[]) {
    if (!address || !EthereumAddress.isValid(address)) return null

    // hijack method invocations and redirect them to the background service
    const contract = (new nonFunctionalWeb3.eth.Contract(ABI, address) as unknown) as T
    return Object.assign(contract, {
        methods: new Proxy(contract.methods, {
            get(target, name) {
                const method = Reflect.get(target, name)
                const methodABI = contract.options.jsonInterface.find((x) => x.type === 'function' && x.name === name)
                const eventABIs = contract.options.jsonInterface.filter((x) => x.type === 'event')

                return (...args: string[]) => {
                    const cached = method(...args)
                    return {
                        ...cached,
                        async call(config: TransactionConfig) {
                            const config_: TransactionConfig = pickBy({
                                from,
                                to: contract.options.address,
                                data: cached.encodeABI(),
                                ...config,
                            })
                            const result = await Services.Ethereum.callTransaction(config_)

                            if (process.env.NODE_ENV === 'development')
                                console.log({
                                    type: 'call',
                                    name,
                                    args,
                                    config: config_,
                                    outputs: methodABI?.outputs ?? [],
                                    result,
                                })
                            return decodeOutputString(nonFunctionalWeb3, methodABI?.outputs ?? [], result)
                        },
                        // don't add async keyword for this method because a PromiEvent was returned
                        send(config: TransactionConfig, callback?: (error: Error | null, hash?: string) => void) {
                            const config_: TransactionConfig = pickBy({
                                from,
                                to: contract.options.address,
                                data: cached.encodeABI(),
                                ...config,
                            })

                            if (process.env.NODE_ENV === 'development')
                                console.log({
                                    type: 'send',
                                    name,
                                    args,
                                    config: config_,
                                })

                            const iterator = ServicesWithProgress.sendTransaction(config_.from as string, config_)

                            // decode event logs
                            const processor = (stage: Stage) => {
                                switch (stage.type) {
                                    case StageType.RECEIPT:
                                        stage.receipt.events = decodeEvents(nonFunctionalWeb3, eventABIs, stage.receipt)
                                        break
                                    case StageType.CONFIRMATION:
                                        stage.receipt.events = decodeEvents(nonFunctionalWeb3, eventABIs, stage.receipt)
                                        break
                                }
                                return stage
                            }

                            const promiEvent = iteratorToPromiEvent(iterator, processor)

                            // feedback by PromiEvent
                            if (typeof callback === 'undefined') return promiEvent

                            // feedback by callback
                            return promiEvent
                                .on(TransactionEventType.TRANSACTION_HASH, (hash) => callback(null, hash))
                                .on(TransactionEventType.ERROR, (error) => callback(error))
                        },
                        async estimateGas(
                            config?: EstimateGasOptions,
                            callback?: (error: Error | null, gasEstimated?: number) => void,
                        ) {
                            try {
                                const estimated = await Services.Ethereum.estimateGas(
                                    {
                                        from,
                                        to: contract.options.address,
                                        data: cached.encodeABI(),
                                        ...config,
                                    },
                                    await Services.Ethereum.getChainId(from),
                                )
                                if (callback) callback(null, estimated)
                                return estimated
                            } catch (e) {
                                if (callback) {
                                    callback(e)
                                    return 0
                                }
                                throw e
                            }
                        },
                    }
                }
            },
        }),
    }) as T
}

/**
 * Create a contract which will forward its all transactions to the
 * EthereumService in the background page and decode the result of calls automaticallly
 * @param address
 * @param ABI
 */
export function useContract<T extends Contract>(address: string, ABI: AbiItem[]) {
    const account = useAccount()
    return useMemo(() => createContract<T>(account, address, ABI), [account, address, ABI])
}

/**
 * Create many contracts with same ABI
 * @param listOfAddress
 * @param ABI
 */
export function useContracts<T extends Contract>(listOfAddress: string[], ABI: AbiItem[]) {
    const account = useAccount()
    const contracts = useMemo(() => listOfAddress.map((address) => createContract<T>(account, address, ABI)), [
        account,
        listOfAddress,
        ABI,
    ])
    return contracts.filter(Boolean) as T[]
}
