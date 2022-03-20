import type { Pagination, Web3Plugin } from "@masknet/plugin-infra";
import { TokenList as TokenListAPI } from "@masknet/web3-providers";
import { ChainId, getTokenListConstants } from "@masknet/web3-shared-evm";

export class TokenList implements Web3Plugin.ObjectCapabilities.TokenListState {
    // getNonFungibleTokenLists: (address: string, providerType: string, network: Web3Plugin.NetworkDescriptor) => Promise<Web3Plugin.TokenList[]>;
    async getFungibleTokenLists(chainId: ChainId) {
        const { FUNGIBLE_TOKEN_LISTS = [] } = getTokenListConstants(chainId)
        const tokens = await TokenListAPI.fetchERC20TokensFromTokenLists(FUNGIBLE_TOKEN_LISTS, chainId)
        return {
            name: '',
            description: '',
            tokens: tokens.map((x) => ({
                id: x.address,
                ...x
            })),
        }

    }
}
