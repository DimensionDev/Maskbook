import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { InjectedDialog, type InjectedDialogProps, TokenIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { TokenType } from '@masknet/web3-shared-base'
import { Box, Button, DialogActions, DialogContent, Typography } from '@mui/material'
import type React from 'react'
import type { PropsWithChildren } from 'react'

const useStyles = makeStyles()((theme) => ({
    confirmDialog: {
        width: 420,
        height: 420,
        backgroundImage: 'none',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        justifyItems: 'center',
        padding: theme.spacing(3),
        boxSizing: 'border-box',
        color: theme.vars.palette.text.primary,
        textAlign: 'center',
        fontSize: 18,
    },

    congratulation: {
        fontWeight: 700,
        fontSize: '20px',
        lineHeight: '24px',
        color: theme.vars.palette.maskColor.success,
    },
    actions: {
        padding: theme.spacing(0, 3, 3),
    },
    messageText: {
        fontSize: 16,
        color: theme.vars.palette.maskColor.main,
        fontWeight: 700,
        lineHeight: '20px',
    },
    tokenIcon: {
        margin: 'auto',
        border: `1px ${theme.vars.palette.maskColor.secondaryLine} solid`,
        borderRadius: '50%',
    },
    icon: {
        filter: 'drop-shadow(0px 6px 12px rgba(61, 194, 51, 0.20))',
        backdropFilter: 'blur(8px)',
    },
}))

export interface TokenTransactionConfirmModalProps extends PropsWithChildren<InjectedDialogProps> {
    token?: Web3Helper.FungibleTokenAll | null
    nonFungibleTokenId?: string | null
    nonFungibleTokenAddress?: string
    tokenType: TokenType
    messageTextForNFT?: string
    messageTextForFT?: string
    confirmText?: React.ReactNode
    onConfirm?(): void
}

export function TokenTransactionConfirmModal({
    confirmText = 'Confirm',
    onConfirm,
    messageTextForFT,
    token,
    onClose,
    ...rest
}: TokenTransactionConfirmModalProps) {
    const { classes } = useStyles()
    return (
        <InjectedDialog
            classes={{
                paper: classes.confirmDialog,
            }}
            slotProps={{
                backdrop: {
                    style: { opacity: 0 },
                },
            }}
            titleBarIconStyle="close"
            onClose={onClose}
            {...rest}>
            <DialogContent className={classes.content}>
                <Box>
                    {token ?
                        <TokenIcon
                            className={classes.tokenIcon}
                            address={token.address}
                            logoURL={token.logoURL}
                            name={token.symbol ?? token.name}
                            pluginID={token.runtime}
                            chainId={token.chainId}
                            badgeSize={20}
                            size={90}
                        />
                    :   <Icons.FillSuccess className={classes.icon} size={90} />}
                    <Typography className={classes.congratulation} sx={{ mt: '19.5px' }}>
                        <Trans>Congratulations!</Trans>
                    </Typography>
                    <Typography className={classes.messageText} sx={{ mt: '41px' }}>
                        {messageTextForFT}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button fullWidth onClick={onConfirm}>
                    {confirmText}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
