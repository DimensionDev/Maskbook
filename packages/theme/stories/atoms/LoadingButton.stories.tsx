import { story } from '../utils'
import { MaskLoadingButton } from '../../src'
import { Save } from '@material-ui/icons'

const { meta, of } = story(MaskLoadingButton)

function delay(time: number) {
    return new Promise(function (resolve) {
        setTimeout(resolve.bind(null), time)
    })
}
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
