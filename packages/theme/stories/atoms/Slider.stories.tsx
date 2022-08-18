import { story } from '../utils'
import { Slider as MuiSlider } from '@mui/material'

const { meta, of } = story(MuiSlider)

export default meta({
    title: 'Atoms/Slider',
    argTypes: {},
})

export const Slider = of({
    args: {
        defaultValue: 50,
    },
})
