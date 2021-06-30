import { story } from '../utils'
import { SearchableListExample } from './SearchableListExample'

const { meta, of } = story(SearchableListExample)
export default meta({
    title: 'Components/Searchable List',
    parameters: {},
})

export const SearchableList = of({})
