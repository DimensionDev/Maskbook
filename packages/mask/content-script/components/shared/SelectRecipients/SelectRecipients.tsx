import { uniqBy } from 'lodash-es'
import { useEffect, useMemo, useState } from 'react'
import { EMPTY_LIST, type ProfileInformation as Profile } from '@masknet/shared-base'
import type { LazyRecipients } from '../../CompositionDialog/CompositionUI.js'
import { useCurrentIdentity } from '../../DataSource/useActivatedUI.js'
import { SelectRecipientsDialogUI } from './SelectRecipientsDialog.js'
import { useContacts } from './useContacts.js'
import { Trans } from '@lingui/react/macro'

interface SelectRecipientsUIProps {
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

    const myUserId = currentIdentity?.identifier.userId
    const searchedList = useMemo(() => {
        if (!items.recipients) return EMPTY_LIST
        const profileItems = items.recipients.filter((x) => x.identifier.userId !== myUserId)
        return uniqBy(profileItems.concat(selected), ({ linkedPersona }) => linkedPersona?.rawPublicKey)
    }, [selected, items.recipients, myUserId])

    const { value = EMPTY_LIST } = useContacts(currentIdentity?.identifier.network)

    useEffect(() => {
        if (!open) return
        items.request()
    }, [open, items.request])
    return (
        <SelectRecipientsDialogUI
            searchEmptyText={valueToSearch ? <Trans>No results</Trans> : undefined}
            loading={false}
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
