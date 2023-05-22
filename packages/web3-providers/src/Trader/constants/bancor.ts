import { ChainId } from '@masknet/web3-shared-evm'

export const BANCOR_API_BASE_URL: Record<ChainId.Mainnet | ChainId.Ropsten, string> = {
    [ChainId.Mainnet]: 'https://api-v2.bancor.network',
    [ChainId.Ropsten]: 'https://serve-ropsten-ptdczarhfq-nw.a.run.app',
}
