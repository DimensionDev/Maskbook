import { ThemeProvider } from '@emotion/react'
import {
    ECKeyIdentifier,
    PersonaInformation,
    ProfileIdentifier,
    i18NextInstance,
    EnhanceableSite,
    PopupRoutes,
} from '@masknet/shared-base'
import { Appearance } from '@masknet/theme'
import { enUS } from '@mui/material/locale'
import { noop } from 'lodash-unified'
import { PersonaHomeUI } from './extension/popups/pages/Personas/Home/UI'
import { useClassicMaskFullPageTheme } from './utils/useClassicMaskFullPageTheme'
import { initReactI18next } from 'react-i18next'
import { addMaskI18N } from '../shared-ui/locales/languages'
import {
    FacebookColoredIcon,
    InstagramColoredIcon,
    MindsIcon,
    TwitterColoredIcon,
    OpenSeaColoredIcon,
} from '@masknet/icons'
import type { MergedProfileInformation } from './extension/popups/pages/Personas/components/ProfileList'
import { PopupFrame } from './extension/popups/components/PopupFrame'
import { StaticRouter } from 'react-router-dom/server'

initReactI18next.init(i18NextInstance)
addMaskI18N(i18NextInstance)

function useAlwaysLightTheme() {
    return useClassicMaskFullPageTheme(Appearance.light, [enUS, false])
}

const SOCIAL_MEDIA_ICON_MAPPING: Record<string, React.ReactNode> = {
    [EnhanceableSite.Twitter]: <TwitterColoredIcon />,
    [EnhanceableSite.Facebook]: <FacebookColoredIcon />,
    [EnhanceableSite.Minds]: <MindsIcon />,
    [EnhanceableSite.Instagram]: <InstagramColoredIcon />,
    [EnhanceableSite.OpenSea]: <OpenSeaColoredIcon />,
}
const DEFINED_SITES = [
    EnhanceableSite.Twitter,
    EnhanceableSite.Facebook,
    EnhanceableSite.Minds,
    EnhanceableSite.Instagram,
    EnhanceableSite.OpenSea,
]
export function PopupSSR() {
    const i: PersonaInformation = {
        identifier: new ECKeyIdentifier('secp256k1', 'abc'),
        linkedProfiles: [
            {
                identifier: new ProfileIdentifier('secp256k1', 'abc'),
                nickname: 'Jack',
            },
        ],
    }
    const b: MergedProfileInformation[] = [
        {
            identifier: new ProfileIdentifier('twitter.com', 'jack'),
            nickname: 'Jack',
        },
    ]
    return (
        <StaticRouter location={PopupRoutes.Personas}>
            <ThemeProvider theme={useAlwaysLightTheme}>
                <PopupFrame personaLength={0}>
                    <PersonaHomeUI
                        currentPersona={i}
                        onChangeCurrentPersona={noop}
                        SOCIAL_MEDIA_ICON_MAPPING={SOCIAL_MEDIA_ICON_MAPPING}
                        definedSocialNetworks={DEFINED_SITES}
                        confirmLoading={false}
                        mergedProfiles={b}
                        onConnectNextID={noop}
                        onConfirmDisconnect={noop}
                        onDeletePersona={noop}
                        onDisconnectProfile={noop}
                        openProfilePage={noop}
                        onConnectProfile={noop}
                        personas={[i]}
                    />
                </PopupFrame>
            </ThemeProvider>
        </StaticRouter>
    )
}
