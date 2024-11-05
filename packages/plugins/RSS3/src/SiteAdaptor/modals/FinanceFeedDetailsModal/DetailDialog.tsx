import { Trans } from '@lingui/macro'
import { InjectedDialog, type InjectedDialogProps } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { type PropsWithChildren } from 'react'
import { FinanceFeed, type FinanceFeedProps } from '../../FinanceFeeds/FinanceFeed.js'
import { TxDetails } from './TxDetails.js'

const useStyles = makeStyles()((theme) => ({
    detailsDialog: {
        width: 600,
        minHeight: 400,
        maxHeight: 620,
        backgroundImage: 'none',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: theme.spacing(3),
    },
}))

interface FeedDetailsDialogProps
    extends PropsWithChildren<InjectedDialogProps>,
        Pick<FinanceFeedProps, 'transaction'> {}

export function FinanceFeedDetailsDialog({ transaction, onClose, ...rest }: FeedDetailsDialogProps) {
    const { classes } = useStyles()

    return (
        <InjectedDialog
            classes={{
                paper: classes.detailsDialog,
            }}
            {...rest}
            title={<Trans>Details</Trans>}
            onClose={() => {
                onClose?.()
            }}>
            <DialogContent className={classes.content}>
                <FinanceFeed transaction={transaction} verbose />
                <TxDetails transaction={transaction} />
            </DialogContent>
        </InjectedDialog>
    )
}
