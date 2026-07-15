import { isUndefined, max } from 'lodash-es'
import type { Wallet } from '@masknet/shared-base'

export function generateUniqueWalletName(wallets: Wallet[], name: string) {
    const num = /\((\d+)\)/u.exec(name)?.[1]
    const baseName = num ? name.split(` (${num})`)[0] : name

    const maxIndex =
        max([
            ...wallets
                .map((x) => /\((\d+)\)/u.exec(x.name.split(`${baseName} `)[1])?.[1])
                .filter((x) => x && !Number.isNaN(x))
                .map(Number),
            ...(num && !Number.isNaN(num) ? [Number(num) - 1] : []),
        ]) ?? (wallets.some((wallet) => wallet.name === baseName) ? 0 : undefined)

    if (isUndefined(maxIndex)) return name

    return `${baseName} (${maxIndex + 1})`
}
