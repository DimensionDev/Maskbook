import { story } from '../utils'
import { PhoneNumberFieldExample } from './PhoneNumberFieldExample'

const { meta, of } = story(PhoneNumberFieldExample)
export default meta({
    title: 'Atoms/PhoneNumberTextField',
    parameters: {},
})

export const MaskPhoneNumberField = of({})
