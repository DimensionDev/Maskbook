import { BigNumber } from 'bignumber.js'
import { type ChangeEvent, memo, useCallback, useMemo } from 'react'
import { useWeb3Utils } from '@masknet/web3-hooks-base'
import { NUMERIC_INPUT_REGEXP_PATTERN } from '@masknet/shared-base'
import { formatBalance, isZero, leftShift } from '@masknet/web3-shared-base'
import { FungibleTokenInputUI, type FungibleTokenInputUIProps } from './UI.js'

const MIN_AMOUNT_LENGTH = 1
const MAX_AMOUNT_LENGTH = 79

export interface FungibleTokenInputProps extends Omit<FungibleTokenInputUIProps, 'onMaxClick'> {
    amount: string
    maxAmount?: string
    maxAmountShares?: number
    disabled?: boolean
    placeholder?: string
    onAmountChange: (amount: string) => void
    isAvailableBalance?: boolean
}

export const FungibleTokenInput = memo<FungibleTokenInputProps>(
    ({
        label,
        token,
        disabled,
        disableMax,
        disableBalance,
        disableToken,
        loadingBalance,
        onSelectToken,
        onAmountChange,
        amount,
        maxAmount,
        balance,
        isAvailableBalance,
        placeholder = '0.0',
        maxAmountShares = 1,
        className,
    }) => {
        const Utils = useWeb3Utils()

        const isNative = isAvailableBalance ?? Utils.isNativeTokenAddress(token?.address)

        // #region update amount by self
        const { RE_MATCH_WHOLE_AMOUNT, RE_MATCH_FRACTION_AMOUNT } = useMemo(
            () => ({
                RE_MATCH_FRACTION_AMOUNT: new RegExp(`^\\.\\d{0,${token?.decimals}}$`),
                RE_MATCH_WHOLE_AMOUNT: new RegExp(`^\\d*\\.?\\d{0,${token?.decimals}}$`), // d.ddd...d
            }),
            [token?.decimals],
        )
        const onChange = useCallback(
            (ev: ChangeEvent<HTMLInputElement>) => {
                const raw = ev.currentTarget.value.replaceAll(',', '.')
                if (RE_MATCH_FRACTION_AMOUNT.test(raw)) onAmountChange(`0${raw}`)
                else if (raw === '' || RE_MATCH_WHOLE_AMOUNT.test(raw)) onAmountChange(raw)
            },
            [onAmountChange, RE_MATCH_WHOLE_AMOUNT, RE_MATCH_FRACTION_AMOUNT],
        )
        // #endregion

        return (
            <FungibleTokenInputUI
                label={label}
                isNative={isNative}
                token={token}
                onSelectToken={onSelectToken}
                value={amount}
                onChange={onChange}
                className={className}
                inputProps={{
                    autoComplete: 'off',
                    autoCorrect: 'off',
                    title: 'Token Amount',
                    inputMode: 'decimal',
                    min: 0,
                    minLength: MIN_AMOUNT_LENGTH,
                    maxLength: MAX_AMOUNT_LENGTH,
                    pattern: NUMERIC_INPUT_REGEXP_PATTERN,
                    spellCheck: false,
                }}
                placeholder={placeholder}
                onKeyDown={(ev) => {
                    if (ev.key === 'Enter') ev.preventDefault()
                }}
                onMaxClick={() => {
                    if (!token) return
                    const amount = new BigNumber(maxAmount ?? balance).dividedBy(maxAmountShares).decimalPlaces(0, 1)
                    const formattedBalance = formatBalance(amount, token.decimals, {
                        significant: token.decimals,
                        isPrecise: true,
                        hasSeparators: false,
                    })

                    onAmountChange(
                        (isZero(formattedBalance) ?
                            new BigNumber(leftShift(amount, token.decimals).toPrecision(2)).toFormat()
                        :   formattedBalance) ?? '0',
                    )
                }}
                balance={balance}
                required
                loadingBalance={loadingBalance}
                disabled={disabled}
                disableMax={disableMax}
                disableBalance={disableBalance}
                disableToken={disableToken}
            />
        )
    },
)
FungibleTokenInput.displayName = 'FungibleTokenInput'
