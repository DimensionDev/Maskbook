import { ECKeyIdentifier, EMPTY_LIST, NextIDPlatform, type ProfileInformation as Profile } from '@masknet/shared-base'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { uniqBy } from 'lodash-es'
import { useEffect, useMemo, useState } from 'react'
import { MaskMessages, useI18N } from '../../../utils/index.js'
import type { LazyRecipients } from '../../CompositionDialog/CompositionUI.js'
import { useCurrentIdentity } from '../../DataSource/useActivatedUI.js'
import { SelectRecipientsDialogUI } from './SelectRecipientsDialog.js'
import { useTwitterIdByWalletSearch } from './useTwitterIdByWalletSearch.js'
import { usePersonasFromNextID } from '@masknet/shared'

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
const resolveNextIDPlatform = (value: string) => {
    const address = value
    if (isValidAddress(address)) return NextIDPlatform.Ethereum

    const pubKey = value
    if (pubKey.length >= 44) return NextIDPlatform.NextID

    const userId = value
    if (/^\w{1,15}$/.test(userId)) return NextIDPlatform.Twitter

    return
}

const resolveValueToSearch = (value: string) => {
    if (value.length === 44) return new ECKeyIdentifier('secp256k1', value).publicKeyAsHex ?? value
    return value.toLowerCase()
}

export function SelectRecipientsUI(props: SelectRecipientsUIProps) {
    const { items, selected, onSetSelected, open, onClose } = props
    const { t } = useI18N()
    const [valueToSearch, setValueToSearch] = useState('')
    const currentIdentity = useCurrentIdentity()
    const type = resolveNextIDPlatform(valueToSearch)
    const value = resolveValueToSearch(valueToSearch)
    const { loading: searchLoading, value: NextIDResults } = usePersonasFromNextID(
        value,
        type ?? NextIDPlatform.NextID,
        MaskMessages.events.ownProofChanged,
        false,
    )

    const NextIDItems = useTwitterIdByWalletSearch(NextIDResults, value, type)
    const myUserId = currentIdentity?.identifier.userId
    const searchedList = useMemo(() => {
        if (!items.recipients) return EMPTY_LIST
        const profileItems = items.recipients.filter((x) => x.identifier.userId !== myUserId)
        // Selected might contain profiles that fetched asynchronously from
        // Next.ID, which are not stored locally
        return uniqBy(profileItems.concat(NextIDItems, selected), ({ linkedPersona }) => linkedPersona?.rawPublicKey)
    }, [NextIDItems, selected, items.recipients, myUserId])

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
            items={searchedList}
            selected={selected}
            disabled={false}
            submitDisabled={false}
            onSubmit={onClose}
            onClose={onClose}
            onSetSelected={onSetSelected}
        />
    )
}
