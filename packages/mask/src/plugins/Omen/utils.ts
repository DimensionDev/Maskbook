import BigNumber from 'bignumber.js'
import type { fpmmTransaction, Stat } from './types'

const normalFormat = {
    decimalSeparator: '.',
    groupSeparator: '',
    groupSize: 0,
    secondaryGroupSize: 0,
    fractionGroupSeparator: '',
    fractionGroupSize: 0,
}

const groupFormat = {
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: ' ',
    fractionGroupSize: 0,
}

const normalConfig = {
    FORMAT: normalFormat,
    ROUNDING_MODE: BigNumber.ROUND_FLOOR,
}

const groupConfig = {
    FORMAT: groupFormat,
    ROUNDING_MODE: BigNumber.ROUND_FLOOR,
}

BigNumber.config(normalConfig)
const GroupBigNumber = BigNumber.clone(groupConfig)

export function formatToShortNumber(number: number, decimals = 2) {
    const insider = number.toFixed(2)

    if (insider.length < 1) {
        return '0'
    }

    const units = ['', 'K', 'M', 'B', 'T']
    let unitIndex = 0
    let rNumber = Number.parseFloat(insider.split(',').join(''))

    while (rNumber >= 1000 && unitIndex < 5) {
        unitIndex += 1
        rNumber = rNumber / 1000
    }

    return `${Number.parseFloat(rNumber.toFixed(decimals))}${units[unitIndex]}`
}


export function bigNumberToString(amount: BigNumber, decimals: number) {
    const decimalsPerToken = new BigNumber(10).pow(decimals)

    return amount.div(decimalsPerToken)
}

export function formatNumber(number: string, decimals = 2) {
    const fixedInt = Number.parseFloat(number.split(',').join('')).toFixed(decimals)
    const splitFixedInt = fixedInt.split('.')[0]
    const formattedSubstring = splitFixedInt.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')

    if (number.length < 1) {
        return `0${decimals > 0 ? '.' + '0'.repeat(decimals) : ''}`
    }
    if (Number(number) < 0.01 && Number(number) > 0) {
        return '<0.01'
    }

    return `${formattedSubstring}${decimals > 0 ? '.' + fixedInt.split('.')[1] : ''}`
}

export function parseTransactionHistory(txData: fpmmTransaction[]) {
    const keys: Date[] = []
    const buyData: Stat[] = []
    const sellData: Stat[] = []

    for (const txObj of txData) {
        let buyVal = 0
        let sellVal = 0
        const txDate = new Date(1000 * +txObj.creationTimestamp)
        keys.push(txDate)

        if (txObj.transactionType.toLowerCase() === 'buy') {
            buyVal = new BigNumber(txObj.sharesOrPoolTokenAmount).toNumber()
        } else if (txObj.transactionType.toLowerCase() === 'sell') {
            sellVal = new BigNumber(txObj.sharesOrPoolTokenAmount).toNumber()
        }

        buyData.push([txDate.getTime(), buyVal])
        sellData.push([txDate.getTime(), sellVal])
    }

    return {
        keys: keys,
        buyData: buyData,
        sellData: sellData,
    }
}
