import { type InjectedDialogProps } from '@masknet/shared'
import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { useState, type PropsWithChildren } from 'react'
import type { SocialFeedProps } from '../../SocialFeeds/SocialFeed.js'
import { SocialFeedDetailsDialog } from './DetailDialog.js'

export interface SocialFeedDetailsModalOpenProps
    extends Omit<PropsWithChildren<InjectedDialogProps>, 'open'>,
        Pick<SocialFeedProps, 'post'> {}

export function SocialFeedDetailsModal({ ref }: SingletonModalProps<SocialFeedDetailsModalOpenProps>) {
    const [dialogProps, setDialogProps] = useState<SocialFeedDetailsModalOpenProps>()
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen({ ...props }) {
            setDialogProps(props)
        },
    })

    if (!open) return null
    return (
        <SocialFeedDetailsDialog
            key={dialogProps?.post.postId}
            open
            {...dialogProps}
            onClose={() => dispatch?.close()}
            post={dialogProps!.post!}
        />
    )
}

SocialFeedDetailsModal.displayName = 'SocialFeedDetailsModal'
