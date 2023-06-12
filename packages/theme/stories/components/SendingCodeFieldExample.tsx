import { SendingCodeField } from '../../src/Components/SendingCodeField/index.js'

const handleBlur = () => {}
const handleSend = () => {}

function Label() {
    return <div>Send to test@test.com</div>
}

export function SendingCodeFieldExample() {
    return (
        <div>
            <SendingCodeField onBlur={handleBlur} onSend={handleSend} />
            <SendingCodeField onBlur={handleBlur} onSend={handleSend} disabled />
            <SendingCodeField onBlur={handleBlur} onSend={handleSend} errorMessage="Code error" />
            <SendingCodeField label={<Label />} onBlur={handleBlur} onSend={handleSend} />
        </div>
    )
}
