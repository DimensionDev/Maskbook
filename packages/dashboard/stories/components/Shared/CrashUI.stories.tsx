import { CrashUI as component } from '@masknet/shared-base-ui'
import type { Meta } from '@storybook/react'

export default {
    component,
    title: 'Components/Crash UI',
    argTypes: { onRetry: { action: 'recover' } },
    args: {
        type: 'TypeError',
        message: 'Message',
        stack: new Error().stack,
        subject: 'Mask',
    },
} as Meta<typeof component>
