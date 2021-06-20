import { SearchableList } from '@dimensiondev/maskbook-shared'

interface IDemoData {
    address: string
}

const demoData: IDemoData[] = [
    {
        address: 'demo-address',
    },
]

export function SearchableListExample() {
    return (
        <SearchableList<IDemoData> title={'Search demo'} open data={demoData} onSelect={() => {}}>
            <span>test</span>
        </SearchableList>
    )
}
