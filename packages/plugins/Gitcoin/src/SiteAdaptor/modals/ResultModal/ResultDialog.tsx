import { InjectedDialog, type InjectedDialogProps, TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { Button, DialogActions, DialogContent, Typography } from '@mui/material'
import type { PropsWithChildren } from 'react'
import { useGitcoinTrans } from '../../../locales/index.js'

const useStyles = makeStyles()((theme) => ({
    resultDialog: {
        width: 420,
        height: 420,
        backgroundImage: 'none',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        justifyItems: 'center',
        alignItems: 'center',
        padding: theme.spacing(4, 3, 3),
        boxSizing: 'border-box',
        color: theme.palette.text.primary,
        textAlign: 'center',
        fontSize: 18,
    },
    actions: {
        padding: theme.spacing(0, 3, 3),
    },
    amount: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: theme.spacing(1),
    },
    messageText: {
        fontSize: 16,
        color: theme.palette.maskColor.second,
        lineHeight: '30px',
        fontWeight: 'bold',
    },
}))

interface ResultDialogProps extends PropsWithChildren<InjectedDialogProps> {
    token?: FungibleToken<ChainId, SchemaType>
    uiAmount: string
    confirmLabel?: string
    onShare?(): void
}

export function ResultDialog({
    className,
    confirmLabel,
    children,
    uiAmount,
    token,
    onClose,
    onShare,
    ...rest
}: ResultDialogProps) {
    const { classes } = useStyles()
    const t = useGitcoinTrans()
    return (
        <InjectedDialog
            title={t.donate()}
            classes={{
                paper: classes.resultDialog,
            }}
            BackdropProps={{
                style: {
                    opacity: 0,
                },
            }}
            {...rest}>
            <DialogContent className={classes.content}>
                <TokenIcon address={token?.address || ''} chainId={token?.chainId} size={90} />
                <Typography className={classes.amount}>
                    {uiAmount} {token?.symbol}
                </Typography>
                <Typography className={classes.messageText} mt="41px">
                    {t.donate_successfully({
                        uiAmount,
                        symbol: token?.symbol || '',
                    })}
                </Typography>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button
                    fullWidth
                    onClick={() => {
                        onShare?.()
                        onClose?.()
                    }}>
                    {confirmLabel || t.share()}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
