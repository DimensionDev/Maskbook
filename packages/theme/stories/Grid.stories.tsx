import Grid from './Grid'
import { story } from './utils'

const { meta, of } = story(Grid)
export default meta({
    title: 'Grid',
})

export const Default = of({
    args: {
        square: false,
    },
})
