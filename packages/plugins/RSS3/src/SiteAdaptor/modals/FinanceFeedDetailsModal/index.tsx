import { type InjectedDialogProps } from '@masknet/shared'
import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { useState, type PropsWithChildren } from 'react'
import { FinanceFeedDetailsDialog } from './DetailDialog.js'
import type { FinanceFeedProps } from '../../FinanceFeeds/FinanceFeed.js'
import { FeedOwnerContext, type FeedOwnerOptions } from '../../contexts/index.js'

export interface FinanceFeedDetailsModalOpenProps
    extends Omit<PropsWithChildren<InjectedDialogProps>, 'open'>,
        Pick<FinanceFeedProps, 'transaction'> {
    feedOwner: FeedOwnerOptions
    scopedDomainsMap: Record<string, string>
}

export function FinanceFeedDetailsModal({ ref }: SingletonModalProps<FinanceFeedDetailsModalOpenProps>) {
    const [dialogProps, setDialogProps] = useState<FinanceFeedDetailsModalOpenProps>()

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen({ ...props }) {
            setDialogProps(props)
        },
    })

    if (!open || !dialogProps) return null
    return (
        <FeedOwnerContext value={dialogProps.feedOwner}>
            <FinanceFeedDetailsDialog
                key={dialogProps.transaction.id}
                open
                {...dialogProps}
                onClose={() => dispatch?.close()}
                transaction={dialogProps.transaction!}
            />
        </FeedOwnerContext>
    )
}

FinanceFeedDetailsModal.displayName = 'FinanceFeedDetailsModal'
