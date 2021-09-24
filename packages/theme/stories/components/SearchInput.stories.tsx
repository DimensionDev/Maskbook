import { story } from '../utils'
import { SearchInput as Component } from '../../src/Components/SearchInput'

const { meta, of } = story(Component)
export default meta({
    title: 'Components/SearchInput',
    argTypes: {},
})

export const SearchInput = of({
    args: { label: 'Label', value: '' },
})
