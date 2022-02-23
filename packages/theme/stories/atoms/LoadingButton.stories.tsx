import { story } from '../utils'
import { MaskLoadingButton } from '../../src'
import { Save } from '@mui/icons-material'

const { meta, of } = story(MaskLoadingButton)

const f = () => delay(3000)
export default meta({
    title: 'Atoms/LoadingButton',
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
