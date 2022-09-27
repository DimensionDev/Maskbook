import { story } from '../utils/index.js'
import { SearchableListExample } from './SearchableListExample.js'

const { meta, of } = story(SearchableListExample)
export default meta({
    title: 'Components/Searchable List',
    parameters: {},
})

export const SearchableList = of({})
