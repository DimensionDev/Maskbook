import { Icons } from '@masknet/icons'
import { PopupRoutes, NetworkPluginID, PluginID } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { isNativeTokenAddress, type ChainId } from '@masknet/web3-shared-evm'
import { Box, Typography, type BoxProps } from '@mui/material'
import { memo, useCallback, useMemo } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import urlcat from 'urlcat'
import { useI18N } from '../../../../../../utils/index.js'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'

const useStyles = makeStyles()((theme) => {
    const isDark = theme.palette.mode === 'dark'
    return {
        container: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 16,
            paddingBottom: 16,
            gap: theme.spacing(2),
        },
        button: {
            color: theme.palette.maskColor.second,
            width: 112,
            height: theme.spacing(4.5),
            boxSizing: 'border-box',
            backgroundColor: theme.palette.maskColor.bottom,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            border: 'none',
            boxShadow: `0px 4px 6px 0px ${isDark ? 'rgba(0, 0, 0, 0.10)' : 'rgba(102, 108, 135, 0.10)'}`,
            cursor: 'pointer',
            transition: 'transform 0.1s ease',
            '&:hover': {
                transform: 'scale(1.03)',
            },
            '&:active': {
                transform: 'scale(0.97)',
            },
        },
        disabled: {
            opacity: 0.5,
            cursor: 'unset',
        },
        label: {
            color: theme.palette.maskColor.main,
            marginLeft: theme.spacing(1),
            fontWeight: 700,
            fontSize: 14,
        },
    }
})

interface Props extends BoxProps {
    chainId: ChainId
    address?: string
    asset?: Web3Helper.FungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>
}

export const ActionGroup = memo(function ActionGroup({ className, chainId, address, asset, ...rest }: Props) {
    const { classes, cx, theme } = useStyles()
    const { t } = useI18N()
    const navigate = useNavigate()
    const location = useLocation()
    const traderDefinition = useActivatedPlugin(PluginID.Trader, 'any')
    const chainIdList = traderDefinition?.enableRequirement.web3?.[NetworkPluginID.PLUGIN_EVM]?.supportedChainIds ?? []

    const disabledSwap = useMemo(() => !chainIdList.includes(chainId), [chainId, chainIdList])

    const handleSwap = useCallback(() => {
        if (disabledSwap) return
        const url = urlcat(
            'popups.html#/',
            PopupRoutes.Swap,
            isNativeTokenAddress(asset?.address)
                ? {
                      chainId: asset?.chainId,
                  }
                : {
                      id: asset?.address,
                      chainId: asset?.chainId,
                      name: asset?.name,
                      symbol: asset?.symbol,
                      contract_address: asset?.address,
                      decimals: asset?.decimals,
                  },
        )
        openWindow(browser.runtime.getURL(url), 'SWAP_DIALOG')
    }, [asset, disabledSwap])

    return (
        <Box className={cx(classes.container, className)} {...rest}>
            <button
                type="button"
                className={classes.button}
                onClick={() => {
                    const path = urlcat(PopupRoutes.Contacts, {
                        address,
                        chainId,
                        token: matchPath(PopupRoutes.TokenDetail, location.pathname) ? true : undefined,
                        undecided: address ? undefined : true,
                    })
                    navigate(path, {
                        state: { asset },
                    })
                }}>
                <Icons.Send size={20} color={theme.palette.maskColor.main} />
                <Typography className={classes.label}>{t('wallet_send')}</Typography>
            </button>
            <button
                type="button"
                className={classes.button}
                onClick={() => {
                    navigate(
                        urlcat(PopupRoutes.Receive, {
                            chainId,
                            address,
                        }),
                    )
                }}>
                <Icons.ArrowDownward size={20} color={theme.palette.maskColor.main} />
                <Typography className={classes.label}>{t('wallet_receive')}</Typography>
            </button>
            <button
                disabled={disabledSwap}
                type="button"
                className={cx(classes.button, disabledSwap ? classes.disabled : undefined)}
                onClick={handleSwap}>
                <Icons.Cached size={20} color={theme.palette.maskColor.main} />
                <Typography className={classes.label}>{t('wallet_swap')}</Typography>
            </button>
        </Box>
    )
})
