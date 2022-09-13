import { story } from '../utils/index.js'
import { PhoneNumberFieldExample } from './PhoneNumberFieldExample.js'

const { meta, of } = story(PhoneNumberFieldExample)
export default meta({
    title: 'Components/PhoneNumberField',
    parameters: {},
})

export const MaskPhoneNumberField = of({})
