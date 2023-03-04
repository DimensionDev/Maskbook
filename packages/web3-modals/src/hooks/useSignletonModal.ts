import { useImperativeHandle, useMemo, useRef, useState } from 'react'
import type { SingletonModalRefCreator } from '../libs/SingletonModal.js'

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

    const creator = useMemo<T>(() => {
        return (dispatchOpen, dispatchClose, dispatchAbort) => {
            dispatchRef.current = {
                open(props) {
                    options?.onOpen?.(props)
                    dispatchOpen(props)
                    setOpen(true)
                },
                close(props) {
                    options?.onClose?.(props)
                    dispatchClose(props)
                    setOpen(false)
                },
                abort(error) {
                    options?.onAbort?.(error)
                    dispatchAbort(error)
                    setOpen(false)
                },
            }
            return dispatchRef.current
        }
    }, [options?.onOpen, options?.onClose, options?.onAbort])

    useImperativeHandle(ref, () => creator, [creator])

    return [open, dispatchRef.current] as const
}
