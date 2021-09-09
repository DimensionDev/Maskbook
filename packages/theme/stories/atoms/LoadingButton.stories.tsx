import { story } from '../utils'
import { LoadingButtonExample } from './LoadingButtonExample'

const { meta, of } = story(LoadingButtonExample)
export default meta({
    title: 'Atoms/LoadingButton',
    parameters: {},
})

export const Dialog = of({
    args: {},
})
