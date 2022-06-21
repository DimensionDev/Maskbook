import BigNumber from 'bignumber.js'

export function formatSupply(rawValue: BigNumber.Value = '0', groupSize = 3) {
    const supply = new BigNumber(rawValue)
    const raw = supply.toFormat(groupSize)
    return raw.includes('.') ? raw.replace(/0+$/, '').replace(/\.$/, '') : raw
}
