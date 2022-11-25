import Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import * as ABICoder from 'web3-eth-abi'
import type { WalletProxy } from '@masknet/web3-contracts/types/WalletProxy.js'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json'
import WalletProxyABI from '@masknet/web3-contracts/abis/WalletProxy.json'
import { WalletProxyByteCode } from '@masknet/web3-contracts/bytes/WalletProxy.js'

export class WalletContract {
    private web3 = new Web3()
    private coder = ABICoder as unknown as ABICoder.AbiCoder

    /**
     * WalletContract
     *
     * @param owner the owner address
     * @param address  the deployed contract address
     * @param entryPoint the entry point contract address
     */
    constructor(private owner: string, private address: string, private entryPoint: string) {}

    /**
     * Encoded initialize parameters of WalletContract
     */
    get data() {
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
     * Encoded initCode to deploy WalletProxy contract
     */
    get initCode() {
        const contract = new this.web3.eth.Contract(WalletProxyABI as AbiItem[]) as unknown as WalletProxy
        return contract
            .deploy({
                data: WalletProxyByteCode,
                arguments: [this.owner, this.address, this.data],
            })
            .encodeABI()
    }
}
