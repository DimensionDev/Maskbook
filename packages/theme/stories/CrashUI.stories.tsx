import { CrashUI } from '../src/Components/ErrorBoundary'
import { story, MuiArgs } from './utils'

const { meta, of } = story(CrashUI)
export default meta({
    title: 'CrashUI',
    argTypes: { onRetry: { action: 'recover' } },
})

export const Default = of({
    args: {
        type: 'TypeError',
        message: 'Message',
        stack: new Error().stack,
        subject: 'Mask',
    },
})
