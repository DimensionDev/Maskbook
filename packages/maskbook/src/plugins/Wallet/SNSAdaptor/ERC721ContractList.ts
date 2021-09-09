import { ERC721ContractDetailed, EthereumTokenType, ChainId } from '@masknet/web3-shared'

// cspell:ignore mayc, axie, coolcats, OPENSTORE
// Todo: move to https://github.com/DimensionDev/Mask-Token-List
export const ERC721_CONTRACT_LIST: ERC721ContractDetailed[] = [
    {
        type: EthereumTokenType.ERC721,
        address: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb',
        chainId: ChainId.Mainnet,
        name: 'CRYPTOPUNKS',
        symbol: 'PUNK',
        iconURL: new URL('../../../web3/assets/cryptopunks.png', import.meta.url).toString(),
    },
    {
        type: EthereumTokenType.ERC721,
        address: '0x495f947276749ce646f68ac8c248420045cb7b5e',
        chainId: ChainId.Mainnet,
        name: 'OpenSea Collection',
        symbol: 'OPENSTORE',
        iconURL: new URL('../../../web3/assets/opensea.png', import.meta.url).toString(),
    },
    {
        type: EthereumTokenType.ERC721,
        address: '0x60e4d786628fea6478f785a6d7e704777c86a7c6',
        chainId: ChainId.Mainnet,
        name: 'MutantApeYachtClub',
        symbol: 'MAYC',
        iconURL: new URL('../../../web3/assets/mayc.png', import.meta.url).toString(),
    },
    {
        type: EthereumTokenType.ERC721,
        address: '0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270',
        chainId: ChainId.Mainnet,
        name: 'Art Blocks',
        symbol: 'BLOCKS',
        iconURL: new URL('../../../web3/assets/art_blocks.png', import.meta.url).toString(),
    },
    {
        type: EthereumTokenType.ERC721,
        address: '0xF5D669627376EBd411E34b98F19C868c8ABA5ADA',
        chainId: ChainId.Mainnet,
        name: 'Axie Infinity Shard',
        symbol: 'AXS',
        iconURL: new URL('../../../web3/assets/axie_infinite.png', import.meta.url).toString(),
    },
    {
        type: EthereumTokenType.ERC721,
        address: '0x1a92f7381b9f03921564a437210bb9396471050c',
        chainId: ChainId.Mainnet,
        name: 'Cool Cats',
        symbol: 'COOL',
        iconURL: new URL('../../../web3/assets/coolcats.png', import.meta.url).toString(),
    },
]
