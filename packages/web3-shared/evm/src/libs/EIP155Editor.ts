import type { Account } from '@masknet/shared-base'
import { type ChainId, formatEthereumAddress, EthereumMethodType, isValidAddress, isValidChainId } from '../index.js'

export class EIP155Editor {
    constructor(
        private chainId: ChainId,
        private address: string,
    ) {}

    get account(): Account<ChainId> {
        return {
            chainId: this.chainId,
            account: formatEthereumAddress(this.address),
        }
    }

    get proposalNamespace() {
        return {
            accounts: [],
            methods: [
                EthereumMethodType.eth_sign,
                EthereumMethodType.eth_sendTransaction,
                EthereumMethodType.personal_sign,
            ],
            chains: [this.eip155ChainId],
            events: ['chainChanged', 'accountsChanged', 'disconnect', 'connect'],
        }
    }

    get eip155ChainId() {
        return ['eip155', this.chainId.toFixed()].join(':')
    }

    get eip155Address() {
        return ['eip155', this.chainId.toFixed(), formatEthereumAddress(this.address)].join(':')
    }

    static from(text: string) {
        const [, chainId, address] = text.split(':')
        const chainId_ = Number.parseInt(chainId, 10)
        if (!isValidChainId(chainId_) || !isValidAddress(address)) return
        return new EIP155Editor(chainId_, address)
    }

    static fromChainId(chainId: ChainId) {
        if (!isValidChainId(chainId)) return
        return new EIP155Editor(chainId, '')
    }

    static fromAccount({ chainId, account }: Account<ChainId>) {
        if (!isValidChainId(chainId) || !isValidAddress(account)) return
        return new EIP155Editor(chainId, account)
    }
}
