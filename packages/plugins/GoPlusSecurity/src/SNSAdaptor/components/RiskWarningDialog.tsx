import { Icons } from '@masknet/icons'
import { InjectedDialog, useSnackbarCallback } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { ChainId, explorerResolver, formatEthereumAddress, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { Button, DialogActions, DialogContent, Link, Stack, Typography } from '@mui/material'
import { useCallback, useState } from 'react'
import { Copy, ExternalLink } from 'react-feather'
import { useCopyToClipboard } from 'react-use'
import { useI18N } from '../../locales/index.js'
import { PluginGoPlusSecurityMessages } from '../../messages.js'

const useStyles = makeStyles()((theme) => ({
    paper: {
        width: 420,
        maxHeight: 620,
    },
    content: {
        paddingLeft: 16,
        paddingRight: 16,
        minHeight: 492,
        boxSizing: 'border-box',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    warningTitle: {
        marginTop: '22px',
        color: theme.palette.maskColor.danger,
        fontSize: '24px',
        fontWeight: '600',
    },
    tokenInfo: {
        marginTop: '16px',
        backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#1c1c1c',
        borderRadius: '8px',
        padding: '12px',
    },
    link: {
        color: theme.palette.text.primary,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        marginLeft: '4px',
    },
    actions: {
        padding: '16px',
        boxShadow:
            theme.palette.mode === 'light'
                ? '0px 0px 20px rgba(0, 0, 0, 0.05)'
                : '0px 0px 20px rgba(255, 255, 255, 0.12)',
        justifyContent: 'space-between',
        flexGrow: 1,
    },
    warningButton: {
        width: '48%',
        backgroundColor: '#ff3545',
        color: '#fff',
        '&:hover': { backgroundColor: '#ff3545', color: '#fff' },
    },
}))

interface Token {
    contract: string
    name: string
    chainId: ChainId
}

export function RiskWarningDialog() {
    const t = useI18N()
    const { classes } = useStyles()
    const [token, setToken] = useState<Token>()

    const { open, setDialog: setRiskWarningDialog } = useRemoteControlledDialog(
        PluginGoPlusSecurityMessages.tokenRiskWarningDialogEvent,
        (env) => {
            if (!env.open) return
            setToken(env.token)
        },
    )

    const [, copyToClipboard] = useCopyToClipboard()
    const onCopy = useSnackbarCallback(
        async (ev: React.MouseEvent<HTMLAnchorElement>) => {
            ev.stopPropagation()
            copyToClipboard(token?.contract ?? '')
        },
        [],
        undefined,
        undefined,
        undefined,
        t.copy_success_of_token_addr(),
    )

    const onClose = useCallback(async () => {
        setRiskWarningDialog({ open: false, swap: false })
    }, [setRiskWarningDialog])

    const onConfirm = useCallback(async () => {
        setRiskWarningDialog({ open: false, swap: true })
    }, [setRiskWarningDialog])

    return (
        <InjectedDialog
            open={open}
            onClose={onClose}
            classes={{ paper: classes.paper }}
            maxWidth="xs"
            fullWidth
            title={t.swap_risk()}>
            <DialogContent className={classes.content}>
                <Stack alignItems="center">
                    <Icons.SecurityRisk size={68} />
                    <Typography className={classes.warningTitle}>{t.risk_warning_short()}</Typography>
                </Stack>
                <Stack marginTop="51px">
                    <Typography color={(theme) => theme.palette.maskColor.danger}>{t.dear_user()}</Typography>
                    <Typography color={(theme) => theme.palette.maskColor.danger} marginTop="16px">
                        {t.user_warning()}
                    </Typography>
                </Stack>
                <Stack className={classes.tokenInfo}>
                    <Typography>{token?.name ?? '--'}</Typography>
                    <Stack direction="row">
                        <Typography>{token?.contract ? formatEthereumAddress(token?.contract, 4) : '--'}</Typography>
                        <Link
                            className={classes.link}
                            underline="none"
                            component="button"
                            title={t.wallet_status_button_copy_address()}
                            onClick={onCopy}>
                            <Copy size={14} />
                        </Link>
                        <Link
                            className={classes.link}
                            href={
                                explorerResolver.fungibleTokenLink?.(
                                    token?.chainId ?? ChainId.Mainnet,
                                    token?.contract ?? ZERO_ADDRESS,
                                ) ?? ''
                            }
                            target="_blank"
                            title={t.view_on_explorer()}
                            rel="noopener noreferrer">
                            <ExternalLink size={14} />
                        </Link>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button sx={{ width: '48%' }} onClick={onClose}>
                    {t.cancel()}
                </Button>
                <Button className={classes.warningButton} onClick={onConfirm}>
                    {t.make_risk_trade()}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
