import { forwardRef, useState, type PropsWithChildren } from 'react'
import { type InjectedDialogProps } from '@masknet/shared'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import type { FeedCardProps } from '../../components/base.js'
import { CardType } from '../../components/share.js'
import { FeedDetailsDialog } from './DetailDialog.js'
import { ScopedDomainsContainer } from '@masknet/web3-hooks-base'

export interface FeedDetailsModalOpenProps
    extends Omit<PropsWithChildren<InjectedDialogProps>, 'open'>,
        Pick<FeedCardProps, 'feed' | 'actionIndex'> {
    type: CardType
    map?: Record<string, string>
}

export interface FeedDetailsModalProps {}

export const FeedDetailsModal = forwardRef<SingletonModalRefCreator<FeedDetailsModalOpenProps>, FeedDetailsModalProps>(
    (props, ref) => {
        const [props_, setProps_] = useState<FeedDetailsModalOpenProps>()
        const [scopedDomainMap, setScopedDomainMap] = useState<Record<string, string>>()
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setProps_(props)
                setScopedDomainMap(props?.map)
            },
        })

        if (!open) return null
        return (
            <ScopedDomainsContainer.Provider initialState={{ defaultMap: scopedDomainMap ?? {} }}>
                <FeedDetailsDialog
                    open
                    onClose={() => dispatch?.close()}
                    {...props_}
                    type={props_?.type ?? CardType.UnknownIn}
                    feed={props_?.feed!}
                />
            </ScopedDomainsContainer.Provider>
        )
    },
)
