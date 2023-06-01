import type { Account } from '@masknet/shared-base'
import { isValidAddress, type ChainId, isValidChainId, formatEthereumAddress } from '../index.js'

export class EIP155Editor {
    constructor(private chainId: ChainId, private address: string) {}

    get account(): Account<ChainId> {
        return {
            chainId: this.chainId,
            account: formatEthereumAddress(this.address),
        }
    }

    get eip155ChainId() {
        return ['eip155', this.chainId.toFixed()].join(':')
    }

    get eip155Address() {
        return ['eip155', this.chainId.toFixed(), formatEthereumAddress(this.address)]
    }

    static from(text: string) {
        const [, chainId, address] = text.split(':')
        const chainId_ = Number.parseInt(chainId, 10)
        if (!isValidChainId(chainId_) || !isValidAddress(address)) throw new Error('Invalid address text.')
        return new EIP155Editor(chainId_, address)
    }
}
