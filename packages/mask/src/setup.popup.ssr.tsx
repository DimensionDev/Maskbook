import { ThemeProvider } from '@emotion/react'
import { ECKeyIdentifier, PersonaInformation, ProfileIdentifier, i18NextInstance } from '@masknet/shared-base'
import { Appearance } from '@masknet/theme'
import { enUS } from '@mui/material/locale'
import { noop } from 'lodash-unified'
import { PersonaHomeUI } from './extension/popups/pages/Personas/Home/UI'
import { useClassicMaskFullPageTheme } from './utils/useClassicMaskFullPageTheme'
import { initReactI18next } from 'react-i18next'
import { addMaskI18N } from '../shared-ui/locales/languages'

initReactI18next.init(i18NextInstance)
addMaskI18N(i18NextInstance)

function useAlwaysLightTheme() {
    return useClassicMaskFullPageTheme(Appearance.light, [enUS, false])
}
export function PopupSSR() {
    const i: PersonaInformation = {
        identifier: new ECKeyIdentifier('secp256k1', Math.random().toString()),
        linkedProfiles: [
            {
                identifier: new ProfileIdentifier('secp256k1', Math.random().toString()),
                nickname: Math.random().toString(),
            },
        ],
    }
    return (
        <ThemeProvider theme={useAlwaysLightTheme}>
            <PersonaHomeUI
                currentPersona={i}
                navigate={noop}
                onChangeCurrentPersona={noop}
                SOCIAL_MEDIA_ICON_MAPPING={{ 'twitter.com': null }}
                confirmLoading={false}
                definedSocialNetworks={['twitter.com']}
                mergedProfiles={[]}
                onConnectNextID={noop}
                onConfirmDisconnect={noop}
                onDeletePersona={noop}
                onDisconnectProfile={noop}
                openProfilePage={noop}
                onConnectProfile={noop}
                personas={[i]}
            />
        </ThemeProvider>
    )
}
