import type { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useFungibleToken, useMaskTokenAddress, useNativeToken } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { MenuItem, Radio as MuiRadio, RadioProps, Typography } from '@mui/material'
import { useUpdateEffect } from '@react-hookz/web'
import { compact } from 'lodash-es'
import { useEffect, useState } from 'react'
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
    initialCurrencyAddress?: string,
    // TODO: remove this after override popups theme
    Radio: React.ComponentType<RadioProps> = MuiRadio,
) {
    const { classes } = useStyles()
    const [current, setCurrent] = useState(initialCurrencyAddress)
    const { value: nativeToken } = useNativeToken(pluginId)
    const maskAddress = useMaskTokenAddress(pluginId)
    const { value: maskToken } = useFungibleToken(pluginId, maskAddress)

    useUpdateEffect(() => {
        setCurrent((prev) => {
            if (!prev && nativeToken?.address) return nativeToken.address
            return prev
        })
    }, [nativeToken])

    useEffect(() => {
        if (!current || !onCurrencyChange) return
        onCurrencyChange(current)
    }, [current, onCurrencyChange])
    return useMenuConfig(
        compact([
            nativeToken ? (
                <MenuItem className={classes.item} onClick={() => setCurrent(nativeToken.address)}>
                    <Typography className={classes.token}>
                        <TokenIcon {...nativeToken} size={30} />
                        {nativeToken.symbol}
                    </Typography>
                    <Radio checked={isSameAddress(current, nativeToken.address)} />
                </MenuItem>
            ) : null,
            maskToken ? (
                <MenuItem className={classes.item} onClick={() => setCurrent(maskToken.address)}>
                    <Typography className={classes.token}>
                        <TokenIcon {...maskToken} size={30} />
                        {maskToken.symbol}
                    </Typography>
                    <Radio checked={isSameAddress(current, maskAddress)} />
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
