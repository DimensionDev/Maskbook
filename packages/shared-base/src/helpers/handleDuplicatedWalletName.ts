import { isUndefined, max } from 'lodash-es'
import type { Wallet } from '../index.js'

export function handleDuplicatedWalletName(wallets: Wallet[], name: string) {
    const maxIndex =
        max(
            wallets
                .filter((x) => !x.owner)
                .map((x) => x.name.split(`${name} `)[1].match(/\((\d+)\)/)?.[1])
                .filter((x) => x && !Number.isNaN(x))
                .map(Number),
        ) ?? (wallets.some((wallet) => wallet.name === name) ? 0 : undefined)

    if (isUndefined(maxIndex)) return name

    return `${name} (${maxIndex + 1})`
}
