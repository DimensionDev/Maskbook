import { useMemo } from 'react'
import { EthereumAddress } from 'wallet.ts'
import type { Contract } from 'web3-eth-contract'
import type { AbiItem } from 'web3-utils'
import { web3 } from '../../plugins/Wallet/web3'

export function useContract<T extends Contract>(address: string, ABI: AbiItem[]) {
    return useMemo(() => {
        // no a valid contract address
        if (!EthereumAddress.isValid(address)) return null
        return new web3.eth.Contract(ABI, address) as T
    }, [address, ABI])
}
