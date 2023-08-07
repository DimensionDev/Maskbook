import { useMemo, useState } from 'react'
import { createContainer } from 'unstated-next'
import { NetworkPluginID, type Wallet } from '@masknet/shared-base'
import { useContacts, useChainContext, useLookupAddress, useWallets } from '@masknet/web3-hooks-base'
import { isValidAddress, isValidDomain } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils/index.js'
import { type Contact } from '@masknet/web3-shared-base'

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

    const inputValidationMessage = useMemo(() => {
        if (!userInput || address) return ''
        if (
            !(isValidAddress(userInput) || isValidDomain(userInput)) ||
            (isValidDomain(userInput) && (resolveDomainError || !registeredAddress))
        )
            return t('wallets_transfer_error_invalid_address')
        return ''
    }, [userInput, resolveDomainError, registeredAddress])

    return {
        contacts,
        wallets,
        address,
        userInput,
        setUserInput,
        inputValidationMessage,
    }
}

export const ContactsContext = createContainer(useContactsContext)
ContactsContext.Provider.displayName = 'ContactsContextProvider'
