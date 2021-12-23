import { formatUnits } from '@ethersproject/units'

export const convertValue = (
    amountInUnits: string,
    decimals: number,
    toEthMultiplier: number,
    showUsdPrice: boolean,
    ethPrice: any,
) => {
    return Number.parseFloat(formatUnits(amountInUnits, decimals)) * toEthMultiplier * (showUsdPrice ? ethPrice : 1)
}

export const formattedValue = (
    amountInUnits: string,
    decimals: number,
    toEthMultiplier: number,
    showUsdPrice: boolean,
    ethPrice: any,
) => {
    return convertValue(amountInUnits, decimals, toEthMultiplier, showUsdPrice, ethPrice).toLocaleString()
}
