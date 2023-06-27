import { EMPTY_LIST, type EnhanceableSite, type SingletonModalRefCreator } from '@masknet/shared-base'
import { forwardRef, useState } from 'react'
import { ConnectSocialAccountDialog } from './ConnectSocialAccountDialog.js'
import { useSingletonModal } from '@masknet/shared'

export interface ConnectSocialAccountModalOpenProps {
    networks: EnhanceableSite[]
    onConnect: (networkIdentifier: EnhanceableSite) => void
}

export interface ConnectSocialAccountModalProps {}

export const ConnectSocialAccountModal = forwardRef<
    SingletonModalRefCreator<ConnectSocialAccountModalOpenProps>,
    ConnectSocialAccountModalProps
>((props, ref) => {
    const [networks, setNetworks] = useState<EnhanceableSite[]>(EMPTY_LIST)
    const [onConnect, setOnConnect] = useState<(networkIdentifier: EnhanceableSite) => void>()
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setNetworks(props.networks)
            setOnConnect(() => props.onConnect)
        },
    })
    return (
        <ConnectSocialAccountDialog
            open={open}
            onClose={() => dispatch?.close()}
            networks={networks}
            onConnect={onConnect}
        />
    )
})
