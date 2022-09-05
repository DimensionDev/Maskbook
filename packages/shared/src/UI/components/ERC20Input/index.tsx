import { ChangeEvent, memo, useCallback, useMemo } from 'react'
import { useWeb3State, Web3Helper } from '@masknet/plugin-infra/web3'
import { formatBalance, FungibleToken } from '@masknet/web3-shared-base'
import { ERC20InputUI } from './UI'
import BigNumber from 'bignumber.js'

const MIN_AMOUNT_LENGTH = 1
const MAX_AMOUNT_LENGTH = 79

export interface ERC20InputProps {
    amount: string
    maxAmount?: string
    maxAmountShares?: number
    maxAmountSignificant?: number
    balance: string
    label: string
    disabled?: boolean
    displayMax?: boolean
    placeholder?: string
    token?: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    onSelectToken: () => void
    onAmountChange: (amount: string) => void
}

export const ERC20Input = memo<ERC20InputProps>(
    ({
        label,
        token,
        disabled,
        displayMax,
        onSelectToken,
        onAmountChange,
        amount,
        maxAmount,
        balance,
        maxAmountSignificant,
        placeholder = '0.0',
        maxAmountShares = 1,
    }) => {
        const { Others } = useWeb3State()

        const isNative = Others?.isNativeTokenAddress(token?.address)

        // #region update amount by self
        const { RE_MATCH_WHOLE_AMOUNT, RE_MATCH_FRACTION_AMOUNT } = useMemo(
            () => ({
                RE_MATCH_FRACTION_AMOUNT: new RegExp(`^\\.\\d{0,${token?.decimals}}$`), // .ddd...d
                RE_MATCH_WHOLE_AMOUNT: new RegExp(`^\\d*\\.?\\d{0,${token?.decimals}}$`), // d.ddd...d
            }),
            [token?.decimals],
        )
        const onChange = useCallback(
            (ev: ChangeEvent<HTMLInputElement>) => {
                const amount_ = ev.currentTarget.value.replace(/,/g, '.')
                if (RE_MATCH_FRACTION_AMOUNT.test(amount_)) onAmountChange(`0${amount_}`)
                else if (amount_ === '' || RE_MATCH_WHOLE_AMOUNT.test(amount_)) onAmountChange(amount_)
            },
            [onAmountChange, RE_MATCH_WHOLE_AMOUNT, RE_MATCH_FRACTION_AMOUNT],
        )
        // #endregion

        return (
            <ERC20InputUI
                label={label}
                isNative={isNative}
                token={token}
                onSelectToken={onSelectToken}
                value={amount}
                onChange={onChange}
                inputProps={{
                    autoComplete: 'off',
                    autoCorrect: 'off',
                    title: 'Token Amount',
                    inputMode: 'decimal',
                    min: 0,
                    minLength: MIN_AMOUNT_LENGTH,
                    maxLength: MAX_AMOUNT_LENGTH,
                    pattern: '^[0-9]*[.,]?[0-9]*$',
                    spellCheck: false,
                }}
                placeholder={placeholder}
                onKeyDown={(ev) => {
                    if (ev.key === 'Enter') ev.preventDefault()
                }}
                onMaxClick={() => {
                    if (!token) return
                    const amount = new BigNumber(maxAmount ?? balance).dividedBy(maxAmountShares).decimalPlaces(0, 1)
                    onAmountChange(formatBalance(amount, token.decimals, maxAmountSignificant) ?? '0')
                }}
                balance={balance}
                required
                disabled={disabled}
                displayMax={displayMax}
            />
        )
    },
)
