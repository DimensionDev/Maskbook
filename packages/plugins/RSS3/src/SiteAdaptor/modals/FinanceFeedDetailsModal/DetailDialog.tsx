import { Trans } from '@lingui/react/macro'
import { InjectedDialog, type InjectedDialogProps } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { ScopedDomainsContainer } from '@masknet/web3-hooks-base'
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

export interface FeedDetailsDialogProps
    extends PropsWithChildren<InjectedDialogProps>,
        Pick<FinanceFeedProps, 'transaction'> {
    scopedDomainsMap: Record<string, string>
}

export function FinanceFeedDetailsDialog({ transaction, onClose, scopedDomainsMap, ...rest }: FeedDetailsDialogProps) {
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
                <ScopedDomainsContainer.Provider initialState={scopedDomainsMap}>
                    <FinanceFeed transaction={transaction} verbose />
                    <TxDetails transaction={transaction} />
                </ScopedDomainsContainer.Provider>
            </DialogContent>
        </InjectedDialog>
    )
}
