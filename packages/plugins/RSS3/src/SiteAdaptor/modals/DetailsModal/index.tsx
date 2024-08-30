import { forwardRef, useState, type PropsWithChildren } from 'react'
import { type InjectedDialogProps } from '@masknet/shared'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import type { FeedCardProps } from '../../components/base.js'
import { FeedDetailsDialog } from './DetailDialog.js'
import { ScopedDomainsContainer } from '@masknet/web3-hooks-base'

export interface FeedDetailsModalOpenProps
    extends Omit<PropsWithChildren<InjectedDialogProps>, 'open'>,
        Pick<FeedCardProps, 'feed' | 'actionIndex'> {
    scopedDomainsMap: Record<string, string>
}

export const FeedDetailsModal = forwardRef<SingletonModalRefCreator<FeedDetailsModalOpenProps>>((props, ref) => {
    const [dialogProps, setDialogProps] = useState<Omit<FeedDetailsModalOpenProps, 'scopedDomainsMap'>>()
    const [scopedDomainsMap, setScopedDomainsMap] = useState<Record<string, string>>({})
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen({ scopedDomainsMap, ...props }) {
            setDialogProps(props)
            setScopedDomainsMap(scopedDomainsMap)
        },
    })

    if (!open) return null
    return (
        <ScopedDomainsContainer.Provider initialState={scopedDomainsMap}>
            <FeedDetailsDialog
                key={dialogProps?.feed.id}
                open
                onClose={() => dispatch?.close()}
                {...dialogProps}
                feed={dialogProps?.feed!}
            />
        </ScopedDomainsContainer.Provider>
    )
})

FeedDetailsModal.displayName = 'FeedDetailsModal'
