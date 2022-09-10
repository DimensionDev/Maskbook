import { LinearProgress as MuiLinearProgress } from '@mui/material'
import { story } from '../utils/index.js'

const { meta, of } = story(MuiLinearProgress)

export default meta({
    title: 'Atoms/Determinate LinearProgress',
    argTypes: {},
})

export const DeterminateLinearProgress = of({
    args: {
        variant: 'determinate',
        value: 50,
        sx: {
            width: 200,
        },
    },
})
