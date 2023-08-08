import { useMemo, useState } from 'react'
import { createContainer } from 'unstated-next'
import { NetworkPluginID, type Wallet } from '@masknet/shared-base'
import { useContacts, useChainContext, useLookupAddress, useWallets, useAddressType } from '@masknet/web3-hooks-base'
import { AddressType, isValidAddress, isValidDomain } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils/index.js'
import { type Contact } from '@masknet/web3-shared-base'
import { useAsync } from 'react-use'
import { GoPlusLabs } from '@masknet/web3-providers'

interface ContextOptions {
    defaultName: string
    defaultAddress: string
}

function useContactsContext({ defaultName, defaultAddress }: ContextOptions = { defaultName: '', defaultAddress: '' }) {
    const { t } = useI18N()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const contacts = useContacts()
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)
    const [userInput, setUserInput] = useState(defaultName || defaultAddress)
    const { value: registeredAddress, error: resolveDomainError } = useLookupAddress(
        NetworkPluginID.PLUGIN_EVM,
        userInput,
        chainId,
    )
    const address = useMemo(() => {
        if (!userInput) return ''
        if (isValidDomain(userInput) && registeredAddress) {
            return registeredAddress
        }
        if (isValidAddress(userInput)) return userInput
        // UserInput is wallet name
        const contact: Wallet | Contact | undefined = [...wallets, ...contacts].find((x) => x.name === userInput)
        return contact?.address
    }, [userInput, registeredAddress, contacts, wallets])

    const { value: addressType } = useAddressType(NetworkPluginID.PLUGIN_EVM, address, {
        chainId,
    })

    const { value: security } = useAsync(async () => {
        if (!isValidAddress(address)) return
        return GoPlusLabs.getAddressSecurity(chainId, address)
    }, [chainId, address])

    const isMaliciousAddress = security && Object.values(security).filter((x) => x === '1').length > 0

    const inputValidationMessage = useMemo(() => {
        if (isMaliciousAddress) return t('wallets_transfer_error_address_scam')
        if (!userInput || address) return ''
        if (!(isValidAddress(userInput) || isValidDomain(userInput))) {
            return t('wallets_transfer_error_invalid_address')
        }
        if (isValidDomain(userInput) && (resolveDomainError || !registeredAddress)) {
            return t('wallets_transfer_error_invalid_domain')
        }
        return ''
    }, [userInput, resolveDomainError, registeredAddress, isMaliciousAddress])

    const inputWarningMessage = useMemo(() => {
        if (addressType === AddressType.Contract) return t('wallets_transfer_warning_contract_address')
        return ''
    }, [addressType])

    return {
        contacts,
        wallets,
        address,
        userInput,
        setUserInput,
        inputValidationMessage,
        inputWarningMessage,
    }
}

export const ContactsContext = createContainer(useContactsContext)
ContactsContext.Provider.displayName = 'ContactsContextProvider'
