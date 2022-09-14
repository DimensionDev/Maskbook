import { story } from '../utils/index.js'
import { MaskLoadingButton } from '../../src/index.js'
import { Save } from '@mui/icons-material'
import { delay } from '@dimensiondev/kit'

const { meta, of } = story(MaskLoadingButton)

const f = () => delay(3000)
export default meta({
    title: 'Components/LoadingButton',
    parameters: {},
})

export const StartIcon = of({
    args: {
        onClick: f,
        children: 'Action',
        startIcon: <Save />,
    },
})

export const Normal = of({
    args: {
        onClick: f,
        children: 'Action',
    },
})

export const SoloLoading = of({
    args: {
        onClick: f,
        soloLoading: true,
        children: 'Action',
    },
})
