import { SingletonModal } from '../components/SingletonModal.js'
import { Example, type ExampleCloseProps, type ExampleOpenProps } from './Example/index.js'

const ExampleDialog = new SingletonModal<ExampleOpenProps, ExampleCloseProps>()

export function Modals() {
    return (
        <>
            <Example ref={ExampleDialog.register} />
        </>
    )
}

async function Demo() {
    // imperative call
    ExampleDialog.open({
        name: 'World',
    })

    // returns { message: "Welcome World!" }
    await ExampleDialog.openAndWaitForClose({
        name: 'World',
    })
}
