import type Web3 from 'web3'
import { ChainId, ExternalProvider } from '@masknet/web3-shared-evm'
import type { Provider } from '../types'
import type { RequestArguments } from 'web3-core'

export class CustomNetworkProvider implements Provider {
    request<T extends unknown>(requestArguments: RequestArguments): Promise<T> {
        throw new Error('Method not implemented.')
    }
    createExternalProvider(): Promise<ExternalProvider> {
        throw new Error('Method not implemented.')
    }
    createWeb3(): Promise<Web3> {
        throw new Error('Method not implemented.')
    }
    requestAccounts(): Promise<{ chainId: ChainId; accounts: string[] }> {
        return Promise.resolve({
            accounts: [],
            chainId: ChainId.Mainnet,
        })
    }
}
