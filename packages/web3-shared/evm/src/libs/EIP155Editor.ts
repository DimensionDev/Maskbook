import type { Account } from '@masknet/shared-base'
import { type ChainId, formatEthereumAddress, EthereumMethodType } from '../index.js'

export class EIP155Editor {
    constructor(private chainId: ChainId, private address: string) {}

    get account(): Account<ChainId> {
        return {
            chainId: this.chainId,
            account: formatEthereumAddress(this.address),
        }
    }

    get eip155Namespace() {
        return {
            methods: [
                EthereumMethodType.ETH_SIGN,
                EthereumMethodType.ETH_SIGN_TYPED_DATA,
                EthereumMethodType.ETH_SEND_TRANSACTION,
                EthereumMethodType.ETH_SIGN_TRANSACTION,
                EthereumMethodType.PERSONAL_SIGN,
            ],
            chains: [this.eip155ChainId],
            events: ['chainChanged', 'accountsChanged'],
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
        return new EIP155Editor(Number.parseInt(chainId, 10), address)
    }

    static fromChainId(chainId: ChainId) {
        return new EIP155Editor(chainId, '')
    }
}
