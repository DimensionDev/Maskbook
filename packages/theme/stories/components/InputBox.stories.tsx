import { story } from '../utils'
import { InputBox as Box } from '../../src/Components/InputBox'

const { meta, of } = story(Box)
export default meta({
    title: 'Components/InputBox',
    argTypes: {},
})

export const InputBox = of({
    args: { label: 'Label', value: 'Text' },
})
