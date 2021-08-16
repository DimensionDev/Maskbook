import { PhoneNumberField } from '../../src/Components'

const onBlur = () => {}

export function PhoneNumberFieldExample() {
    return (
        <div>
            <PhoneNumberField
                value={{
                    country: '+11',
                    phone: '123123123',
                }}
                onBlur={onBlur}
            />
            <PhoneNumberField
                value={{
                    country: '+11',
                    phone: 'test string',
                }}
                error
                phoneErrorMessage="Error phone number"
                onBlur={onBlur}
            />
        </div>
    )
}
