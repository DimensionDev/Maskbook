import { ActionButton as Example } from '../../src/index.js'
import { story } from '../utils/index.js'

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
