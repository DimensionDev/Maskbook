import { forwardRef, useState, type PropsWithChildren } from 'react'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal, type InjectedDialogProps } from '@masknet/shared'
import type { FeedCardProps } from '../../components/base.js'
import { CardType } from '../../components/share.js'
import { FeedDetailsDialog } from './DetailDialog.js'

export interface FeedDetailsModalOpenProps
    extends Omit<PropsWithChildren<InjectedDialogProps>, 'open'>,
        Pick<FeedCardProps, 'feed' | 'actionIndex'> {
    type: CardType
}

export interface FeedDetailsModalProps {}

export const FeedDetailsModal = forwardRef<SingletonModalRefCreator<FeedDetailsModalOpenProps>, FeedDetailsModalProps>(
    (props, ref) => {
        const [props_, setProps_] = useState<FeedDetailsModalOpenProps>()

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setProps_(props)
            },
        })

        if (!open) return null
        return (
            <FeedDetailsDialog
                open
                onClose={() => dispatch?.close()}
                {...props_}
                type={props_?.type ?? CardType.UnknownIn}
                feed={props_?.feed!}
            />
        )
    },
)
