import { useImperativeHandle, useMemo, useRef, useState } from 'react'
import type { SingletonModalRefCreator } from '../libs/SingletonModal.js'

export function useSingletonModal<OpenProps, CloseProps>(
    ref: React.ForwardedRef<SingletonModalRefCreator<OpenProps, CloseProps>>,
    options?: {
        onOpen?: (props: OpenProps) => void
        onClose?: (props: CloseProps) => void
        onAbort?: (error: Error) => void
    },
) {
    type T = SingletonModalRefCreator<OpenProps, CloseProps>

    const [opened, setOpened] = useState(false)

    const dispatchOpenRef = useRef<ReturnType<T>['open']>()
    const dispatchCloseRef = useRef<ReturnType<T>['close']>()
    const dispatchAbortRef = useRef<ReturnType<T>['abort']>()

    const creator = useMemo<T>(() => {
        return (dispatchOpen, dispatchClose, dispatchAbort) => {
            dispatchOpenRef.current = dispatchOpen
            dispatchCloseRef.current = dispatchClose
            dispatchAbortRef.current = dispatchAbort

            return {
                open(props) {
                    options?.onOpen?.(props)
                    dispatchOpen(props)
                    setOpened(true)
                },
                close(props) {
                    options?.onClose?.(props)
                    dispatchClose(props)
                    setOpened(false)
                },
                abort(error) {
                    options?.onAbort?.(error)
                    dispatchAbort(error)
                    setOpened(false)
                },
            }
        }
    }, [options?.onOpen, options?.onClose, options?.onAbort])

    useImperativeHandle(ref, () => creator as T, [creator])

    return [opened, dispatchOpenRef.current, dispatchCloseRef.current, dispatchAbortRef.current] as const
}
