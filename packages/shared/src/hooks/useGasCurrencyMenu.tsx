import type { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, RadioIndicator } from '@masknet/theme'
import { useNativeToken } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { alpha, MenuItem, Typography } from '@mui/material'
import { compact, pick } from 'lodash-es'
import { useCallback, useState } from 'react'
import { TokenIcon } from '../index.js'
import { useMenuConfig } from './useMenu.js'

const useStyles = makeStyles()((theme) => ({
    paper: {
        minWidth: 240,
        background: theme.palette.maskColor.bottom,
        borderRadius: 16,
        boxShadow: theme.palette.maskColor.bottomBg,
        padding: theme.spacing(0.5),
    },
    item: {
        display: 'flex',
        height: 46,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 8,
        padding: theme.spacing(1),
    },
    token: {
        display: 'flex',
        alignItems: 'center',
        columnGap: 4,
        fontSize: 16,
        fontWeight: 700,
        lineHeight: '20px',
    },
    radio: {
        color: theme.palette.mode === 'dark' ? alpha(theme.palette.maskColor.line, 0.43) : theme.palette.maskColor.line,
    },
}))

export function useGasCurrencyMenu(
    pluginId?: NetworkPluginID,
    onCurrencyChange?: (address: string) => void,
    selectedAddress?: string,
    handleUnlock?: () => void,
) {
    const { classes } = useStyles()
    const [current, setCurrent] = useState('')
    const { data: nativeToken } = useNativeToken(pluginId)

    const handleChange = useCallback(
        (address: string) => {
            setCurrent(address)
            onCurrencyChange?.(address)
        },
        [onCurrencyChange],
    )

    const selected = selectedAddress || current || nativeToken?.address

    return useMenuConfig(
        compact([
            nativeToken ?
                <MenuItem className={classes.item} disableRipple onClick={() => handleChange(nativeToken.address)}>
                    <Typography className={classes.token} component="div">
                        <TokenIcon {...pick(nativeToken, 'chainId', 'address', 'symbol')} size={30} />
                        {nativeToken.symbol}
                    </Typography>
                    <RadioIndicator
                        size={20}
                        checked={isSameAddress(selected, nativeToken.address)}
                        className={classes.radio}
                    />
                </MenuItem>
            :   null,
        ]),
        {
            classes: {
                paper: classes.paper,
            },
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
            },
            transformOrigin: {
                vertical: 'top',
                horizontal: 'right',
            },
        },
    )
}
