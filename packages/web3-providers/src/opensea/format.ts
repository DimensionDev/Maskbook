import {
    ChainId,
    ERC721ContractDetailed,
    ERC721TokenDetailed,
    ERC721TokenInfo,
    EthereumTokenType,
} from '@masknet/web3-shared-evm'
import type { Asset } from './type'

export function createERC721Token(
    contractDetailed: ERC721ContractDetailed,
    info: ERC721TokenInfo,
    tokenId: string,
): ERC721TokenDetailed {
    return {
        contractDetailed,
        info,
        tokenId,
    }
}

export function format(address: string, size: number, assets: Asset[]) {
    return {
        assets: assets
            .filter(
                (x) =>
                    ['non-fungible', 'semi-fungible'].includes(x.asset_contract.asset_contract_type) ||
                    ['ERC721', 'ERC1155'].includes(x.asset_contract.schema_name),
            )
            .map((x) =>
                createERC721Token(
                    {
                        chainId: ChainId.Mainnet,
                        type: EthereumTokenType.ERC721,
                        name: x.asset_contract.name,
                        symbol: x.asset_contract.symbol,
                        address: x.asset_contract.address,
                    },
                    {
                        owner: address,
                        name: x.name || x.asset_contract.name,
                        description: x.description || x.asset_contract.symbol,
                        mediaUrl: x.image_url || x.image_preview_url || x.asset_contract.image_url || '',
                    },
                    x.token_id,
                ),
            ),
        hasNextPage: assets.length === size,
    }
}
