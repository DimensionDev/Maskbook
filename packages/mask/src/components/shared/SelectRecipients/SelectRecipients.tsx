import { useEffect, useState } from 'react'
import {
    ProfileInformation as Profile,
    EMPTY_LIST,
    NextIDPlatform,
    ECKeyIdentifier,
    ProfileInformationFromNextID,
    ProfileIdentifier,
} from '@masknet/shared-base'
import type { LazyRecipients } from '../../CompositionDialog/CompositionUI'
import { SelectRecipientsDialogUI } from './SelectRecipientsDialog'
import { useCurrentIdentity } from '../../DataSource/useActivatedUI'
import { useNextIDBoundByPlatform } from '../../DataSource/useNextID'
import { useTwitterIdByWalletSearch } from './useTwitterIdByWalletSearch'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils'
import { cloneDeep, uniqBy } from 'lodash-unified'
import Services from '../../../extension/service'

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
    if (isValidAddress(value)) return NextIDPlatform.Ethereum
    if (value.length >= 44) return NextIDPlatform.NextID
    if (/^\w{1,15}$/.test(value)) return NextIDPlatform.Twitter
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
    const { loading: searchLoading, value: NextIDResults } = useNextIDBoundByPlatform(
        type ?? NextIDPlatform.NextID,
        value,
    )
    const NextIDItems = useTwitterIdByWalletSearch(NextIDResults, value, type)
    const profileItems = items.recipients?.filter((x) => x.identifier !== currentIdentity?.identifier)
    const searchedList = uniqBy(
        profileItems?.concat(NextIDItems) ?? [],
        ({ linkedPersona, nickname }) => linkedPersona?.publicKeyAsHex && nickname,
    )

    const onSelect = async (item: ProfileInformationFromNextID) => {
        onSetSelected([...selected, item])
        const whoAmI = await Services.Settings.getCurrentPersonaIdentifier()

        if (!item || !item.fromNextID || !item.linkedPersona || !whoAmI) return
        await Promise.all(
            item.linkedTwitterNames.map(async (x) => {
                const newItem = {
                    ...item,
                    nickname: x,
                    identifier: ProfileIdentifier.of('twitter.com', x).unwrap(),
                }

                await Services.Identity.attachNextIDPersonaToProfile(newItem, whoAmI)
            }),
        )
    }

    useEffect(() => void (open && items.request()), [open, items.request])
    return (
        <SelectRecipientsDialogUI
            searchEmptyText={valueToSearch ? t('wallet_search_no_result') : undefined}
            loading={searchLoading}
            onSearch={(v: string) => {
                setValueToSearch(v)
            }}
            open={open}
            items={searchedList || EMPTY_LIST}
            selected={selected}
            disabled={false}
            submitDisabled={false}
            onSubmit={onClose}
            onClose={onClose}
            onSelect={(item) => onSelect(item as ProfileInformationFromNextID)}
            onDeselect={(item) => {
                onSetSelected(
                    cloneDeep(selected).filter(
                        (x) => x.linkedPersona?.publicKeyAsHex !== item.linkedPersona?.publicKeyAsHex,
                    ),
                )
            }}
        />
    )
}
