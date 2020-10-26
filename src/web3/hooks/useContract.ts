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
import type { EstimateGasOptions } from '../../contracts/types'
import { decodeOutputString, decodeEvents } from '../helpers'
import { TransactionEventType } from '../types'

/**
 * Create a contract which will forward its all transactions to the
 * EthereumService in the background page and automaticallly decoding the result
 * @param address
 * @param ABI
 */
export function useContract<T extends Contract>(address: string, ABI: AbiItem[]) {
    const account = useAccount()
    return useMemo(() => {
        // not a valid contract address
        if (!EthereumAddress.isValid(address)) return null

        const contract = (new nonFunctionalWeb3.eth.Contract(ABI, address) as unknown) as T
        return Object.assign(contract, {
            methods: new Proxy(contract.methods, {
                get(target, name) {
                    const method = Reflect.get(target, name)
                    const methodABI = contract.options.jsonInterface.find(
                        (x) => x.type === 'function' && x.name === name,
                    )
                    const eventABIs = contract.options.jsonInterface.filter((x) => x.type === 'event')
                    return (...args: string[]) => {
                        const cached = method(...args)
                        return {
                            ...cached,
                            async call(config?: TransactionConfig) {
                                const result = await Services.Ethereum.callTransaction(
                                    (config?.from ?? account) as string,
                                    pickBy({
                                        from: account,
                                        to: contract.options.address,
                                        data: cached.encodeABI(),
                                        ...config,
                                    }),
                                )

                                if (process.env.NODE_ENV === 'development')
                                    console.log(
                                        `call - ${JSON.stringify({
                                            name,
                                            ...pickBy({
                                                from: account,
                                                to: contract.options.address,
                                                data: cached.encodeABI(),
                                                ...config,

                                                args,
                                                result,
                                                outputs: methodABI ? methodABI.outputs ?? [] : [],
                                            }),
                                        })}`,
                                    )

                                return decodeOutputString(
                                    nonFunctionalWeb3,
                                    methodABI ? methodABI.outputs ?? [] : [],
                                    result,
                                )
                            },
                            // don't add async keyword for this method because a PromiEvent was returned
                            send(config: TransactionConfig, callback?: (error: Error | null, hash?: string) => void) {
                                if (!config.from && !account) throw new Error('cannot find account')

                                if (process.env.NODE_ENV === 'development')
                                    console.log(
                                        `send - ${JSON.stringify({
                                            from: account,
                                            to: contract.options.address,
                                            data: cached.encodeABI(),
                                            ...config,
                                        })}`,
                                    )

                                const iterator = ServicesWithProgress.sendTransaction(
                                    (config.from ?? account) as string,
                                    {
                                        from: account,
                                        to: contract.options.address,
                                        data: cached.encodeABI(),
                                        ...config,
                                    },
                                )

                                const processor = (stage: Stage) => {
                                    switch (stage.type) {
                                        case StageType.RECEIPT:
                                            stage.receipt.events = decodeEvents(
                                                nonFunctionalWeb3,
                                                eventABIs,
                                                stage.receipt,
                                            )
                                            break
                                        case StageType.CONFIRMATION:
                                            stage.receipt.events = decodeEvents(
                                                nonFunctionalWeb3,
                                                eventABIs,
                                                stage.receipt,
                                            )
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
                                    .on(TransactionEventType.ERROR, callback)
                            },
                            async estimateGas(
                                config?: EstimateGasOptions,
                                callback?: (error: Error | null, gasEstimated?: number) => void,
                            ) {
                                try {
                                    const estimated = await Services.Ethereum.estimateGas(
                                        {
                                            from: account,
                                            to: contract.options.address,
                                            data: cached.encodeABI(),
                                            ...config,
                                        },
                                        await Services.Ethereum.getChainId(account),
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
    }, [address, account, ABI])
}
