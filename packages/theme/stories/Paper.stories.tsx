import { Paper, Typography } from '@material-ui/core'
import { story } from './utils'

const { meta, of } = story(Paper)
export default meta({
    title: 'Paper',
})

export const Default = of({
    args: {
        square: false,
    },
    children: <Typography style={{ padding: 12 }}>Content in the paper</Typography>,
})
