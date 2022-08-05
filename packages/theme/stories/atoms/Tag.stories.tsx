import { Tag as MaskTag } from '../../src/Components'
import { story } from '../utils'

const { meta, of } = story(MaskTag)

export default meta({
    title: 'Atoms/Tags',
})

export const Tags = of({
    args: {
        children: 'Info Tag',
    },
})
