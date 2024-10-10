import { InjectedDialog, type InjectedDialogProps } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { ScopedDomainsContainer, useReverseAddress } from '@masknet/web3-hooks-base'
import { EVMUtils } from '@masknet/web3-providers'
import { DialogContent } from '@mui/material'
import { useMemo, type PropsWithChildren } from 'react'
import type { FeedCardProps } from '../../components/base.js'
import { FeedCard } from '../../components/index.js'
import { FeedOwnerContext, type FeedOwnerOptions } from '../../contexts/index.js'
import { TxDetails } from './TxDetails.js'
import { Trans } from '@lingui/macro'

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
    details: {
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        scrollbarWidth: 'none',
        '::-webkit-scrollbar': {
            display: 'none',
        },
        '::-webkit-scrollbar-thumb': {},
    },
    card: {
        flexGrow: 1,
    },
}))

interface FeedDetailsDialogProps
    extends PropsWithChildren<InjectedDialogProps>,
        Pick<FeedCardProps, 'feed' | 'actionIndex'> {}

export function FeedDetailsDialog({ feed, onClose, actionIndex, ...rest }: FeedDetailsDialogProps) {
    const { classes } = useStyles()

    const address = feed.owner || feed.from || feed.actions[0].from || ''
    const { data: reversedName } = useReverseAddress(undefined, address)
    const { getDomain } = ScopedDomainsContainer.useContainer()

    const name = address ? getDomain(address) || reversedName : reversedName
    const feedOwner = useMemo((): FeedOwnerOptions => {
        return {
            address,
            name,
            ownerDisplay: name ? EVMUtils.formatDomainName(name) : EVMUtils.formatAddress(feed.owner, 4) ?? address,
        }
    }, [address, name, EVMUtils.formatDomainName, EVMUtils.formatAddress, feed.owner])

    return (
        <FeedOwnerContext value={feedOwner}>
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
                    <div className={classes.details}>
                        <FeedCard className={classes.card} feed={feed} actionIndex={actionIndex} verbose />
                        <TxDetails feed={feed} />
                    </div>
                </DialogContent>
            </InjectedDialog>
        </FeedOwnerContext>
    )
}
