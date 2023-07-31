import { GasOptionType } from '@masknet/web3-shared-base'
import type { GasConfig } from '@masknet/web3-shared-evm'
import { Typography, useTheme } from '@mui/material'
import { Box } from '@mui/system'
import { memo, useCallback, useMemo, useState } from 'react'
import { useGasOptionsMenu } from '../../hook/useGasOptionsMenu.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { Icons } from '@masknet/icons'

interface GasSettingMenuProps {
    gas: string
    onChange?: (config: GasConfig) => void
}

export const GasSettingMenu = memo<GasSettingMenuProps>(function GasSettingMenu({ gas, onChange }) {
    const { t } = useI18N()
    const theme = useTheme()
    const [gasOptionType, setGasOptionType] = useState<GasOptionType | undefined>()

    const handleChange = useCallback(
        (config: GasConfig, type?: GasOptionType) => {
            if (type) setGasOptionType(type)
            onChange?.(config)
        },
        [onChange],
    )

    const [menu, openMenu] = useGasOptionsMenu(gas, handleChange)

    const gasOptionName = useMemo(() => {
        switch (gasOptionType) {
            case GasOptionType.FAST:
                return t('popups_wallet_gas_fee_settings_instant')
            case GasOptionType.NORMAL:
                return t('popups_wallet_gas_fee_settings_high')
            case GasOptionType.SLOW:
            default:
                return t('popups_wallet_gas_fee_settings_medium')
        }
    }, [gasOptionType])

    return (
        <>
            <Box
                py={0.5}
                px={1.5}
                border={`1px solid ${theme.palette.maskColor.line}`}
                onClick={openMenu}
                borderRadius={99}
                display="inline-flex"
                alignItems="center"
                columnGap={0.5}>
                <Typography fontWeight={700} lineHeight="18px" fontSize={14}>
                    {gasOptionName}
                </Typography>
                <Icons.Candle size={12} />
            </Box>
            {menu}
        </>
    )
})
