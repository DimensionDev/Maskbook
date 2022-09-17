import { story } from '@masknet/storybook-shared'
import C from '../src/components/FileUpload/index.js'

const { meta, of } = story(C)

export default meta({
    title: 'Components/File Upload',
})

export const FileUpload = of({
    args: {
        width: 420,
        height: 180,
        readAsText: true,
    },
})
