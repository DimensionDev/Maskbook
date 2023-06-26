import { forwardRef, useState, type PropsWithChildren } from 'react'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal, type InjectedDialogProps } from '@masknet/shared'
import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { ResultDialog } from './ResultDialog.js'

export interface ResultModalOpenProps extends Omit<PropsWithChildren<InjectedDialogProps>, 'open'> {
    token: FungibleToken<ChainId, SchemaType>
    uiAmount: string
    confirmLabel?: string
    onShare?(): void
}

export interface ResultModalProps {}

export const ResultModal = forwardRef<SingletonModalRefCreator<ResultModalOpenProps>, ResultModalProps>(
    (props, ref) => {
        const [props_, setProps_] = useState<ResultModalOpenProps>()

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setProps_(props)
            },
        })

        if (!open) return null
        return (
            <ResultDialog
                open
                onClose={() => dispatch?.close()}
                {...props_}
                token={props_?.token}
                uiAmount={props_?.uiAmount || ''}
            />
        )
    },
)
