import { max } from 'lodash-es'
import type { Wallet } from '../index.js'

export function generateNewWalletName(wallets: Wallet[], index = 0) {
    const maxIndex =
        max(
            wallets
                .filter((x) => !x.owner)
                .map((x) => x.name.split('Wallet ')[1])
                .filter((x) => x && !Number.isNaN(x))
                .map(Number),
        ) ?? 0

    return `Wallet ${maxIndex + index + 1}`
}
