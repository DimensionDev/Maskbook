import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useLookupAddress } from '@masknet/web3-hooks-base'
import { ChainId, isEnsSubdomain, isValidAddress, isValidDomain } from '@masknet/web3-shared-evm'
import { useCallback, useMemo, useState } from 'react'
import { createContainer } from 'unstated-next'
import { useI18N } from '../../../../../utils/index.js'

function useContacts() {
    const { t } = useI18N()
    const [receiver, setReceiver] = useState('')
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const { value: registeredAddress = '', error: resolveDomainError } = useLookupAddress(
        NetworkPluginID.PLUGIN_EVM,
        receiver,
        chainId,
    )

    // #region validation
    const receiverValidationMessage = useMemo(() => {
        if (!receiver) return ''
        if (
            !(isValidAddress(receiver) || isValidDomain(receiver)) ||
            (isValidDomain(receiver) && (resolveDomainError || !registeredAddress))
        )
            return t('wallets_transfer_error_invalid_address')
        return ''
    }, [receiver, resolveDomainError, registeredAddress])

    return { receiver, registeredAddress, setReceiver, receiverValidationMessage }
}

export const ContactsContext = createContainer(useContacts)
