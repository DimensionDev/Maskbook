import { beforeAll, describe, expect, test } from 'vitest'
import {
    createInMemoryKVStorageBackend,
    createKVStorageHost,
    KVStorageBackend,
    UNIT_TEST_ADDRESS,
    UNIT_TEST_ERC20_ADDRESS,
} from '@masknet/shared-base'
import { TokenState, TokenStorage } from '../../src/web3-state'
import { ChainId, formatEthereumAddress, isValidAddress, SchemaType } from '@masknet/web3-shared-evm'
import { isSameAddress, Token, TokenType } from '@masknet/web3-shared-base'

const defaultValue: TokenStorage<ChainId, SchemaType> = {
    fungibleTokenList: {},
    nonFungibleTokenList: {},
    fungibleTokenBlockedBy: {},
    nonFungibleTokenBlockedBy: {},
}

const backend = createInMemoryKVStorageBackend(() => {})
const memory: KVStorageBackend = {
    beforeAutoSync: Promise.resolve(),
    getValue(key) {
        return backend.getValue(key)
    },
    async setValue(key: string, value: unknown) {
        await backend.setValue(key, value)
    },
}

describe('test web3-state token', () => {
    let tokenInstance
    const storage = {}

    beforeAll(() => {
        const mockContext = {
            createKVStorage: createKVStorageHost(memory, { on: () => {} } as any),
        } as any
        tokenInstance = new TokenState(
            mockContext,
            defaultValue,
            {
                account: {
                    getCurrentValue: () => UNIT_TEST_ADDRESS,
                    subscribe: (callback: () => void) => () => {},
                },
            },
            {
                isValidAddress,
                isSameAddress,
                formatAddress: formatEthereumAddress,
            },
        )
    })

    test('should init token', async () => {
        expect(tokenInstance.trustedFungibleTokens.getCurrentValue()).toEqual([])
        expect(tokenInstance.trustedNonFungibleTokens.getCurrentValue()).toEqual([])
        expect(tokenInstance.blockedFungibleTokens.getCurrentValue()).toEqual([])
        expect(tokenInstance.blockedNonFungibleTokens.getCurrentValue()).toEqual([])
    })

    test('should add fungible token', async () => {
        const fungibleToken = {
            id: UNIT_TEST_ADDRESS,
            schema: SchemaType.ERC20,
            address: UNIT_TEST_ERC20_ADDRESS,
            chainId: ChainId.Mainnet,
            creator: UNIT_TEST_ADDRESS,
            tokenId: '1',
            type: TokenType.Fungible,
        } as Token<ChainId, SchemaType>

        await tokenInstance.addOrRemoveToken(UNIT_TEST_ADDRESS, fungibleToken, 'add')

        expect(tokenInstance.blockedNonFungibleTokens.getCurrentValue()).toEqual([])
    })
})
