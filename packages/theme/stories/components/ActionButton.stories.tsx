import { ActionButton as Example } from '../../src'
import { story } from '../utils'

const { meta, of } = story(Example)

export default meta({
    title: 'Components/ActionButton',
    component: Example,
    argTypes: {
        loading: { type: 'boolean' },
    },
})

export const ActionButton = of({
    storyName: 'Action Button',
    args: {
        children: 'Action Button',
        loading: true,
    },
})
