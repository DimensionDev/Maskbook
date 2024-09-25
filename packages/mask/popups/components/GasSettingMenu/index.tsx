import { memo, useCallback, useMemo, useState } from 'react'
import { noop } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import { Box } from '@mui/system'
import { Button, Typography, useTheme } from '@mui/material'
import { Icons } from '@masknet/icons'
import { FormattedBalance, FormattedCurrency, useGasCurrencyMenu } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import {
    useChainContext,
    useChainIdSupport,
    useFungibleToken,
    useFungibleTokenPrice,
    useGasLimitRange,
    useGasOptions,
    useNativeTokenAddress,
} from '@masknet/web3-hooks-base'
import { GasOptionType, ZERO, formatBalance, formatCurrency, scale10, toFixed } from '@masknet/web3-shared-base'
import { type GasConfig, type ChainId, formatWeiToEther } from '@masknet/web3-shared-evm'
import { useGasOptionsMenu } from '../../hooks/index.js'
import { useGasRatio } from '../../hooks/useGasRatio.js'
import { Trans } from '@lingui/macro'

interface GasSettingMenuProps {
    defaultGasLimit: string | undefined
    defaultGasConfig?: GasConfig
    defaultChainId?: ChainId
    disable?: boolean
    onChange?: (config: GasConfig) => void
    onPaymentTokenChange?: (paymentToken: string) => void
    /** Payment token address */
    paymentToken?: string
    owner?: string
    allowMaskAsGas?: boolean
}

export const GasSettingMenu = memo<GasSettingMenuProps>(function GasSettingMenu({
    defaultGasLimit,
    defaultChainId,
    defaultGasConfig,
    paymentToken,
    disable,
    allowMaskAsGas,
    owner,
    onChange,
    onPaymentTokenChange,
}) {
    const theme = useTheme()

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: defaultChainId })
    const gasRatio = useGasRatio(paymentToken)
    const [gasConfig = defaultGasConfig, setGasConfig] = useState<GasConfig | undefined>()
    const [, chainDefaultGasLimit] = useGasLimitRange(NetworkPluginID.PLUGIN_EVM, { chainId })
    const gasLimit = gasConfig?.gas || defaultGasLimit || chainDefaultGasLimit

    const [gasOptionType = gasConfig?.gasOptionType ?? GasOptionType.SLOW, setGasOptionType] = useState<
        GasOptionType | undefined
    >()

    const handleChange = useCallback(
        (config: GasConfig, type: GasOptionType) => {
            setGasOptionType(type)
            setGasConfig(config)
            onChange?.(config)
        },
        [onChange],
    )

    const [menu, openMenu] = useGasOptionsMenu(gasLimit, !disable ? handleChange : noop, paymentToken)

    const [paymentTokenMenu, openPaymentTokenMenu] = useGasCurrencyMenu(
        NetworkPluginID.PLUGIN_EVM,
        onPaymentTokenChange ?? noop,
        paymentToken,
    )

    const { data: gasOptions } = useGasOptions(NetworkPluginID.PLUGIN_EVM, { chainId })

    {
        const isSupport1559 = useChainIdSupport(NetworkPluginID.PLUGIN_EVM, 'EIP1559', chainId)
        const [prevChainId, setPrevChainId] = useState(chainId)
        if (prevChainId !== chainId) setPrevChainId(chainId)

        if (gasOptions && (!gasConfig || prevChainId !== chainId)) {
            const target = gasOptions[GasOptionType.SLOW]
            setGasConfig(
                isSupport1559 ?
                    {
                        gasOptionType: GasOptionType.SLOW,
                        maxPriorityFeePerGas: target.suggestedMaxPriorityFeePerGas,
                        maxFeePerGas: target.suggestedMaxFeePerGas,
                        gas: defaultGasLimit,
                    }
                :   {
                        gasOptionType: GasOptionType.SLOW,
                        gasPrice: target.suggestedMaxFeePerGas,
                        gas: defaultGasLimit,
                    },
            )
        }
    }

    const nativeTokenAddress = useNativeTokenAddress(NetworkPluginID.PLUGIN_EVM, { chainId })

    const { data: token } = useFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        paymentToken ? paymentToken : nativeTokenAddress,
        undefined,
        { chainId },
    )

    const { data: tokenPrice } = useFungibleTokenPrice(
        NetworkPluginID.PLUGIN_EVM,
        paymentToken ? paymentToken : nativeTokenAddress,
    )

    const gasOptionName = (() => {
        switch (gasOptionType) {
            case GasOptionType.FAST:
                return <Trans>Instant</Trans>
            case GasOptionType.NORMAL:
                return <Trans>High</Trans>
            case GasOptionType.SLOW:
                return <Trans>Medium</Trans>
            default:
                return <Trans>Custom</Trans>
        }
    })()

    const totalGas = useMemo(() => {
        if (!gasConfig || !gasLimit) return ZERO
        const maxGasPrice = 'maxFeePerGas' in gasConfig ? gasConfig.maxFeePerGas : gasConfig.gasPrice
        if (!maxGasPrice) return ZERO
        const maxPriceUsed = new BigNumber(maxGasPrice).times(gasLimit)
        if (!gasRatio) return toFixed(maxPriceUsed, 0)
        return toFixed(maxPriceUsed.multipliedBy(gasRatio), 0)
    }, [gasConfig, gasLimit, gasRatio])

    return (
        <Box display="flex" alignItems="center">
            <Typography fontWeight={700} fontSize={14} mr={0.5}>
                <FormattedBalance
                    value={totalGas}
                    decimals={token?.decimals}
                    significant={4}
                    symbol={token?.symbol}
                    formatter={formatBalance}
                />
                {' ≈ '}
                <FormattedCurrency
                    value={formatWeiToEther(totalGas).times(tokenPrice ?? 0)}
                    options={{
                        onlyRemainTwoOrZeroDecimal: false,
                        customDecimalConfig: {
                            boundary: scale10(1, -4),
                            decimalExp: 4,
                        },
                    }}
                    formatter={formatCurrency}
                />
            </Typography>
            {!disable ?
                <Button
                    variant="text"
                    sx={{
                        py: 0.5,
                        px: 1.5,
                        border: `1px solid ${theme.palette.maskColor.line}`,
                        borderRadius: 99,
                        display: 'inline-flex',
                        alignItems: 'center',
                        columnGap: 0.5,
                    }}
                    onClick={openMenu}>
                    <Typography fontWeight={700} lineHeight="18px" fontSize={14}>
                        {gasOptionName}
                    </Typography>
                    <Icons.Candle size={12} />
                </Button>
            :   null}
            {owner && allowMaskAsGas ?
                <>
                    <Icons.ArrowDrop size={20} sx={{ ml: 0.5, cursor: 'pointer' }} onClick={openPaymentTokenMenu} />
                    {paymentTokenMenu}
                </>
            :   null}
            {menu}
        </Box>
    )
})
