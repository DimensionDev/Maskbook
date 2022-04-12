import { TokenType, Web3Plugin } from '@masknet/plugin-infra/web3'
import type { ERC721TokenDetailed } from '@masknet/web3-shared-evm'

export function createNonFungibleToken(token: ERC721TokenDetailed) {
    return {
        ...token,
        id: `${token.contractDetailed.address}_${token.tokenId}`,
        tokenId: token.tokenId,
        chainId: token.contractDetailed.chainId,
        type: TokenType.NonFungible,
        name: token.info.name ?? `${token.contractDetailed.name} ${token.tokenId}`,
        description: token.info.description ?? '',
        owner: token.info.owner,
        contract: {
            ...token.contractDetailed,
            type: TokenType.NonFungible,
            id: token.contractDetailed.address,
        },
        metadata: {
            name: token.info.name ?? `${token.contractDetailed.name} ${token.tokenId}`,
            description: token.info.description ?? '',
            mediaType: 'Unknown',
            iconURL: token.contractDetailed.iconURL,
            assetURL: token.info.mediaUrl,
        },
    } as Web3Plugin.NonFungibleToken
}
