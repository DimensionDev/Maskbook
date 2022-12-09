import { EMPTY_LIST } from '@masknet/shared-base'
import { useEffect, useState } from 'react'
import { emitter } from './emitter.js'
import FileServiceDialog from './MainDialog.js'

export function FileServiceInjection() {
    const [open, setOpen] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<string[]>([])
    const [selectMode, setSelectMode] = useState(false)
    useEffect(() => {
        const unsubscribe = emitter.on('open', (options) => {
            setOpen(true)
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
            selectMode={selectMode}
            selectedFileIds={selectedFiles}
        />
    )
}
