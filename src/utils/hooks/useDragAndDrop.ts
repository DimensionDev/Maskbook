/** This file is published under MIT License */
import React from 'react'
/**
 * Usage:
 * const { dragEvents, fileReceiver, dragStatus, fileRef } = useDragAndDrop()
 * return <div {...dragEvents}> // Now you can drag into this div
 *     <input type="file" onChange={fileReceiver} /> // Also provide a way to select manually!
 *     { dragStatus === 'drag-enter' && 'Dragging!' } // Status of dragging
 *     <button onClick={upload(fileRef.current)}>Upload</button> // Get the file!
 * </div>
 */
export function useDragAndDrop() {
    const [status, setStatus] = React.useState<undefined | 'drag-enter' | 'selected'>(undefined)
    const fileRef = React.useRef<File | null>()
    const onChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        const files = (
            (event as React.DragEvent).dataTransfer || (event as React.ChangeEvent<HTMLInputElement>).currentTarget
        ).files
        if (!files) return
        const file = files.item(0)
        fileRef.current = file
        setStatus('selected')
    }, [])
    const onEnter = React.useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setStatus('drag-enter')
    }, [])
    const onLeave = React.useCallback((e: React.DragEvent) => {
        setStatus(undefined)
    }, [])
    const onCapture = React.useCallback((e: React.DragEvent) => {
        e.preventDefault()
        onChange(e)
        setTimeout(onLeave, 200)
    }, [onChange, onLeave])
    return {
        dragEvents: {
            onDragEnterCapture: onEnter,
            onDragLeaveCapture: onLeave,
            onDropCapture: onCapture,
            onDragOverCapture: onEnter,
        },
        fileReceiver: onChange,
        fileRef: fileRef,
        dragStatus: status,
    }
}
