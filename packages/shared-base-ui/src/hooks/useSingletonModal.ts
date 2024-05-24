import { useCallback, useImperativeHandle, useRef, useState, type Ref } from 'react'
import type { SingletonModalRef } from '@masknet/shared-base'

export function useSingletonModal<OpenProps, CloseProps>(
    ref: Ref<SingletonModalRef<OpenProps, CloseProps>> | undefined,
    options?: {
        onOpen?: (props: OpenProps, dispatch: ReturnType<SingletonModalRef<OpenProps, CloseProps>>) => void
        onClose?: (props: CloseProps, dispatch: ReturnType<SingletonModalRef<OpenProps, CloseProps>>) => void
        onAbort?: (error: Error, dispatch: ReturnType<SingletonModalRef<OpenProps, CloseProps>>) => void
    },
) {
    type T = SingletonModalRef<OpenProps, CloseProps>

    const [open, setOpen] = useState(false)
    const dispatchRef = useRef<ReturnType<T>>(undefined)
    const optionsRef = useRef<typeof options>(undefined)
    const openRef = useRef(open)
    optionsRef.current = options
    openRef.current = open

    const creator: T = useCallback((dispatchOpen, dispatchClose, dispatchAbort) => {
        dispatchRef.current = {
            peek() {
                return openRef.current
            },
            open(props) {
                optionsRef.current?.onOpen?.(props, this)
                dispatchOpen(props)
                setOpen(true)
            },
            close(props) {
                optionsRef.current?.onClose?.(props, this)
                dispatchClose(props)
                setOpen(false)
            },
            abort(error) {
                optionsRef.current?.onAbort?.(error, this)
                dispatchAbort(error)
                setOpen(false)
            },
        }
        return dispatchRef.current
    }, [])

    useImperativeHandle(ref, () => creator, [creator])

    return [open, dispatchRef.current] as const
}
