import { describe, test, expect } from 'vitest'
import type { Wallet } from '@masknet/shared-base'
import { generateUniqueWalletName } from '../../src/helpers/generateUniqueWalletName.js'

describe('generateUniqueWalletName util test', () => {
    test.each([
        { wallets: [{ name: 'a' }] as Wallet[], name: 'a', expected: 'a (1)' },
        { wallets: [{ name: 'b' }] as Wallet[], name: 'a', expected: 'a' },
        { wallets: [{ name: 'b' }] as Wallet[], name: 'a', expected: 'a' },
        { wallets: [{ name: 'a (1)' }, { name: 'a (5)' }] as Wallet[], name: 'a', expected: 'a (6)' },
        { wallets: [{ name: 'a (3)' }] as Wallet[], name: 'a (1)', expected: 'a (4)' },
        { wallets: [{ name: 'a (3)' }] as Wallet[], name: 'a (11)', expected: 'a (11)' },
    ])('.format($wallets $name)', ({ wallets, name, expected }) => {
        expect(generateUniqueWalletName(wallets, name)).toBe(expected)
    })
})
