import { uniqBy } from 'lodash-es'
import type { AbiItem } from 'web3-utils'
import { abiCoder } from '@masknet/web3-shared-evm'
import type { TransactionMethodABI } from './types.js'

// built-in abis
import BulkCheckout from '@masknet/web3-contracts/abis/BulkCheckout.json'
import NftRedPacket from '@masknet/web3-contracts/abis/NftRedPacket.json'
import HappyRedPacketV4 from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import ERC20 from '@masknet/web3-contracts/abis/ERC20.json'
import ERC721 from '@masknet/web3-contracts/abis/ERC721.json'
import WETH from '@masknet/web3-contracts/abis/WETH.json'
import WalletContract from '@masknet/web3-contracts/abis/Wallet.json'
import Create2Factory from '@masknet/web3-contracts/abis/Create2Factory.json'
import LensHub from '@masknet/web3-contracts/abis/LensHub.json'
import LensFollowNFT from '@masknet/web3-contracts/abis/LensFollowNFT.json'

class ABI {
    private abis: Map<string, TransactionMethodABI[]> = new Map()

    constructor() {
        this.construct(BulkCheckout as AbiItem[]) // donate gitcoin grants
        this.construct(NftRedPacket as AbiItem[])
        this.construct(HappyRedPacketV4 as AbiItem[])
        this.construct(ERC721 as AbiItem[])
        this.construct(ERC20 as AbiItem[])
        this.construct(WETH as AbiItem[]) // wrap & unwrap
        this.construct(WalletContract as AbiItem[]) // Contract Wallet
        this.construct(Create2Factory as AbiItem[]) // Create2Factory
        this.construct(LensHub as AbiItem[])
        this.construct(LensFollowNFT as AbiItem[])
    }

    read(signature?: string) {
        if (!signature) return
        return this.abis.get(signature)
    }
    construct(abi: AbiItem[]) {
        abi.forEach((x) => {
            if (x.type !== 'function') return
            if (x.stateMutability === 'pure' || x.stateMutability === 'view') return
            const { name, inputs = [] } = x
            if (!name) return
            try {
                const signature = abiCoder.encodeFunctionSignature(x)

                const all = uniqBy(
                    [
                        ...(this.abis.get(signature) ?? []),
                        {
                            name,
                            parameters:
                                inputs.map((y) => ({
                                    name: y.name,
                                    type: y.type,
                                    components: y.components,
                                })) ?? [],
                        },
                    ],
                    (x) => `${x.name}_${x.parameters.map((y) => `${y.type}_${y.name}`)}`,
                )
                this.abis.set(signature, all)
            } catch (error) {
                console.log('Failed to encode function signature from below ABI:')
                console.log(x)
            }
        })
    }
}

let abi: ABI

export function readABIs(signature?: string) {
    return (abi ||= new ABI()).read(signature)
}
