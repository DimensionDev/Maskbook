import { useMemo } from 'react'
import { EthereumAddress } from 'wallet.ts'
import type { Contract } from 'web3-eth-contract'
import type { AbiItem, AbiOutput } from 'web3-utils'
import ERC20ABI from '../../contracts/splitter/ERC20.json'
import RouterV2ABI from '../../contracts/uniswap-v2-router/RouterV2.json'
import type { Erc20 as ERC20 } from '../../contracts/splitter/ERC20'
import type { RouterV2 } from '../../contracts/uniswap-v2-router/RouterV2'
import Services from '../../extension/service'
import { useAccount } from './useAccount'
import { web3 } from '../web3'
import { iteratorToPromiEvent } from '../../utils/promiEvent'

const decodeHexString = (outputs: AbiOutput[], hex: string) => {
    if (outputs.length === 1) return web3.eth.abi.decodeParameter(outputs[0].type, hex)
    if (outputs.length > 1)
        return web3.eth.abi.decodeParameters(
            outputs.map((x) => x.type),
            hex,
        )
    return
}

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

        // no account
        if (!account) return null

        const contract = new web3.eth.Contract(ABI, address) as T

        return Object.assign(contract, {
            methods: new Proxy(contract.methods, {
                get(target, name) {
                    const method = Reflect.get(target, name)
                    const methodABI = contract.options.jsonInterface.find(
                        (x) => x.type === 'function' && x.name === name,
                    )
                    return (...args: any[]) => {
                        console.log('DEBUG: invoke')
                        console.log(args)

                        const cached = method(...args)
                        return {
                            async call(config: Object) {
                                console.log('DEBUG: call')
                                console.log({
                                    name,
                                    config,
                                })

                                return decodeHexString(
                                    methodABI ? methodABI.outputs ?? [] : [],
                                    await Services.Ethereum.callTransaction(account, {
                                        ...config,
                                        to: contract.options.address,
                                        data: cached.encodeABI(),
                                    }),
                                )
                            },
                            send(config: Object) {
                                return iteratorToPromiEvent(
                                    Services.Ethereum.sendTransaction(account, {
                                        ...config,
                                        to: contract.options.address,
                                        data: cached.encodeABI(),
                                    }),
                                )
                            },
                        }
                    }
                },
            }),
        })
    }, [address, account, ABI])
}

export function useERC20TokenContract(address: string) {
    return useContract<ERC20>(address, ERC20ABI as AbiItem[]) as ERC20
}

export function useRouterV2Contract(address: string) {
    return useContract<RouterV2>(address, RouterV2ABI as AbiItem[]) as RouterV2
}
