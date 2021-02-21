import { CrashUI as C } from '../../src/Components/ErrorBoundary'
import { story, MuiArgs } from '../utils'

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
