import { compact, noop, pick } from 'lodash-es'
import { useCallback, useState } from 'react'
import { Button, MenuItem, Typography, alpha } from '@mui/material'
import type { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, RadioIndicator } from '@masknet/theme'
import { formatBalance, isLessThan, isSameAddress } from '@masknet/web3-shared-base'
import { useChainContext, useFungibleToken, useMaskTokenAddress, useNativeToken } from '@masknet/web3-hooks-base'
import { useERC20TokenAllowance } from '@masknet/web3-hooks-evm'
import { useSmartPayConstants } from '@masknet/web3-shared-evm'
import { useMenuConfig } from './useMenu.js'
import { TokenIcon } from '../index.js'
import { Trans } from '@lingui/macro'

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
    const { chainId } = useChainContext()
    const [current, setCurrent] = useState('')
    const { data: nativeToken } = useNativeToken(pluginId)
    const maskAddress = useMaskTokenAddress(pluginId)
    const { data: maskToken } = useFungibleToken(pluginId, maskAddress)

    const { PAYMASTER_MASK_CONTRACT_ADDRESS } = useSmartPayConstants(chainId)
    const { data: allowance = '0' } = useERC20TokenAllowance(maskAddress, PAYMASTER_MASK_CONTRACT_ADDRESS)
    const availableBalanceTooLow = isLessThan(formatBalance(allowance, maskToken?.decimals), 0.1)

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
            maskToken ?
                <MenuItem
                    className={classes.item}
                    disableRipple
                    onClick={!availableBalanceTooLow ? () => handleChange(maskToken.address) : noop}>
                    <Typography className={classes.token} component="div">
                        <TokenIcon {...pick(maskToken, 'chainId', 'address', 'symbol')} size={30} />
                        {maskToken.symbol}
                    </Typography>
                    {availableBalanceTooLow ?
                        <Button variant="roundedContained" onClick={handleUnlock} size="small">
                            <Trans>Unlock</Trans>
                        </Button>
                    :   <RadioIndicator
                            size={20}
                            className={classes.radio}
                            checked={isSameAddress(selected, maskAddress)}
                        />
                    }
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
