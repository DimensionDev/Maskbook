import { describe, expect, it, vi } from 'vitest'
import { FireflyWalletHistoryAPI, formatWalletHistoryTransaction } from '../../src/Firefly/WalletHistory.js'

// The real helper pulls in the `@masknet/web3-providers/types` package alias, which
// does not resolve under vitest. It is not needed by the formatter under test.
vi.mock('../../src/Firefly/helpers.js', () => ({
    resolveFireflyResponseData: vi.fn(),
}))

const OWNER = '0x1111111111111111111111111111111111111111'
const RECEIVER = '0x2222222222222222222222222222222222222222'
const TOKEN_CONTRACT = '0x3333333333333333333333333333333333333333'
const SPENDER = '0x4444444444444444444444444444444444444444'

function baseItem(
    overrides: Partial<FireflyWalletHistoryAPI.WalletHistoryItem>,
): FireflyWalletHistoryAPI.WalletHistoryItem {
    return {
        chain_id: 1,
        hash: '0xabc000000000000000000000000000000000000000000000000000000000001',
        block_number: 19_000_000,
        tx_status: 'success',
        from_address: OWNER,
        to_address: TOKEN_CONTRACT,
        project_name: '',
        project_logo: '',
        timestamp: '1700000000',
        category: FireflyWalletHistoryAPI.Category.TokenSend,
        ...overrides,
    }
}

describe('formatWalletHistoryTransaction', () => {
    it('maps cateType/cateName/blockNumber for a token send and resolves the real recipient', () => {
        const tx = formatWalletHistoryTransaction(
            baseItem({
                category: FireflyWalletHistoryAPI.Category.TokenSend,
                token_sends: [
                    {
                        chain_id: 1,
                        amount: '1.5',
                        user_address: OWNER,
                        recipient: RECEIVER,
                        sender: OWNER,
                        token: {
                            address: TOKEN_CONTRACT,
                            logo: null,
                            symbol: 'MASK',
                            name: 'Mask Network',
                            decimal: 18,
                            price: '3',
                        },
                    },
                ],
            }),
        )!

        expect(tx.cateType).toBe('send')
        expect(tx.cateName).toBe('Send')
        expect(tx.blockNumber).toBe(19_000_000)
        // the real recipient wins over the executed contract address
        expect(tx.to).toBe(RECEIVER)
        expect(tx.type).toBe('send')
        expect(tx.assets[0]?.direction).toBe('send')
    })

    it('maps cateType/cateName for a token receive and keeps the sender as counterparty', () => {
        const tx = formatWalletHistoryTransaction(
            baseItem({
                category: FireflyWalletHistoryAPI.Category.TokenReceive,
                token_receives: [
                    {
                        chain_id: 1,
                        amount: '2',
                        user_address: OWNER,
                        recipient: OWNER,
                        sender: RECEIVER,
                        token: {
                            address: TOKEN_CONTRACT,
                            logo: null,
                            symbol: 'MASK',
                            name: 'Mask Network',
                            decimal: 18,
                            price: '3',
                        },
                    },
                ],
            }),
        )!

        expect(tx.cateType).toBe('receive')
        expect(tx.cateName).toBe('Receive')
        expect(tx.type).toBe('receive')
        expect(tx.from).toBe(OWNER)
    })

    it('resolves the approve spender as the counterparty for approvals', () => {
        const tx = formatWalletHistoryTransaction(
            baseItem({
                category: FireflyWalletHistoryAPI.Category.TokenApprove,
                token_approve: {
                    amount: 'unlimited',
                    spender_address: SPENDER,
                    token: {
                        address: TOKEN_CONTRACT,
                        logo: null,
                        symbol: 'MASK',
                        name: 'Mask Network',
                        decimal: 18,
                        price: '3',
                    },
                },
            }),
        )!

        expect(tx.to).toBe(SPENDER)
        expect(tx.cateName).toBe('Approve')
        expect(tx.cateType).toBeUndefined()
        expect(tx.type).toBe('approve')
    })

    it('treats a bridge without sends as a receive with Bridge cateName', () => {
        const tx = formatWalletHistoryTransaction(
            baseItem({
                category: FireflyWalletHistoryAPI.Category.TokenBridge,
                token_receives: [
                    {
                        chain_id: 1,
                        amount: '1',
                        user_address: OWNER,
                        recipient: OWNER,
                        sender: RECEIVER,
                        token: {
                            address: TOKEN_CONTRACT,
                            logo: null,
                            symbol: 'MASK',
                            name: 'Mask Network',
                            decimal: 18,
                            price: '3',
                        },
                    },
                ],
            }),
        )!

        expect(tx.type).toBe('receive')
        expect(tx.cateType).toBe('send')
        expect(tx.cateName).toBe('Bridge')
    })

    it('falls back to to_address when no counterparty is derivable', () => {
        const tx = formatWalletHistoryTransaction(
            baseItem({ category: FireflyWalletHistoryAPI.Category.ContractInteraction }),
        )!

        expect(tx.to).toBe(TOKEN_CONTRACT)
        expect(tx.cateName).toBe('Contract Interaction')
        expect(tx.cateType).toBeUndefined()
    })

    it('drops transactions from unknown chains', () => {
        expect(formatWalletHistoryTransaction(baseItem({ chain_id: 999_999_999 }))).toBeNull()
    })
})
