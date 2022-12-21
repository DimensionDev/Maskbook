import Web3 from 'web3'
import { ChainId, createContract, getRPCConstants, getSmartPayConstants } from '../index.js'
import type { AbiItem } from 'web3-utils'
import DepositPaymasterABI from '@masknet/web3-contracts/abis/DepositPaymaster.json'
import type { DepositPaymaster as DepositPaymasterType } from '@masknet/web3-contracts/types/DepositPaymaster.js'
import { BigNumber } from 'bignumber.js'
import { first } from 'lodash-es'
export class DepositPaymaster {
    /**
     * DepositPaymaster
     * @param chainId ChainId
     */
    constructor(private chainId: ChainId) {}

    private get contract() {
        const { PAYMASTER_CONTRACT_ADDRESS } = getSmartPayConstants(this.chainId)
        if (!PAYMASTER_CONTRACT_ADDRESS) return
        const RPC_URL = first(getRPCConstants(this.chainId).RPC_URLS)
        if (!RPC_URL) throw new Error('Failed to create web3 provider.')
        const web3 = new Web3(RPC_URL)
        return createContract<DepositPaymasterType>(web3, PAYMASTER_CONTRACT_ADDRESS, DepositPaymasterABI as AbiItem[])
    }

    async getRatio() {
        const maskBase = await this.contract?.methods.PAYTOKEN_TO_MATIC_RATIO(0).call()
        const gasCurrencyRatio = await this.contract?.methods.PAYTOKEN_TO_MATIC_RATIO(1).call()
        if (!maskBase || !gasCurrencyRatio) return new BigNumber(0)
        return new BigNumber(maskBase).dividedBy(gasCurrencyRatio)
    }
}
