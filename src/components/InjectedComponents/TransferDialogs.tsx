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
import ShadowRootDialog from '../../utils/jss/ShadowRootDialog'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { getActivatedUI } from '../../social-network/ui'
import { EthereumTokenType } from '../../plugins/Wallet/database/types'
import type { ERC20TokenDetails } from '../../extension/background-script/PluginService'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            width: 340,
            margin: '0 auto',
        },
    }),
)

interface GitcoinDialogProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    message?: string
    open: boolean
    onClose(): void
}

//#region transfer success dialog
export interface TransferSuccessDialogProps extends GitcoinDialogProps {
    title: string
    url: string
    amount: number
    token: ERC20TokenDetails | null
    tokenType: EthereumTokenType
}

export function TransferSuccessDialog(props: TransferSuccessDialogProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { title, url, amount, token, tokenType, open, onClose } = props
    const ui = getActivatedUI()

    const onShare = () => {
        onClose()
        const text = [
            `I transfer ${amount} ${
                tokenType === EthereumTokenType.ETH ? 'ETH' : token?.symbol
            } for the campaign "${title}" on Gitcoin through #Maskbook!`,
            url,
        ]
            .filter(Boolean)
            .join('\n')
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
            '_blank',
            'noopener noreferrer',
        )
    }
    return (
        <ShadowRootDialog
            classes={{
                container: classes.container,
            }}
            open={open}
            onClose={onClose}>
            <DialogTitle>Transfer Successfully</DialogTitle>
            <DialogContent>
                <DialogContentText>{`You have transfered "${title}" ${
                    tokenType === EthereumTokenType.ETH ? 'ETH' : token?.symbol
                } ${amount}.`}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
                {ui.internalName === 'twitter' ? (
                    <Button onClick={onShare} color="primary" autoFocus>
                        Share
                    </Button>
                ) : null}
            </DialogActions>
        </ShadowRootDialog>
    )
}
//#endregion

//#region transfer fail dialog
export interface TransferFailDialogProps extends GitcoinDialogProps {}

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
            <DialogTitle>Transfered Failed</DialogTitle>
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
