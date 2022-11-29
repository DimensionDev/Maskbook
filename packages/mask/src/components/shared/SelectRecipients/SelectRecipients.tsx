import { useEffect, useMemo, useState } from 'react'
import { batch } from 'async-call-rpc'
import { cloneDeep, uniqBy } from 'lodash-es'
import {
    ProfileInformation as Profile,
    NextIDPlatform,
    ECKeyIdentifier,
    ProfileInformationFromNextID,
    ProfileIdentifier,
} from '@masknet/shared-base'
import type { LazyRecipients } from '../../CompositionDialog/CompositionUI.js'
import { SelectRecipientsDialogUI } from './SelectRecipientsDialog.js'
import { useCurrentIdentity } from '../../DataSource/useActivatedUI.js'
import { usePersonasFromNextID } from '../../DataSource/usePersonasFromNextID.js'
import { useTwitterIdByWalletSearch } from './useTwitterIdByWalletSearch.js'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils/index.js'
import Services from '../../../extension/service.js'

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
    const { loading: searchLoading, value: NextIDResults } = usePersonasFromNextID(value, type ?? NextIDPlatform.NextID)

    const NextIDItems = useTwitterIdByWalletSearch(NextIDResults, value, type)
    const searchedList = useMemo(() => {
        const profileItems = items.recipients?.filter((x) => x.identifier !== currentIdentity?.identifier)
        return uniqBy(profileItems?.concat(NextIDItems) ?? [], ({ linkedPersona }) => linkedPersona?.rawPublicKey)
    }, [NextIDItems, items.recipients])

    const onSelect = async (item: ProfileInformationFromNextID) => {
        onSetSelected([...selected, item])
        const whoAmI = await Services.Settings.getCurrentPersonaIdentifier()

        if (!item?.fromNextID || !item.linkedPersona || !whoAmI) return
        const [rpc, emit] = batch(Services.Identity)
        item.linkedTwitterNames.forEach((x) => {
            const newItem = {
                ...item,
                nickname: x,
                identifier: ProfileIdentifier.of('twitter.com', x).unwrap(),
            }
            rpc.attachNextIDPersonaToProfile(newItem, whoAmI)
        })
        emit()
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
            items={searchedList}
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
