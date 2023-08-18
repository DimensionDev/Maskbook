import { describe, test, expect } from 'vitest'
import type { Wallet } from '@masknet/shared-base'
import { generateNewWalletName } from '../../src/helpers/generateNewWalletName.js'

describe('generateNewWalletName util test', () => {
    test.each([
        { wallets: [{ name: 'Wallet 1' }] as Wallet[], index: 0, expected: 'Wallet 2' },
        { wallets: [{ name: 'Wallet 3' }] as Wallet[], index: 0, expected: 'Wallet 4' },
        { wallets: [{ name: 'Wallet 2' }, { name: 'Wallet 3' }] as Wallet[], index: 1, expected: 'Wallet 5' },
        { wallets: [{ name: 'Wallet 3' }] as Wallet[], index: 0, preIndex: 1, expected: 'Wallet 1' },
        { wallets: [{ name: 'Wallet 5' }] as Wallet[], index: 1, preIndex: 10, expected: 'Wallet 10' },
    ])('.format($wallets $index $preIndex)', ({ wallets, index, preIndex, expected }) => {
        expect(generateNewWalletName(wallets, index, preIndex)).toBe(expected)
    })
})
