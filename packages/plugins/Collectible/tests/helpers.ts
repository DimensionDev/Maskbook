/* cspell:disable */
import { describe, expect, test } from 'vitest'
import { ChainId as ChainIdEVM } from '@masknet/web3-shared-evm'
import { ChainId as ChainIdSolana } from '@masknet/web3-shared-solana'
import { SourceType } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { getPayloadFromURL } from '../src/helpers/url.js'

describe('getPayloadFromURL', () => {
    test.each([
        // opensea
        {
            give: 'https://opensea.io/assets/ethereum/0xacf63e56fd08970b43401492a02f6f38b6635c91/6904',
            expected: {
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: ChainIdEVM.Mainnet,
                address: '0xacf63e56fd08970b43401492a02f6f38b6635c91',
                tokenId: '6904',
                provider: SourceType.OpenSea,
            },
        },
        {
            give: 'https://opensea.io/assets/0x495f947276749ce646f68ac8c248420045cb7b5e/56425770890571901364709314909006309845893422678022758049264381688673894137857',
            expected: {
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: ChainIdEVM.Mainnet,
                address: '0x495f947276749ce646f68ac8c248420045cb7b5e',
                tokenId: '56425770890571901364709314909006309845893422678022758049264381688673894137857',
                provider: SourceType.OpenSea,
            },
        },
        {
            give: 'https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/37184720117030123527613878453157327379579715621769914641223890119352530249488',
            expected: {
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: ChainIdEVM.Polygon,
                address: '0x2953399124f0cbb46d2cbacd8a89cf0599974963',
                tokenId: '37184720117030123527613878453157327379579715621769914641223890119352530249488',
                provider: SourceType.OpenSea,
            },
        },

        // rarible
        {
            give: 'https://rarible.com/token/0x59468516a8259058bad1ca5f8f4bff190d30e066:3127',
            expected: {
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: ChainIdEVM.Mainnet,
                address: '0x59468516a8259058bad1ca5f8f4bff190d30e066',
                tokenId: '3127',
                provider: SourceType.Rarible,
            },
        },
        {
            give: 'https://rarible.com/token/polygon/0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f:68268762474892781208201789517785975190627759693862686943836537749845164189472',
            expected: {
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: ChainIdEVM.Polygon,
                address: '0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f',
                tokenId: '68268762474892781208201789517785975190627759693862686943836537749845164189472',
                provider: SourceType.Rarible,
            },
        },

        {
            give: 'https://rarible.com/token/solana/zyru7e6AadBrhFZFQe9r7vM3HxHAVee4Xb8d46qb5Tb',
            expected: {
                pluginID: NetworkPluginID.PLUGIN_SOLANA,
                chainId: ChainIdSolana.Mainnet,
                address: 'zyru7e6AadBrhFZFQe9r7vM3HxHAVee4Xb8d46qb5Tb',
                tokenId: 'zyru7e6AadBrhFZFQe9r7vM3HxHAVee4Xb8d46qb5Tb',
                provider: SourceType.Rarible,
            },
        },

        // zora
        {
            give: 'https://market.zora.co/collections/0x60E4d786628Fea6478F785A6d7e704777c86a7c6/25620',
            expected: {
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: ChainIdEVM.Mainnet,
                address: '0x60E4d786628Fea6478F785A6d7e704777c86a7c6',
                tokenId: '25620',
                provider: SourceType.Zora,
            },
        },

        // x2y2
        {
            give: 'https://x2y2.io/eth/0x6d19568A959FCB4211852F6472d3df7b67C6Cd54/332',
            expected: {
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: ChainIdEVM.Mainnet,
                address: '0x6d19568A959FCB4211852F6472d3df7b67C6Cd54',
                tokenId: '332',
                provider: SourceType.X2Y2,
            },
        },

        // loosrare
        {
            give: 'https://looksrare.org/collections/0x60E4d786628Fea6478F785A6d7e704777c86a7c6/28850',
            expected: {
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: ChainIdEVM.Mainnet,
                address: '0x60E4d786628Fea6478F785A6d7e704777c86a7c6',
                tokenId: '28850',
                provider: SourceType.LooksRare,
            },
        },

        // element
        {
            give: 'https://www.element.market/assets/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/42798313877148491394654426314792201679600836708934007480215157583411817507060',
            expected: {
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: ChainIdEVM.Mainnet,
                address: '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85',
                tokenId: '42798313877148491394654426314792201679600836708934007480215157583411817507060',
                provider: SourceType.Element,
            },
        },
        {
            give: 'https://www.element.market/assets/bsc/0x51353799f8550c9010a8b0cbfe6c02ca96e026e2/0',
            expected: {
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: ChainIdEVM.BSC,
                address: '0x51353799f8550c9010a8b0cbfe6c02ca96e026e2',
                tokenId: '0',
                provider: SourceType.Element,
            },
        },
        {
            give: 'https://www.element.market/assets/polygon/0xf3892ecb9802c4bd13a123d9d1041654583915e1/4937',
            expected: {
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: ChainIdEVM.Polygon,
                address: '0xf3892ecb9802c4bd13a123d9d1041654583915e1',
                tokenId: '4937',
                provider: SourceType.Element,
            },
        },
    ])('.getAssetInfoFromURL($give)', ({ give, expected }) => {
        const asset = getPayloadFromURL(give)

        expect(asset?.pluginID).toBe(expected.pluginID)
        expect(asset?.chainId).toBe(expected.chainId)
        expect(asset?.address).toBe(expected.address)
        expect(asset?.tokenId).toBe(expected.tokenId)
        expect(asset?.provider).toBe(expected.provider)
    })
})
