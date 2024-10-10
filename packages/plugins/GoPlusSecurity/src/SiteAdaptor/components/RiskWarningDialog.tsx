import { useCallback } from 'react'
import { ExternalLink } from 'react-feather'
import { Button, DialogActions, DialogContent, Link, Stack, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { CopyButton, InjectedDialog } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { EVMExplorerResolver } from '@masknet/web3-providers'
import { ChainId, formatEthereumAddress, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { type TokenRiskWarningDialogEvent } from '../../messages.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
            theme.palette.mode === 'light' ?
                '0px 0px 20px rgba(0, 0, 0, 0.05)'
            :   '0px 0px 20px rgba(255, 255, 255, 0.12)',
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

export interface Token {
    contract: string
    name: string
    chainId: ChainId
}

interface Props {
    token?: Token
    open: boolean
    onSetDialog(event: TokenRiskWarningDialogEvent): void
}
export function RiskWarningDialog({ open, token, onSetDialog }: Props) {
    const { _ } = useLingui()
    const { classes } = useStyles()

    const onClose = useCallback(async () => {
        onSetDialog({ open: false, swap: false })
    }, [onSetDialog])

    const onConfirm = useCallback(async () => {
        onSetDialog({ open: false, swap: true })
    }, [onSetDialog])

    return (
        <InjectedDialog
            open={open}
            onClose={onClose}
            classes={{ paper: classes.paper }}
            maxWidth="xs"
            fullWidth
            title={<Trans>Confirm swap risk</Trans>}>
            <DialogContent className={classes.content}>
                <Stack alignItems="center">
                    <Icons.SecurityRisk size={68} />
                    <Typography className={classes.warningTitle}>
                        <Trans>Risk Warning</Trans>
                    </Typography>
                </Stack>
                <Stack marginTop="51px">
                    <Trans>
                        <Typography color={(theme) => theme.palette.maskColor.danger}>Dear Users,</Typography>
                        <Typography color={(theme) => theme.palette.maskColor.danger} marginTop="16px">
                            Clicking the confirm button means that you agree to take the potential risks and proceed
                            with the transaction.
                        </Typography>
                    </Trans>
                </Stack>
                <Stack className={classes.tokenInfo}>
                    <Typography>{token?.name ?? '--'}</Typography>
                    <Stack direction="row">
                        <Typography>{token?.contract ? formatEthereumAddress(token?.contract, 4) : '--'}</Typography>
                        <CopyButton size={14} title={_(msg`Copy Address`)} text={token?.contract ?? ''} />
                        <Link
                            className={classes.link}
                            href={
                                EVMExplorerResolver.fungibleTokenLink?.(
                                    token?.chainId ?? ChainId.Mainnet,
                                    token?.contract ?? ZERO_ADDRESS,
                                ) ?? ''
                            }
                            target="_blank"
                            title={_(msg`View on Explorer`)}
                            rel="noopener noreferrer">
                            <ExternalLink size={14} />
                        </Link>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button sx={{ width: '48%' }} onClick={onClose}>
                    <Trans>Cancel</Trans>
                </Button>
                <Button className={classes.warningButton} onClick={onConfirm}>
                    <Trans>Swap Anyway</Trans>
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
