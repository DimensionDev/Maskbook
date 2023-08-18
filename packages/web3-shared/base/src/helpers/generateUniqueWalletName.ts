import { isUndefined, max } from 'lodash-es'
import type { Wallet } from '@masknet/shared-base'

export function generateUniqueWalletName(wallets: Wallet[], name: string) {
    const num = name.match(/\((\d+)\)/)?.[1]
    const _name = num ? name.split(` (${num})`)?.[0] : name

    const maxIndex =
        max([
            ...wallets
                .filter((x) => !x.owner)
                .map((x) => x.name.split(`${_name} `)[1]?.match(/\((\d+)\)/)?.[1])
                .filter((x) => x && !Number.isNaN(x))
                .map(Number),
            ...(num && !Number.isNaN(num) ? [Number(num) - 1] : []),
        ]) ?? (wallets.some((wallet) => wallet.name === _name) ? 0 : undefined)

    if (isUndefined(maxIndex)) return name

    return `${_name} (${maxIndex + 1})`
}
