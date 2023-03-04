import { forwardRef, useState } from 'react'
import type { SingletonModalRefCreator } from '../../libs/SingletonModal.js'
import { useSingletonModal } from '../../hooks/useSignletonModal.js'

export interface ExampleOpenProps {
    name: string
}

export interface ExampleCloseProps {
    message: string
}

export interface ExampleProps {}

export const Example = forwardRef<SingletonModalRefCreator<ExampleOpenProps, ExampleCloseProps>, ExampleProps>(
    (props, ref) => {
        const [name, setName] = useState('')
        const [opened, open, close] = useSingletonModal(ref, {
            onOpen(props) {
                setName(props.name)
            },
            onClose(props) {
                setName('')
            },
            onAbort(error) {
                setName('')
            },
        })

        if (!opened) return null

        return (
            <div>
                <span>This is an ordinary message.</span>
                <button
                    onClick={() => {
                        close?.({
                            message: `Welcome ${name || 'you'}!`,
                        })
                    }}>
                    Close
                </button>
            </div>
        )
    },
)
