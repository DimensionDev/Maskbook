import { max } from 'lodash-es'
import type { Wallet } from '@masknet/shared-base'

export function generateNewWalletName(wallets: Wallet[], index = 0, preIndex?: number) {
    const indexList = wallets.map((x) => x.name.split('Wallet ', 2)[1])
    const maxIndex = max(indexList.filter((x) => x && !Number.isNaN(x)).map(Number)) ?? 0
    const preIndexNotExists = indexList.every((x) => Number(x) !== preIndex)
    const finalIndex = preIndex && (preIndex > maxIndex || preIndexNotExists) ? preIndex : maxIndex + index + 1
    return `Wallet ${finalIndex}`
}
