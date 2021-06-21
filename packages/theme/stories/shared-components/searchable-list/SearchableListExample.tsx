import { SearchableList } from '@dimensiondev/maskbook-shared'

interface IItemProps {
    data: IDemoData
}

interface IDemoData {
    address: string
}

const demoData: IDemoData[] = [
    {
        address: 'demo-address',
    },
]

export function SearchableListItemExample({ data }: IItemProps) {
    return <span>{data.address}</span>
}

export function SearchableListExample() {
    return (
        <SearchableList<IDemoData> title={'SearchableList'} open data={demoData} onSelect={() => {}}>
            {SearchableListItemExample}
        </SearchableList>
    )
}
