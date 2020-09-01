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
import { EthereumTokenType, ERC20TokenRecord } from '../../Wallet/database/types'
import ShadowRootDialog from '../../../utils/jss/ShadowRootDialog'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { getActivatedUI } from '../../../social-network/ui'
import type { ERC20TokenDetails } from '../../../extension/background-script/PluginService'
import { useI18N } from '../../../utils/i18n-next-ui'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            [`@media (min-width: ${theme.breakpoints.width('md')}px)`]: {
                width: 340,
                margin: '0 auto',
            },
        },
        content: {
            wordBreak: 'break-word',
        },
    }),
)

interface GitcoinDialogProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    message?: string
    open: boolean
    onClose(): void
}

//#region donate success dialog
export interface DonateSuccessDialogProps extends GitcoinDialogProps {
    title: string
    url: string
    amount: number
    token: ERC20TokenDetails | null
    tokenType: EthereumTokenType
}

export function DonateSuccessDialog(props: DonateSuccessDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { title, url, amount, token, tokenType, open, onClose } = props
    const ui = getActivatedUI()

    const onShare = () => {
        onClose()
        const text = [
            `I donated ${amount} ${
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
            fullScreen={false}
            onClose={onClose}>
            <DialogTitle>Donated Successfully</DialogTitle>
            <DialogContent>
                <DialogContentText className={classes.content}>{`You have donated "${title}" ${
                    tokenType === EthereumTokenType.ETH ? 'ETH' : token?.symbol
                } ${amount}.`}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
                {ui.internalName === 'twitter' ? (
                    <Button onClick={onShare} color="primary" autoFocus>
                        {t('share')}
                    </Button>
                ) : null}
            </DialogActions>
        </ShadowRootDialog>
    )
}
//#endregion

//#region donate fail dialog
export interface DonateFailDialogProps extends GitcoinDialogProps {}

export function DonateFailDialog(props: DonateFailDialogProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { message, open, onClose } = props
    return (
        <ShadowRootDialog
            classes={{
                container: classes.container,
            }}
            open={open}
            fullScreen={false}
            onClose={onClose}>
            <DialogTitle>Donated Failed</DialogTitle>
            <DialogContent>
                <DialogContentText className={classes.content}>{message}</DialogContentText>
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
