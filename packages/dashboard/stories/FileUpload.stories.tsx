import type { Meta } from '@storybook/react'
import component from '../src/components/FileUpload/index.js'

export default {
    component,
    title: 'Components/File Upload',
    args: {
        width: 420,
        height: 180,
        readAsText: true,
    },
} as Meta<typeof component>
