import type { AbiItem } from 'web3-utils'
import {
    type ChainId,
    createContract,
    ZERO_ADDRESS,
    getSmartPayConstants,
    abiCoder,
    Web3,
} from '@masknet/web3-shared-evm'
import type { WalletProxy } from '@masknet/web3-contracts/types/WalletProxy.js'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json' with { type: 'json' }
import WalletProxyABI from '@masknet/web3-contracts/abis/WalletProxy.json' with { type: 'json' }
import { WalletProxyByteCode } from '@masknet/web3-contracts/bytes/WalletProxy.mjs'

export class ContractWallet {
    private web3 = new Web3()

    /**
     * ContractWallet
     *
     * @param owner the owner address
     * @param address  the deployed logic contract address
     * @param entryPoint the entry point contract address
     */
    constructor(
        private chainId: ChainId,
        private owner: string,
        private address: string,
        private entryPoint: string,
    ) {}

    /**
     * The wallet proxy contract instance
     */
    private get contract() {
        return createContract<WalletProxy>(this.web3, ZERO_ADDRESS, WalletProxyABI as AbiItem[])
    }

    /**
     * Encoded initialize parameters of ContractWallet
     */
    private get data() {
        const {
            PAYMASTER_MASK_CONTRACT_ADDRESS,
            PAYMASTER_NATIVE_CONTRACT_ADDRESS,
            PAYMASTER_MINIMAL_STAKE_AMOUNT,
            PAYMENT_TOKEN_ADDRESS,
        } = getSmartPayConstants(this.chainId)
        if (
            !PAYMASTER_MASK_CONTRACT_ADDRESS ||
            !PAYMASTER_NATIVE_CONTRACT_ADDRESS ||
            !PAYMASTER_MINIMAL_STAKE_AMOUNT ||
            !PAYMENT_TOKEN_ADDRESS
        )
            return

        const abi = WalletABI.find((x) => x.name === 'initialize' && x.type === 'function')
        if (!abi) throw new Error('Failed to load ABI.')

        return abiCoder.encodeFunctionCall(abi as AbiItem, [
            this.entryPoint,
            this.owner,
            PAYMENT_TOKEN_ADDRESS,
            PAYMASTER_MASK_CONTRACT_ADDRESS,
            PAYMASTER_MINIMAL_STAKE_AMOUNT,
            PAYMASTER_NATIVE_CONTRACT_ADDRESS,
        ])
    }

    /**
     * Encoded initCode for deploying a WalletProxy contract
     */
    get initCode() {
        if (!this.contract) throw new Error('Failed to create proxy contract.')
        return this.contract
            .deploy({
                data: WalletProxyByteCode,
                arguments: [this.owner, this.address, this.data],
            })
            .encodeABI()
    }
}
