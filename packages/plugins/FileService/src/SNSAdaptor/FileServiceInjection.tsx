import type { CompositionType } from '@masknet/plugin-infra/content-script'
import { EMPTY_LIST } from '@masknet/shared-base'
import { memo, useEffect, useState } from 'react'
import { emitter } from './emitter.js'
import { FileServiceDialog } from './MainDialog.js'

export const FileServiceInjection = memo(function FileServiceInjection() {
    const [open, setOpen] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<string[]>([])
    const [compositionType, setCompositionType] = useState<CompositionType>('popup')
    const [selectMode, setSelectMode] = useState(false)
    useEffect(() => {
        const unsubscribe = emitter.on('open', (options) => {
            setOpen(true)
            setCompositionType(options.compositionType)
            setSelectMode(options.selectMode)
            setSelectedFiles(options.selectedFiles ?? EMPTY_LIST)
        })
        return () => {
            unsubscribe()
        }
    }, [])

    if (!open) return null
    return (
        <FileServiceDialog
            open
            onClose={() => setOpen(false)}
            compositionType={compositionType}
            selectMode={selectMode}
            selectedFileIds={selectedFiles}
        />
    )
})
