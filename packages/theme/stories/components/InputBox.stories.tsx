import { story } from '../utils'
import { InputBox as Component } from '../../src/Components/InputBox'

const { meta, of } = story(Component)
export default meta({
    title: 'Components/InputBox',
    argTypes: {},
})

export const InputBox = of({
    args: { label: 'Label', value: 'Text' },
})
