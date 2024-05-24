import { useState } from 'react'
import { type InjectedDialogProps } from '@masknet/shared'
import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { DonateDialog } from './DonateDialog.js'
import type { GitcoinGrant } from '../../../apis/index.js'

export interface DonateModalOpenProps extends Omit<InjectedDialogProps, 'open'> {
    grant: GitcoinGrant
}

export function DonateModal({ ref }: SingletonModalProps<DonateModalOpenProps>) {
    const [props_, setProps_] = useState<DonateModalOpenProps>()

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setProps_(props)
        },
    })

    if (!open || !props_?.grant) return null
    return <DonateDialog open onClose={() => dispatch?.close()} {...props_} grant={props_.grant} />
}
