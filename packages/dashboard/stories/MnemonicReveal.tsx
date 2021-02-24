import { story } from '@dimensiondev/maskbook-storybook-shared'
import { MnemonicReveal as C } from '../src/components/Mnemonic'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Mnemonic Reveal',
})

export const MnemonicReveal = of({
    args: {
        words: [...Array(12).keys()].map((i) => String('word' + i)),
    },
})
