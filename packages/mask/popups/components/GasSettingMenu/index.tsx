import { memo, useCallback, useMemo, useState } from 'react'
import { noop } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import { Box } from '@mui/system'
import { Button, Typography, useTheme } from '@mui/material'
import { Icons } from '@masknet/icons'
import { FormattedBalance, FormattedCurrency } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import {
    useChainContext,
    useChainIdSupport,
    useGasLimitRange,
    useGasOptions,
    useNativeToken,
    useNativeTokenAddress,
    useNativeTokenPrice,
} from '@masknet/web3-hooks-base'
import { GasOptionType, ZERO, formatBalance, formatCurrency, scale10, toFixed } from '@masknet/web3-shared-base'
import { type GasConfig, type ChainId, formatWeiToEther } from '@masknet/web3-shared-evm'
import { useGasOptionsMenu } from '../../hooks/index.js'
import { Trans } from '@lingui/react/macro'

interface GasSettingMenuProps {
    defaultGasLimit: string | undefined
    defaultGasConfig?: GasConfig
    defaultChainId?: ChainId
    disable?: boolean
    onChange?: (config: GasConfig) => void
}

export const GasSettingMenu = memo<GasSettingMenuProps>(function GasSettingMenu({
    defaultGasLimit,
    defaultChainId,
    defaultGasConfig,
    disable,
    onChange,
}) {
    const theme = useTheme()

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: defaultChainId })

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

    const [menu, openMenu] = useGasOptionsMenu(gasLimit, disable ? noop : handleChange)

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

    const { data: token } = useNativeToken(NetworkPluginID.PLUGIN_EVM, { chainId })

    const { data: tokenPrice } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })

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
        return toFixed(maxPriceUsed, 0)
    }, [gasConfig, gasLimit])

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14, mr: 0.5 }}>
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
            {disable ? null : (
                <Button
                    variant="text"
                    sx={{
                        py: 0.5,
                        px: 1.5,
                        border: `1px solid ${theme.vars.palette.maskColor.line}`,
                        borderRadius: 99,
                        display: 'inline-flex',
                        alignItems: 'center',
                        columnGap: 0.5,
                    }}
                    onClick={openMenu}>
                    <Typography sx={{ fontWeight: 700, lineHeight: '18px', fontSize: 14 }}>{gasOptionName}</Typography>
                    <Icons.Candle size={12} />
                </Button>
            )}
            {menu}
        </Box>
    )
})
