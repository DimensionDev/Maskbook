import { max } from 'lodash-es'
import type { Wallet } from '../index.js'

export function generateNewWalletName(wallets: Wallet[], index = 0, preIndex?: number) {
    const maxIndex =
        max(
            wallets
                .filter((x) => !x.owner)
                .map((x) => x.name.split('Wallet ')[1])
                .filter((x) => x && !Number.isNaN(x))
                .map(Number),
        ) ?? 0

    const finalIndex = preIndex && preIndex > maxIndex ? preIndex : maxIndex + index + 1

    return `Wallet ${finalIndex}`
}
