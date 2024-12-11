import { type ImageEditorProps } from './ImageEditor.js'
import type { SingletonModalProps } from '@masknet/shared-base'
import { ImageEditor } from './ImageEditor.js'
import { useState } from 'react'
import { useSingletonModal } from '@masknet/shared-base-ui'

export type ImageEditorModalOpenProps = Omit<ImageEditorProps, 'open'>
export type ImageEditorModalCloseProps = Blob | null

export function ImageEditorModal({ ref }: SingletonModalProps<ImageEditorModalOpenProps, ImageEditorModalCloseProps>) {
    const [props, setProps] = useState<ImageEditorModalOpenProps>()

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(p) {
            setProps(p)
        },
    })
    if (!open || !props) return null

    return <ImageEditor open {...props} onClose={() => dispatch?.close(null)} onSave={dispatch?.close} />
}
