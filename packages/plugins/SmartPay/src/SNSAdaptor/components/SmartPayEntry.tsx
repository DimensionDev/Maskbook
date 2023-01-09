import { CrossIsolationMessages, DashboardRoutes, NextIDPlatform } from '@masknet/shared-base'
import { memo, useCallback, useEffect } from 'react'
import { ApplicationEntry, useSharedI18N } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { PLUGIN_ID } from '../../constants.js'
import {
    PluginI18NFieldRender,
    useAllPersonas,
    useCurrentPersonaInformation,
    useLastRecognizedIdentity,
} from '@masknet/plugin-infra/content-script'

import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { PluginSmartPayMessages } from '../../message.js'
import { useWallets } from '@masknet/web3-hooks-base'
import { NextIDProof } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { intersectionWith, first } from 'lodash-es'
import { useAsync } from 'react-use'
export interface SmartPayEntryProps {
    disabled: boolean
    tooltipHint?: string
    onClick?: (walletConnectedCallback?: () => void) => void
    popperBoundary?: HTMLElement | null
}

export const SmartPayEntry = memo<SmartPayEntryProps>((props) => {
    const t = useSharedI18N()
    const currentIdentity = useLastRecognizedIdentity()
    const currentPersona = useCurrentPersonaInformation()
    const wallets = useWallets()
    const personas = useAllPersonas()

    const { setDialog: setPersonaSelectPanelDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.PersonaSelectPanelDialogUpdated,
    )

    const { setDialog: setCreatePersonaConfirmDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.openPageConfirm,
    )

    const { openDialog: openSmartPayDialog, setDialog: setSmartPayDialog } = useRemoteControlledDialog(
        PluginSmartPayMessages.smartPayDialogEvent,
    )

    useEffect(() => {
        return CrossIsolationMessages.events.applicationDialogEvent.on(({ open, pluginID }) => {
            if (pluginID !== PLUGIN_ID) return
        })
    }, [])

    const { value, loading, error } = useAsync(async () => {
        if (!currentIdentity?.identifier?.userId || (!currentPersona && !wallets.length))
            return {
                hasVerifiedPersona: false,
            }

        // If currentPersona is bound, set the currentPersona be signer
        if (currentPersona) {
            const isVerifiedPersona = await NextIDProof.queryIsBound(
                currentPersona.identifier.publicKeyAsHex.toLowerCase(),
                NextIDPlatform.Twitter,
                currentIdentity?.identifier?.userId,
            )

            if (isVerifiedPersona)
                return {
                    hasVerifiedPersona: true,
                    signPersona: currentPersona,
                }
        }

        const response = await NextIDProof.queryAllExistedBindingsByPlatform(
            NextIDPlatform.Twitter,
            currentIdentity.identifier.userId,
        )

        const verifiedPersona = intersectionWith(
            personas.map((x) => ({ ...x, persona: x.identifier.publicKeyAsHex.toLowerCase() })),
            response,
            (a, b) => a.persona === b.persona,
        )

        const verifiedWallets = intersectionWith(
            wallets.map((x) => ({
                ...x,
                identity: x.address,
            })),
            response.flatMap((x) =>
                x.proofs.filter((y) => y.platform === NextIDPlatform.Ethereum && isValidAddress(y.identity)),
            ),
            (a, b) => isSameAddress(a.identity, b.identity),
        )

        if (verifiedPersona.length) {
            return {
                hasVerifiedPersona: true,
            }
        } else if (verifiedWallets.length) {
            return {
                signWallet: first(verifiedWallets),
            }
        }

        return {
            hasVerifiedPersona: false,
        }
    }, [currentIdentity, currentPersona, wallets, personas])

    const handleClick = useCallback(async () => {
        if (loading || !value) return

        // Contract account already exists
        if (wallets.filter((x) => x.owner).length)
            return setSmartPayDialog({
                open: true,
                hasAccounts: true,
                signWallet: value.signWallet,
                signPersona: value.signPersona,
            })

        // If there is no persona and no signer
        if (!personas.length && !value.signPersona && !value.signWallet) {
            return setCreatePersonaConfirmDialog({
                open: true,
                target: 'dashboard',
                url: DashboardRoutes.Setup,
                text: t.create_persona_hint(),
                title: t.create_persona_title(),
                actionHint: t.create_persona_action(),
                position: 'center',
            })
        }

        // if there is verified persona but current persona isn't verified
        if ((value.hasVerifiedPersona || personas.length) && !value.signPersona && !value.signWallet) {
            return setPersonaSelectPanelDialog({
                open: true,
                enableVerify: true,
            })
        }

        return setSmartPayDialog({
            open: true,
            signWallet: value.signWallet,
            signPersona: value.signPersona,
        })
    }, [loading, wallets, value, personas])

    return (
        <ApplicationEntry
            {...props}
            icon={<Icons.SmartPay size={36} />}
            title={
                <PluginI18NFieldRender
                    field={{ i18nKey: '__plugin_name', fallback: 'Smart Pay' }}
                    pluginID={PLUGIN_ID}
                />
            }
            onClick={() => (props.onClick ? props.onClick() : handleClick())}
        />
    )
})
