import { forwardRef, useState, type ReactNode } from 'react'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { DisconnectDialog } from './DisconnectDialog.js'

export interface DisconnectModalOpenProps {
    title: string
    tips: ReactNode
}

export interface DisconnectModalProps {}
export type DisconnectModalCloseProps =
    | {
          confirmed?: boolean
      }
    | undefined

export const DisconnectModal = forwardRef<
    SingletonModalRefCreator<DisconnectModalOpenProps, DisconnectModalCloseProps>
>((props, ref) => {
    const [title, setTitle] = useState('')
    const [tips, setTips] = useState<ReactNode>()
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setTips(props.tips)
            setTitle(props.title)
        },
    })

    return (
        <DisconnectDialog
            open={open}
            onClose={(confirmed) => dispatch?.close({ confirmed })}
            title={title}
            tips={tips}
        />
    )
})
