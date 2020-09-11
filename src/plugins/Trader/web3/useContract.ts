import { useMemo } from 'react'
import { EthereumAddress } from 'wallet.ts'
import type { Contract } from 'web3-eth-contract'
import type { AbiItem } from 'web3-utils'
import { web3 } from '../../Wallet/web3'
import ERC20ABI from '../../../contracts/splitter/ERC20.json'
import RouterV2ABI from '../../../contracts/uniswap-v2-router/RouterV2.json'
import type { Erc20 as ERC20 } from '../../../contracts/splitter/ERC20'
import type { RouterV2 } from '../../../contracts/uniswap-v2-router/RouterV2'

export function useContract<T extends Contract>(address: string, ABI: AbiItem[]) {
    return useMemo(() => {
        // no a valid contract address
        if (!EthereumAddress.isValid(address)) return null
        return new web3.eth.Contract(ABI, address) as T
    }, [address, ABI])
}

export function useERC20TokenContract(address: string) {
    return useContract<ERC20>(address, ERC20ABI as AbiItem[])
}

export function useRouterV2Contract(address: string) {
    return useContract<RouterV2>(address, RouterV2ABI as AbiItem[])
}
