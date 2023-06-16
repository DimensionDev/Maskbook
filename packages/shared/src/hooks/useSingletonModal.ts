import { useCallback, useImperativeHandle, useRef, useState } from 'react'
import type { SingletonModalRefCreator } from '@masknet/shared-base'

export function useSingletonModal<OpenProps, CloseProps>(
    ref: React.ForwardedRef<SingletonModalRefCreator<OpenProps, CloseProps>>,
    options?: {
        onOpen?: (props?: OpenProps) => void
        onClose?: (props?: CloseProps) => void
        onAbort?: (error: Error) => void
    },
) {
    type T = SingletonModalRefCreator<OpenProps, CloseProps>

    const [open, setOpen] = useState(false)
    const dispatchRef = useRef<ReturnType<T>>()
    const optionsRef = useRef<typeof options>()
    const openRef = useRef<boolean>(open)
    optionsRef.current = options
    openRef.current = open

    const creator: T = useCallback((dispatchOpen, dispatchClose, dispatchAbort) => {
        dispatchRef.current = {
            get opened() {
                return openRef.current
            },
            open(props) {
                optionsRef.current?.onOpen?.(props)
                dispatchOpen(props)
                setOpen(true)
            },
            close(props) {
                optionsRef.current?.onClose?.(props)
                dispatchClose(props)
                setOpen(false)
            },
            abort(error) {
                optionsRef.current?.onAbort?.(error)
                dispatchAbort(error)
                setOpen(false)
            },
        }
        return dispatchRef.current
    }, [])

    useImperativeHandle(ref, () => creator, [])

    return [open, dispatchRef.current] as const
}
