import { CrashUI as C } from '@masknet/shared'
import { story } from '@masknet/storybook-shared'

const { meta, of } = story(C)
export default meta({
    title: 'Components/Crash UI',
    argTypes: { onRetry: { action: 'recover' } },
})

export const CrashUI = of({
    args: {
        type: 'TypeError',
        message: 'Message',
        stack: new Error().stack,
        subject: 'Mask',
    },
})
