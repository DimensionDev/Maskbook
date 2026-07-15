import { uniqBy } from 'lodash-es'
import { toFunctionSelector, type Abi } from 'viem'
import type { AbiFunction } from 'abitype'

// built-in abis
import { BulkCheckoutAbi } from '@masknet/web3-contracts/types/BulkCheckout.js'
import { HappyRedPacketV4Abi } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'
import { ERC20Abi } from '@masknet/web3-contracts/types/ERC20.js'
import { ERC721Abi } from '@masknet/web3-contracts/types/ERC721.js'
import { WETHAbi } from '@masknet/web3-contracts/types/WETH.js'
import { LidoAbi } from '@masknet/web3-contracts/types/Lido.js'
import { AaveLendingPoolAbi } from '@masknet/web3-contracts/types/AaveLendingPool.js'
import { SmartPayEntryPointAbi } from '@masknet/web3-contracts/types/SmartPayEntryPoint.js'
import { WalletAbi } from '@masknet/web3-contracts/types/Wallet.js'
import { Create2FactoryAbi } from '@masknet/web3-contracts/types/Create2Factory.js'
import { LensHubAbi } from '@masknet/web3-contracts/types/LensHub.js'
import { AirdropV2Abi } from '@masknet/web3-contracts/types/AirdropV2.js'

class ABI {
    private abis = new Map<string, AbiFunction[]>()

    constructor() {
        this.construct(BulkCheckoutAbi) // donate gitcoin grants
        this.construct(HappyRedPacketV4Abi)
        this.construct(ERC721Abi)
        this.construct(ERC20Abi)
        this.construct(WETHAbi) // wrap & unwrap
        this.construct(LidoAbi) // lido saving
        this.construct(AaveLendingPoolAbi) // Aave saving
        this.construct(SmartPayEntryPointAbi) // smart pay entrypoint
        this.construct(WalletAbi) // Contract Wallet
        this.construct(Create2FactoryAbi) // Create2Factory
        this.construct(LensHubAbi)
        this.construct(AirdropV2Abi)
    }

    read(signature?: string) {
        if (!signature) return
        return this.abis.get(signature)
    }
    construct(abi: Abi) {
        abi.forEach((x) => {
            if (x.type !== 'function') return
            if (x.stateMutability === 'pure' || x.stateMutability === 'view') return
            const { name } = x
            if (!name) return
            try {
                const signature = toFunctionSelector(x)

                const all: AbiFunction[] = uniqBy(
                    [...(this.abis.get(signature) ?? []), x],
                    (x) => `${x.name}_${x.inputs.map((y) => `${y.type}_${y.name}`)}`,
                )
                this.abis.set(signature, all)
            } catch {
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
