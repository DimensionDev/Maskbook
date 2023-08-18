import { describe, test, expect } from 'vitest'
import type { Wallet } from '@masknet/shared-base'
import { handleDuplicatedWalletName } from '../../src/helpers/handleDuplicatedWalletName.js'

describe('handleDuplicatedWalletName util test', () => {
    test.each([
        { wallets: [{ name: 'a' }] as Wallet[], name: 'a', expected: 'a (1)' },
        { wallets: [{ name: 'b' }] as Wallet[], name: 'a', expected: 'a' },
        { wallets: [{ name: 'b' }] as Wallet[], name: 'a', expected: 'a' },
        { wallets: [{ name: 'a (1)' }, { name: 'a (5)' }] as Wallet[], name: 'a', expected: 'a (6)' },
        { wallets: [{ name: 'b' }] as Wallet[], name: 'a', expected: 'a' },
    ])('.format($give)', ({ wallets, name, expected }) => {
        expect(handleDuplicatedWalletName(wallets, name)).toBe(expected)
    })
})
