import { uniqBy } from 'lodash-es'
import { useEffect, useMemo, useState } from 'react'
import { EMPTY_LIST, NextIDPlatform, type ProfileInformation as Profile } from '@masknet/shared-base'
import type { LazyRecipients } from '../../CompositionDialog/CompositionUI.js'
import { useCurrentIdentity } from '../../DataSource/useActivatedUI.js'
import { SelectRecipientsDialogUI } from './SelectRecipientsDialog.js'
import { useTwitterIdByWalletSearch } from './useTwitterIdByWalletSearch.js'
import { resolveNextIDPlatform, resolveValueToSearch, usePersonasFromNextID } from '@masknet/shared'
import { useContacts } from './useContacts.js'
import { useI18N } from '../../../utils/index.js'

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
    const { t } = useI18N()
    const [valueToSearch, setValueToSearch] = useState('')
    const currentIdentity = useCurrentIdentity()
    const type = resolveNextIDPlatform(valueToSearch)
    const _value = resolveValueToSearch(valueToSearch)
    const { isInitialLoading: searchLoading, data: NextIDResults } = usePersonasFromNextID(
        _value,
        type ?? NextIDPlatform.NextID,
        false,
    )

    const NextIDItems = useTwitterIdByWalletSearch(NextIDResults, _value, type)
    const myUserId = currentIdentity?.identifier.userId
    const searchedList = useMemo(() => {
        if (!items.recipients) return EMPTY_LIST
        const profileItems = items.recipients.filter((x) => x.identifier.userId !== myUserId)
        // Selected might contain profiles that fetched asynchronously from
        // Next.ID, which are not stored locally
        return uniqBy(profileItems.concat(NextIDItems, selected), ({ linkedPersona }) => linkedPersona?.rawPublicKey)
    }, [NextIDItems, selected, items.recipients, myUserId])

    const { value = EMPTY_LIST } = useContacts(currentIdentity?.identifier.network!)

    useEffect(() => {
        if (!open) return
        items.request()
    }, [open, items.request])
    return (
        <SelectRecipientsDialogUI
            searchEmptyText={valueToSearch ? t('wallet_search_no_result') : undefined}
            loading={searchLoading}
            onSearch={setValueToSearch}
            open={open}
            items={uniqBy([...searchedList, ...value], (x) => x.linkedPersona?.publicKeyAsHex)}
            selected={selected}
            disabled={false}
            submitDisabled={false}
            onSubmit={onClose}
            onClose={onClose}
            onSetSelected={onSetSelected}
        />
    )
}
