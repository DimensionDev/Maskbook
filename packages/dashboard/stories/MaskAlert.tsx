import { story } from '@masknet/storybook-shared'
import { MaskAlert as C } from '../src/components/MaskAlert'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Mask Alert',
})

export const MaskAlert = of({})
