import React from 'react'
import {
    makeStyles,
    Theme,
    createStyles,
    Button,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
} from '@material-ui/core'
import ShadowRootDialog from '../../../utils/jss/ShadowRootDialog'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { getActivatedUI } from '../../../social-network/ui'
import { EthereumTokenType } from '../../Wallet/database/types'
import type { ERC20TokenDetails } from '../../../extension/background-script/PluginService'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            [`@media (min-width: ${theme.breakpoints.width('md')}px)`]: {
                width: 340,
                margin: '0 auto',
            },
        },
    }),
)

interface TransferDialogProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    message?: string
    open: boolean
    onClose(): void
}

//#region transfer success dialog
export interface TransferSuccessDialogProps extends TransferDialogProps {
    recipient?: string
    recipientAddress: string
    amount: number
    token: ERC20TokenDetails | null
    tokenType: EthereumTokenType
}

export function TransferSuccessDialog(props: TransferSuccessDialogProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { recipient, recipientAddress, amount, token, tokenType, open, onClose } = props
    return (
        <ShadowRootDialog
            classes={{
                container: classes.container,
            }}
            open={open}
            onClose={onClose}>
            <DialogTitle>Transfer Successfully</DialogTitle>
            <DialogContent>
                <DialogContentText>{`You have transferred to "${recipient ?? recipientAddress}" ${
                    tokenType === EthereumTokenType.ETH ? 'ETH' : token?.symbol
                } ${amount}.`}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </ShadowRootDialog>
    )
}
//#endregion

//#region transfer fail dialog
export interface TransferFailDialogProps extends TransferDialogProps {}

export function TransferFailDialog(props: TransferFailDialogProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { message, open, onClose } = props
    return (
        <ShadowRootDialog
            classes={{
                container: classes.container,
            }}
            open={open}
            onClose={onClose}>
            <DialogTitle>transferred Failed</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </ShadowRootDialog>
    )
}
//#endregion
