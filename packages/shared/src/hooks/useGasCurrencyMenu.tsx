import { compact, noop } from 'lodash-es'
import { useCallback, useState } from 'react'
import { Button, MenuItem, Typography, Radio } from '@mui/material'
import type { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { formatBalance, isLessThan, isSameAddress } from '@masknet/web3-shared-base'
import { useChainContext, useFungibleToken, useMaskTokenAddress, useNativeToken } from '@masknet/web3-hooks-base'
import { useERC20TokenAllowance } from '@masknet/web3-hooks-evm'
import { useSmartPayConstants } from '@masknet/web3-shared-evm'
import { TokenIcon, useSharedI18N } from '../index.js'
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
    handleUnlock?: () => void,
) {
    const sharedI18N = useSharedI18N()
    const { classes } = useStyles()
    const { chainId } = useChainContext()
    const [current, setCurrent] = useState('')
    const { data: nativeToken } = useNativeToken(pluginId)
    const maskAddress = useMaskTokenAddress(pluginId)
    const { data: maskToken } = useFungibleToken(pluginId, maskAddress)

    const { PAYMASTER_MASK_CONTRACT_ADDRESS } = useSmartPayConstants(chainId)
    const { value: allowance = '0' } = useERC20TokenAllowance(maskAddress, PAYMASTER_MASK_CONTRACT_ADDRESS)
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
                <MenuItem
                    className={classes.item}
                    onClick={!availableBalanceTooLow ? () => handleChange(maskToken.address) : noop}>
                    <Typography className={classes.token}>
                        <TokenIcon {...maskToken} size={30} />
                        {maskToken.symbol}
                    </Typography>
                    {availableBalanceTooLow ? (
                        <Button variant="roundedContained" onClick={handleUnlock} size="small">
                            {sharedI18N.unlock()}
                        </Button>
                    ) : (
                        <Radio checked={isSameAddress(selected, maskAddress)} />
                    )}
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
