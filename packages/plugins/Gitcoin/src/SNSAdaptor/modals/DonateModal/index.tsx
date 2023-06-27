import { forwardRef, useState } from 'react'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal, type InjectedDialogProps } from '@masknet/shared'
import { DonateDialog } from './DonateDialog.js'
import type { GitcoinGrant } from '../../../apis/index.js'

export interface DonateModalOpenProps extends Omit<InjectedDialogProps, 'open'> {
    grant: GitcoinGrant
}

export interface DonateModalProps {}

export const DonateModal = forwardRef<SingletonModalRefCreator<DonateModalOpenProps>, DonateModalProps>(
    (props, ref) => {
        const [props_, setProps_] = useState<DonateModalOpenProps>()

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setProps_(props)
            },
        })

        if (!open || !props_?.grant) return null
        return <DonateDialog open onClose={() => dispatch?.close()} {...props_} grant={props_?.grant} />
    },
)
