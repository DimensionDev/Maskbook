import { NetworkPluginID, type Wallet } from '@masknet/shared-base'
import { useAddressType, useChainContext, useContacts, useLookupAddress, useWallets } from '@masknet/web3-hooks-base'
import { GoPlusLabs } from '@masknet/web3-providers'
import { isSameAddress, type Contact } from '@masknet/web3-shared-base'
import { AddressType, type ChainId, isValidAddress, isValidDomain } from '@masknet/web3-shared-evm'
import { useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import { createContainer } from '@masknet/shared-base-ui'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

interface ContextOptions {
    defaultName: string
    defaultAddress: string
    defaultChainId?: ChainId
}

function useContactsContext(
    { defaultName, defaultChainId, defaultAddress }: ContextOptions = { defaultName: '', defaultAddress: '' },
) {
    const { _ } = useLingui()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: defaultChainId })
    const contacts = useContacts()
    const wallets = useWallets()
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
        const matches = [...wallets, ...contacts].filter((x) => x.name === userInput)
        if (!matches.length) return defaultAddress
        const contact: Wallet | Contact =
            matches.length > 1 ?
                // There might be wallets or contacts with the same name
                matches.find((x) => isSameAddress(x.address, defaultAddress)) || matches[0]
            :   matches[0]
        return contact.address
    }, [userInput, defaultAddress, registeredAddress, contacts, wallets])

    const { value: addressType } = useAddressType(NetworkPluginID.PLUGIN_EVM, address, {
        chainId,
    })

    const { value: security } = useAsync(async () => {
        if (!isValidAddress(address)) return
        return GoPlusLabs.getAddressSecurity(chainId, address)
    }, [chainId, address])

    const isMaliciousAddress = security && Object.values(security).filter((x) => x === '1').length > 1

    const inputValidationMessage = useMemo(() => {
        if (isMaliciousAddress) return _(msg`This address may be a scam address.`)
        if (!userInput || address) return ''
        if (!(isValidAddress(userInput) || isValidDomain(userInput))) {
            return _(msg`Incorrect wallet address.`)
        }
        if (isValidDomain(userInput) && (resolveDomainError || !registeredAddress)) {
            return _(msg`This ENS does not exist or not be resolved.`)
        }
        return ''
    }, [userInput, resolveDomainError, registeredAddress, isMaliciousAddress])

    const inputWarningMessage = useMemo(() => {
        if (addressType === AddressType.Contract) return _(msg`This address is a contract address.`)
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
