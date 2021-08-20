import { SearchableList } from '../../src/Components/SearchableList'
import { DialogContent } from '@material-ui/core'
import { MaskDialog } from '../../src/Components'
import { styled } from '@material-ui/core/styles'

const demoData: IDemoData[] = [
    { address: 'ETH' },
    { address: 'MASK' },
    { address: 'ETH' },
    { address: 'UMI' },
    { address: 'AMP' },
    { address: 'ANT' },
    { address: 'BAL' },
    { address: 'YFI' },
]

interface IItemProps {
    data: IDemoData
}

interface IDemoData {
    address: string
}

const ListItem = styled('div')`
    line-height: 60px;
`

export function SearchableListItemExample({ data }: IItemProps) {
    return <ListItem>{data.address}</ListItem>
}

export function SearchableListExample() {
    return (
        <MaskDialog open title="Searchable List">
            <DialogContent>
                <SearchableList<IDemoData> data={demoData} onSelect={() => {}} itemRender={SearchableListItemExample} />
            </DialogContent>
        </MaskDialog>
    )
}
