import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import * as ABICoder from 'web3-eth-abi'
import type { WalletProxy } from '@masknet/web3-contracts/types/WalletProxy.js'
import WalletProxyABI from '@masknet/web3-contracts/abis/WalletProxy.json'
import { WalletProxyByteCode } from '@masknet/web3-contracts/bytes/WalletProxy.js'
import type { ChainId } from '../index.js'

export class WalletContract {
    private coder = ABICoder as unknown as ABICoder.AbiCoder

    private INITIALIZE_TYPE = {
        inputs: [
            {
                internalType: 'contract EntryPoint',
                name: 'anEntryPoint',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'anOwner',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'gasToken',
                type: 'address',
            },
            {
                internalType: 'bytes',
                name: 'functionData',
                type: 'bytes',
            },
        ],
        name: 'initialize',
        outputs: [],
        type: 'function',
    }

    constructor(private chainId: ChainId, private owner: string, private address: string, private entryPoint: string) {}

    /**
     * Encode initialize parameters of WalletContract
     */
    async encodeInitData() {
        return this.coder.encodeFunctionCall(this.INITIALIZE_TYPE as AbiItem, [this.entryPoint, this.owner])
    }

    /**
     * Encode the initCode to deploy WalletProxy contract
     */
    async encodeInitCode(web3: Web3, data: string) {
        const contract = new web3.eth.Contract(WalletProxyABI as AbiItem[]) as unknown as WalletProxy

        return contract
            .deploy({
                data: WalletProxyByteCode,
                arguments: [this.owner, this.address, data],
            })
            .encodeABI()
    }
}
