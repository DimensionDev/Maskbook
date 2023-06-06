import Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import * as ABICoder from 'web3-eth-abi'
import type { WalletProxy } from '@masknet/web3-contracts/types/WalletProxy.js'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json'
import WalletProxyABI from '@masknet/web3-contracts/abis/WalletProxy.json'
import { WalletProxyByteCode } from '@masknet/web3-contracts/bytes/WalletProxy.mjs'
import { createContract } from '../helpers/createContract.js'
import { getSmartPayConstants, ZERO_ADDRESS } from '../constants/index.js'
import type { ChainId } from '../types/index.js'

export class ContractWallet {
    private web3 = new Web3.default()
    private coder = ABICoder as unknown as ABICoder.AbiCoder

    /**
     * ContractWallet
     *
     * @param owner the owner address
     * @param address  the deployed logic contract address
     * @param entryPoint the entry point contract address
     */
    constructor(private chainId: ChainId, private owner: string, private address: string, private entryPoint: string) {}

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

        return this.coder.encodeFunctionCall(abi as AbiItem, [
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
