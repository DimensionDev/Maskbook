import { web3 } from './web3'

export function formatBalance(_balance: bigint, decimals: number, precision: number = 6) {
    const balance = String(_balance)
    const divisor = web3.utils.toBN(10).pow(web3.utils.toBN(decimals))

    return `${web3.utils.toBN(balance).div(divisor)}.${web3.utils
        .toBN(balance)
        .mod(divisor)
        .toString()
        .substr(0, precision)
        .replace(/0+$/, '')}`.replace(/\.$/, '')
}
