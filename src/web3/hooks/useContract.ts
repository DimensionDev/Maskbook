import { useMemo } from 'react'
import { EthereumAddress } from 'wallet.ts'
import type { Contract } from 'web3-eth-contract'
import type { TransactionConfig } from 'web3-core'
import type { AbiItem } from 'web3-utils'
import Services, { ServicesWithProgress } from '../../extension/service'
import { useAccount } from './useAccount'
import { nonFunctionalWeb3 } from '../web3'
import { iteratorToPromiEvent } from '../../utils/promiEvent'
import type { EstimateGasOptions } from '../../contracts/types'
import { decodeOutputString } from '../helpers'

/**
 * Create a contract which will forward its all transactions to the
 * EthereumService in the background page and automaticallly decoding the result
 * @param address
 * @param ABI
 */
export function useContract<T extends Contract>(address: string, ABI: AbiItem[]) {
    const account = useAccount()
    return useMemo(() => {
        // no a valid contract address
        if (!EthereumAddress.isValid(address)) return null

        const contract = new nonFunctionalWeb3.eth.Contract(ABI, address) as T
        return Object.assign(contract, {
            methods: new Proxy(contract.methods, {
                get(target, name) {
                    const method = Reflect.get(target, name)
                    const methodABI = contract.options.jsonInterface.find(
                        (x) => x.type === 'function' && x.name === name,
                    )
                    return (...args: string[]) => {
                        const cached = method(...args)
                        return {
                            ...cached,
                            async call(config: TransactionConfig) {
                                const result = await Services.Ethereum.callTransaction(account, {
                                    from: account,
                                    to: contract.options.address,
                                    data: cached.encodeABI(),
                                    ...config,
                                })
                                console.log(
                                    `call - ${JSON.stringify({
                                        name,
                                        from: account,
                                        to: contract.options.address,
                                        ...config,
                                    })}`,
                                )

                                return decodeOutputString(
                                    nonFunctionalWeb3,
                                    methodABI ? methodABI.outputs ?? [] : [],
                                    result,
                                )
                            },
                            send(config: TransactionConfig) {
                                if (!account) throw new Error('cannot find account')

                                console.log(
                                    `send - ${JSON.stringify({
                                        from: account,
                                        to: contract.options.address,
                                        data: cached.encodeABI(),
                                        ...config,
                                    })}`,
                                )

                                return iteratorToPromiEvent(
                                    ServicesWithProgress.sendTransaction(
                                        account,
                                        {
                                            from: account,
                                            to: contract.options.address,
                                            data: cached.encodeABI(),
                                            ...config,
                                        },
                                        {
                                            name: String(name),
                                            args,
                                        },
                                    ),
                                )
                            },
                            async estimateGas(
                                config?: EstimateGasOptions,
                                callback?: (error: Error | null, gasEstimated?: number) => void,
                            ) {
                                try {
                                    const estimated = await Services.Ethereum.estimateGas({
                                        from: account,
                                        to: contract.options.address,
                                        data: cached.encodeABI(),
                                        ...config,
                                    })
                                    if (callback) callback(null, estimated)
                                    return estimated
                                } catch (e) {
                                    if (callback) callback(e)
                                    else throw e
                                    return 0
                                }
                            },
                        }
                    }
                },
            }),
        }) as T
    }, [address, account, ABI])
}
