import { SecurityRiskIcon } from '@masknet/icons'
import { InjectedDialog, TokenSecurity, useSnackbarCallback } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { explorerResolver, formatEthereumAddress, ZERO_ADDRESS } from '@masknet/web3-shared-evm'

import { Button, DialogActions, DialogContent, Link, Stack, Typography } from '@mui/material'
import { Copy, ExternalLink } from 'react-feather'
import { useCopyToClipboard } from 'react-use'
import { useI18N } from '../../../../utils'

const useStyles = makeStyles()((theme) => ({
    content: {
        marginLeft: 12,
        marginRight: 12,
        paddingLeft: 0,
        paddingRight: 0,
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

export interface RiskWarningDialogProps {
    open: boolean
    onConfirm: () => void
    onClose?: () => void
    tokenInfo: TokenSecurity
}

export function RiskWarningDialog(props: RiskWarningDialogProps) {
    const { t } = useI18N()
    const { open, onConfirm, onClose, tokenInfo } = props
    const { classes } = useStyles()
    const [, copyToClipboard] = useCopyToClipboard()
    const onCopy = useSnackbarCallback(
        async (ev: React.MouseEvent<HTMLAnchorElement>) => {
            ev.stopPropagation()
            copyToClipboard(tokenInfo?.contract ?? '')
        },
        [],
        undefined,
        undefined,
        undefined,
        t('copy_success_of_token_addr'),
    )
    return (
        <InjectedDialog
            open={open}
            onClose={onClose}
            classes={{ dialogContent: classes.content }}
            maxWidth="xs"
            fullWidth
            title={t('plugin_trader_swap_risk')}>
            <DialogContent className={classes.content}>
                <Stack alignItems="center">
                    <SecurityRiskIcon sx={{ fontSize: '68px' }} />
                    <Typography className={classes.warningTitle}>{t('plugin_trader_risk_warning_short')}</Typography>
                </Stack>
                <Stack marginTop="51px">
                    <Typography color={(theme) => theme.palette.maskColor.danger}>
                        {t('plugin_trader_dear_user')}
                    </Typography>
                    <Typography color={(theme) => theme.palette.maskColor.danger} marginTop="16px">
                        {t('plugin_trader_user_warning')}
                    </Typography>
                </Stack>
                <Stack className={classes.tokenInfo}>
                    <Typography>{tokenInfo?.token_name ?? '--'}</Typography>
                    <Stack direction="row">
                        <Typography>
                            {tokenInfo.contract ? formatEthereumAddress(tokenInfo?.contract, 4) : '--'}
                        </Typography>
                        <Link
                            className={classes.link}
                            underline="none"
                            component="button"
                            title={t('wallet_status_button_copy_address')}
                            onClick={onCopy}>
                            <Copy size={14} />
                        </Link>
                        <Link
                            className={classes.link}
                            href={
                                explorerResolver.fungibleTokenLink?.(
                                    tokenInfo?.chainId ?? 1,
                                    tokenInfo?.contract ?? ZERO_ADDRESS,
                                ) ?? ''
                            }
                            target="_blank"
                            title={t('plugin_wallet_view_on_explorer')}
                            rel="noopener noreferrer">
                            <ExternalLink size={14} />
                        </Link>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button sx={{ width: '48%' }} onClick={onClose}>
                    {t('cancel')}
                </Button>
                <Button className={classes.warningButton} onClick={onConfirm}>
                    {t('plugin_trader_make_risk_trade')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
