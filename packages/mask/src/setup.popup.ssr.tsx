import { ThemeProvider } from '@emotion/react'
import { ECKeyIdentifier, PersonaInformation, ProfileIdentifier } from '@masknet/shared-base'
import { Appearance } from '@masknet/theme'
import { enUS } from '@mui/material/locale'
import { noop } from 'lodash-unified'
import { PersonaHomeUI } from './extension/popups/pages/Personas/Home/UI'
import { useClassicMaskFullPageTheme } from './utils/useClassicMaskFullPageTheme'

function useAlwaysLightTheme() {
    return useClassicMaskFullPageTheme(Appearance.light, [enUS, false])
}
export function PopupSSR() {
    const i: PersonaInformation = {
        identifier: new ECKeyIdentifier('secp256k1', 'hihihi'),
        linkedProfiles: [
            {
                identifier: new ProfileIdentifier('secp256k1', 'hihihi'),
                nickname: 'jack',
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
