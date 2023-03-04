import { SingletonModal } from '../libs/SingletonModal.js'
import { Example, type ExampleCloseProps, type ExampleOpenProps } from './Example/index.js'

export const ExampleDialog = new SingletonModal<ExampleOpenProps, ExampleCloseProps>()

export function Modals() {
    return (
        <>
            <Example ref={ExampleDialog.register} />
        </>
    )
}
