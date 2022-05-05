import { useEffect } from 'react'
import { difference } from 'lodash-unified'
import { useI18N } from '../../../utils'
import type { ProfileInformation as Profile } from '@masknet/shared-base'
import type { LazyRecipients } from '../../CompositionDialog/CompositionUI'
import { SelectRecipientsDialogUI } from './SelectRecipientsDialog'
import { useCurrentIdentity } from '../../DataSource/useActivatedUI'
import { EMPTY_LIST } from '@masknet/shared-base'

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
    const currentIdentity = useCurrentIdentity()
    const profileItems = items.recipients?.filter((x) => x.identifier !== currentIdentity?.identifier)

    useEffect(() => void (open && items.request()), [open, items.request])

    return (
        <SelectRecipientsDialogUI
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
