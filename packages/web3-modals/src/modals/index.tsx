import { SingletonModal } from '../libs/SingletonModal.js'
import { Example, type ExampleOpenProps } from './Example/index.js'

export const ExampleDialog = new SingletonModal<ExampleOpenProps>()

export function Modals() {
    return (
        <>
            <Example ref={ExampleDialog.register.bind(ExampleDialog)} />
        </>
    )
}
