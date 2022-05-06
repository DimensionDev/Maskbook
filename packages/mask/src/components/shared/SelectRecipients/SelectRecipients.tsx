import { useEffect, useState } from 'react'
import { difference } from 'lodash-unified'
import { useI18N } from '../../../utils'
import { ProfileInformation as Profile, EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import type { LazyRecipients } from '../../CompositionDialog/CompositionUI'
import { SelectRecipientsDialogUI } from './SelectRecipientsDialog'
import { useCurrentIdentity } from '../../DataSource/useActivatedUI'
import { useNextIDBoundByPlatform } from '../../DataSource/useNextID'
import { useTwitterIdByWalletSearch } from './useTwitterIdByWalletSearch'

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
    const { t } = useI18N()
    const { items, selected, onSetSelected, open, onClose } = props
    const [addressToSearch, setAddressToSearch] = useState('')
    const currentIdentity = useCurrentIdentity()

    const { loading: searchLoading, value: NextIDResults } = useNextIDBoundByPlatform(
        NextIDPlatform.Ethereum,
        addressToSearch,
    )
    const NextIDItems = useTwitterIdByWalletSearch(NextIDResults, addressToSearch)
    const profileItems = items.recipients?.filter((x) => x.identifier !== currentIdentity?.identifier)
    NextIDItems.forEach((x: Profile) => {
        ;(profileItems ?? []).push(x)
    })

    console.log(profileItems, 'ggg')
    useEffect(() => void (open && items.request()), [open, items.request])

    return (
        <SelectRecipientsDialogUI
            loading={searchLoading}
            onSearch={(v: string) => setAddressToSearch(v)}
            open={open}
            items={profileItems || EMPTY_LIST}
            selected={profileItems?.filter((x) => selected.includes(x)) || EMPTY_LIST}
            disabled={false}
            submitDisabled={false}
            onSubmit={onClose}
            onClose={onClose}
            onSelect={(item) => onSetSelected([...selected, item])}
            onDeselect={(item) => onSetSelected(difference(selected, [item]))}
        />
    )
}
