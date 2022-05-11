import { useEffect, useState } from 'react'
import { cloneDeep } from 'lodash-unified'
import { ProfileInformation as Profile, EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import type { LazyRecipients } from '../../CompositionDialog/CompositionUI'
import { SelectRecipientsDialogUI } from './SelectRecipientsDialog'
import { useCurrentIdentity } from '../../DataSource/useActivatedUI'
import { useNextIDBoundByPlatform } from '../../DataSource/useNextID'
import { useTwitterIdByWalletSearch } from './useTwitterIdByWalletSearch'
import { isValidAddress } from '@masknet/web3-shared-evm'

export interface SelectRecipientsUIProps {
    items: LazyRecipients
    selected: Profile[]
    disabled?: boolean
    hideSelectAll?: boolean
    hideSelectNone?: boolean
    open: boolean
    onClose(): void
    onSetSelected(selected: Profile[]): void
}

export function SelectRecipientsUI(props: SelectRecipientsUIProps) {
    const { items, selected, onSetSelected, open, onClose } = props
    const [valueToSearch, setValueToSearch] = useState('')
    const currentIdentity = useCurrentIdentity()

    const resolveNextIDPlatformType = () => {
        return isValidAddress(valueToSearch)
            ? NextIDPlatform.Ethereum
            : valueToSearch.length === 44
            ? NextIDPlatform.NextID
            : NextIDPlatform.Twitter
    }
    const { loading: searchLoading, value: NextIDResults } = useNextIDBoundByPlatform(
        resolveNextIDPlatformType(),
        valueToSearch,
    )
    const NextIDItems = useTwitterIdByWalletSearch(NextIDResults, valueToSearch)
    const profileItems = items.recipients?.filter((x) => x.identifier !== currentIdentity?.identifier)

    const unique = (arr: Profile[], val: string) => {
        const res = new Map()
        return arr.filter((item) => !res.has(item[val]) && res.set(item[val], 1))
    }
    const searchedList = unique(profileItems?.concat(NextIDItems) ?? [], 'publicHexKey')
    useEffect(() => void (open && items.request()), [open, items.request])
    return (
        <SelectRecipientsDialogUI
            searchEmptyText={valueToSearch ? 'No Result.' : undefined}
            loading={searchLoading}
            onSearch={(v: string) => {
                setValueToSearch(v)
            }}
            open={open}
            items={searchedList || EMPTY_LIST}
            selected={searchedList?.filter((x) => selected.some((i) => i.identifier === x.identifier)) || EMPTY_LIST}
            disabled={false}
            submitDisabled={false}
            onSubmit={onClose}
            onClose={onClose}
            onSelect={(item) => onSetSelected([...selected, item])}
            onDeselect={(item) => {
                const temp = cloneDeep(selected)
                const idxToDel = temp.findIndex((x) => x.identifier === item.identifier)
                temp.splice(idxToDel, 1)
                onSetSelected(temp)
            }}
        />
    )
}
