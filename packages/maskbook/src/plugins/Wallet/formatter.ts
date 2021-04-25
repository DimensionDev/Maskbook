import { BigNumber as BN, BigNumberish } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'bignumber.js'
import { EthereumAddress } from 'wallet.ts'
import { i18n } from '../../utils/i18n-next'

export function formatPercentage(value: BigNumber.Value) {
    const percentage = new BigNumber(value)
        .multipliedBy(100)
        .toFixed(2)
        .replace(/\.?0+$/, '')
    return `${percentage}%`
}

export function formatPrice(price: BigNumber.Value, decimalPlaces = 6) {
    return new BigNumber(price).decimalPlaces(decimalPlaces).toString()
}

export function formatAmount(amount: BigNumber.Value = '0', decimals = 0) {
    return new BigNumber(amount).multipliedBy(new BigNumber(10).pow(decimals)).toFixed()
}

export function formatBalance(rawValue: string | number | BigNumberish | undefined = '0', decimals = 0) {
    let balance = BN.from(rawValue)
    const negative = balance.isNegative() // balance < 0n

    if (negative) balance = balance.abs() // balance * -1n

    return formatUnits(balance, decimals)
}

export function formatCurrency(balance: number, sign = '$') {
    const fixedBalance = balance > 1 ? balance.toFixed(2) : balance.toPrecision(2)
    return `${sign}${fixedBalance.replace(/\d(?=(\d{3})+\.)/g, `${sign}&,`)}`
}

export function formatToken(balance: number) {
    return formatCurrency(balance).replace('$', '')
}

export function formatEthereumAddress(address: string, size = 0) {
    if (!EthereumAddress.isValid(address)) return address
    const address_ = EthereumAddress.checksumAddress(address)
    if (size === 0) return address_
    return `${address_.substr(0, 2 + size)}...${address_.substr(-size)}`
}

export function formatChecksumAddress(address: string) {
    return address && EthereumAddress.isValid(address) ? EthereumAddress.checksumAddress(address) : address
}

export function formatKeccakHash(hash: string, size = 0) {
    if (!/0x[\w\d]{64}/.test(hash)) return hash
    if (size === 0) return hash
    return `${hash.substr(0, 2 + size)}...${hash.substr(-size)}`
}

export function formatNumberString(str: string, size = 0) {
    if (!/\d+/.test(str)) return str
    if (size === 0) return str
    return `${str.substr(0, size)}...${str.substr(-size)}`
}

export function formatElapsed(from: number) {
    const msPerMinute = 60 * 1000
    const msPerHour = msPerMinute * 60
    const msPerDay = msPerHour * 24
    const msPerMonth = msPerDay * 30
    const msPerYear = msPerDay * 365
    const elapsed = Date.now() - from
    if (elapsed < msPerMinute)
        return i18n.t('relative_time_seconds_ago', {
            seconds: Math.round(elapsed / 1000),
        })
    if (elapsed < msPerHour)
        return i18n.t('relative_time_minutes_ago', {
            minutes: Math.round(elapsed / msPerMinute),
        })
    if (elapsed < msPerDay)
        return i18n.t('relative_time_hours_ago', {
            hours: Math.round(elapsed / msPerHour),
        })
    if (elapsed < msPerMonth)
        return i18n.t('relative_time_days_ago', {
            days: Math.round(elapsed / msPerDay),
        })
    if (elapsed < msPerYear)
        return i18n.t('relative_time_months_ago', {
            months: Math.round(elapsed / msPerMonth),
        })
    return i18n.t('relative_time_years_ago', {
        years: Math.round(elapsed / msPerYear),
    })
}

export function formatAmountPrecision(
    amount?: BigNumber.Value,
    token_decimals?: number,
    decimalPlaces = 6,
    precision = 12,
): string {
    const _amount = new BigNumber(formatBalance(amount, token_decimals))
    const _decimalPlaces = decimalPlaces < 0 ? 6 : decimalPlaces
    const _precision = precision < 0 ? 12 : precision

    if (_amount.isZero()) {
        return '0'
    }

    if (_amount.isLessThan(1)) {
        return _amount.toFixed(_precision)
    }

    const len = _amount.precision() - _amount.decimalPlaces()
    if (len <= _decimalPlaces) {
        return _amount.toPrecision(len + _decimalPlaces)
    } else if (len >= _precision) {
        return _amount.toPrecision(len)
    }

    return _amount.toPrecision(_precision)
}
