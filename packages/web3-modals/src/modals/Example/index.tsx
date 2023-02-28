import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react'
import type { SingletonModalRefCreator } from '../../components/SingletonModal.js'

export interface ExampleOpenProps {
    name: string
}

export interface ExampleCloseProps {
    message: string
}

export interface ExampleProps {}

export const Example = forwardRef<SingletonModalRefCreator<ExampleOpenProps, ExampleCloseProps>, ExampleProps>(
    (props, ref) => {
        const [open, setOpen] = useState(false)
        const [name, setName] = useState('')

        const refItem = useMemo<SingletonModalRefCreator<ExampleOpenProps, ExampleCloseProps>>(() => {
            return (onOpen, onClose) => ({
                open(props) {
                    setName(props.name)
                    setOpen(true)
                    onOpen(props)
                },
                close(props) {
                    setOpen(false)
                    onClose({
                        ...props,
                        message: `Welcome ${name || 'you.'}`,
                    })
                },
            })
        }, [name])

        useImperativeHandle(ref, () => refItem, [refItem])

        if (!open) return null
        return (
            <div>
                <span>This is an oridinary message.</span>
            </div>
        )
    },
)
