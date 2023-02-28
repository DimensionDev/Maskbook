import { SingletonModal } from '../components/SingletonModal.js'
import { Example, ExampleCloseProps, ExampleOpenProps } from './Example/index.js'

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
        name: 'Vitalik Buterin',
    })

    // returns { message: "Welcome Vitalik Buterin!" }
    await ExampleDialog.openAndWaitForClose({
        name: 'Vitalik Buterin',
    })
}
