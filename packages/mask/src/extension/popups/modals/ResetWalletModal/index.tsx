import { forwardRef } from 'react'
import { type SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { ResetWalletDialog } from './ResetWalletDialog.js'

export interface ResetWalletModalOpenProps {}

export interface ResetWalletModalProps {}

export const ResetWalletModal = forwardRef<SingletonModalRefCreator<ResetWalletModalOpenProps>, ResetWalletModalProps>(
    (props, ref) => {
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {},
        })
        return <ResetWalletDialog open={open} onClose={() => dispatch?.close()} />
    },
)
