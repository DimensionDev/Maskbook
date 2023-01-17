import type { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useFungibleToken, useMaskTokenAddress, useNativeToken } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { MenuItem, Radio as MuiRadio, RadioProps, Typography } from '@mui/material'
import { compact } from 'lodash-es'
import { useCallback, useState } from 'react'
import { TokenIcon } from '../index.js'
import { useMenuConfig } from './useMenu.js'

const useStyles = makeStyles()((theme) => ({
    paper: {
        minWidth: 240,
        background: theme.palette.maskColor.bottom,
    },
    item: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    token: {
        display: 'flex',
        alignItems: 'center',
        columnGap: 4,
        fontSize: 16,
        fontWeight: 700,
        lineHeight: '20px',
    },
}))

export function useGasCurrencyMenu(
    pluginId?: NetworkPluginID,
    onCurrencyChange?: (address: string) => void,
    selectedAddress?: string,
    // TODO: remove this after override popups theme
    Radio: React.ComponentType<RadioProps> = MuiRadio,
) {
    const { classes } = useStyles()
    const [current, setCurrent] = useState('')
    const { value: nativeToken } = useNativeToken(pluginId)
    const maskAddress = useMaskTokenAddress(pluginId)
    const { value: maskToken } = useFungibleToken(pluginId, maskAddress)

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
            nativeToken ? (
                <MenuItem className={classes.item} onClick={() => handleChange(nativeToken.address)}>
                    <Typography className={classes.token}>
                        <TokenIcon {...nativeToken} size={30} />
                        {nativeToken.symbol}
                    </Typography>
                    <Radio checked={isSameAddress(selected, nativeToken.address)} />
                </MenuItem>
            ) : null,
            maskToken ? (
                <MenuItem className={classes.item} onClick={() => handleChange(maskToken.address)}>
                    <Typography className={classes.token}>
                        <TokenIcon {...maskToken} size={30} />
                        {maskToken.symbol}
                    </Typography>
                    <Radio checked={isSameAddress(selected, maskAddress)} />
                </MenuItem>
            ) : null,
        ]),
        {
            classes: {
                paper: classes.paper,
            },
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'center',
            },
            transformOrigin: {
                vertical: 'top',
                horizontal: 'right',
            },
        },
    )
}
