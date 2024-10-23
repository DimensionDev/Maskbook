import { Icons } from '@masknet/icons'
import { type NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { type ChainId } from '@masknet/web3-shared-evm'
import { Box, Typography, type BoxProps } from '@mui/material'
import { memo } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import urlcat from 'urlcat'
import { useMaskSharedTrans } from '../../../../../shared-ui/index.js'

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
            backdropFilter: 'blur(5px)',
            cursor: 'pointer',
            transition: 'transform 0.1s ease',
            '&:hover': {
                transform: 'scale(1.03)',
            },
            '&:active': {
                transform: 'scale(0.97)',
            },
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
    const t = useMaskSharedTrans()
    const navigate = useNavigate()
    const location = useLocation()

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
                <Typography className={classes.label}>{t.wallet_send()}</Typography>
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
                <Typography className={classes.label}>{t.wallet_receive()}</Typography>
            </button>
            <button
                type="button"
                className={classes.button}
                onClick={() => {
                    const url = urlcat(PopupRoutes.Trader, {
                        toAddress: asset?.address,
                        toChainId: asset?.chainId,
                    })
                    navigate(url)
                }}>
                <Icons.Cached size={20} color={theme.palette.maskColor.main} />
                <Typography className={classes.label}>{t.wallet_swap()}</Typography>
            </button>
        </Box>
    )
})
