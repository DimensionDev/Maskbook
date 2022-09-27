import { Tag as MaskTag } from '../../src/Components/index.js'
import { story } from '../utils/index.js'

const { meta, of } = story(MaskTag)

export default meta({
    title: 'Atoms/Tags',
})

export const Tags = of({
    args: {
        children: 'Info Tag',
    },
})
