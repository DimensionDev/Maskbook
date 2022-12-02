import Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import * as ABICoder from 'web3-eth-abi'
import type { WalletProxy } from '@masknet/web3-contracts/types/WalletProxy.js'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json'
import WalletProxyABI from '@masknet/web3-contracts/abis/WalletProxy.json'
import { WalletProxyByteCode } from '@masknet/web3-contracts/bytes/WalletProxy.js'
import { createContract } from '../helpers/transaction.js'
import { ZERO_ADDRESS } from '../constants/index.js'

export class ContractWallet {
    private web3 = new Web3()
    private coder = ABICoder as unknown as ABICoder.AbiCoder

    /**
     * ContractWallet
     *
     * @param owner the owner address
     * @param address  the deployed logic contract address
     * @param entryPoint the entry point contract address
     */
    constructor(private owner: string, private address: string, private entryPoint: string) {}

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
        const abi = WalletABI.find((x) => x.name === 'initialize' && x.type === 'function')
        if (!abi) throw new Error('Failed to load ABI.')

        return this.coder.encodeFunctionCall(abi as AbiItem, [
            this.entryPoint,
            this.owner,
            '0x0000000000000000000000000000000000000000',
            '0x',
        ])
    }

    /**
     * Encoded initCode for deploying a WalletProxy contract
     */
    get initCode() {
        return this.contract
            ?.deploy({
                data: WalletProxyByteCode,
                arguments: [this.owner, this.address, this.data],
            })
            .encodeABI()
    }
}
