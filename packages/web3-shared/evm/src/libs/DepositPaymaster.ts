import type { AbiItem } from 'web3-utils'
import { BigNumber } from 'bignumber.js'
import DepositPaymasterABI from '@masknet/web3-contracts/abis/DepositPaymaster.json'
import type { DepositPaymaster as DepositPaymasterType } from '@masknet/web3-contracts/types/DepositPaymaster.js'
import type { ChainId } from '../types/index.js'
import { getSmartPayConstants } from '../constants/constants.js'
import { createContract } from '../helpers/createContract.js'

export class DepositPaymaster {
    /**
     * DepositPaymaster
     * @param chainId ChainId
     */
    constructor(private chainId: ChainId) {}

    private get contract() {
        const { PAYMASTER_MASK_CONTRACT_ADDRESS } = getSmartPayConstants(this.chainId)
        if (!PAYMASTER_MASK_CONTRACT_ADDRESS) return
        // const web3 = new Web3(ProviderURL.from(this.chainId))
        return createContract<DepositPaymasterType>(
            web3,
            PAYMASTER_MASK_CONTRACT_ADDRESS,
            DepositPaymasterABI as AbiItem[],
        )
    }

    async getRatio() {
        const maskBase = await this.contract?.methods.PAYTOKEN_TO_MATIC_RATIO(0).call()
        const gasCurrencyRatio = await this.contract?.methods.PAYTOKEN_TO_MATIC_RATIO(1).call()
        if (!maskBase || !gasCurrencyRatio) return new BigNumber(0)
        return new BigNumber(maskBase).dividedBy(gasCurrencyRatio)
    }
}
