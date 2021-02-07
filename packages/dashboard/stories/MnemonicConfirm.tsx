import { story } from '@dimensiondev/maskbook-storybook-shared'
import { MnemonicConfirm as C } from '../src/components/Mnemonic/MnemonicConfirm'

const { meta, of } = story(C)
export default meta({
    title: 'Components/Mnemonic Confirm',
    argTypes: { onChange: { action: 'change' } },
})
export const MnemonicConfirm = of({
    args: {},
})
