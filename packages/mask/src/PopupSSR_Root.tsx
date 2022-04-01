import { EnhanceableSite, PopupRoutes } from '@masknet/shared-base'
import { noop } from 'lodash-unified'
import { Appearance, MaskThemeProvider } from '@masknet/theme'
import { enUS } from '@mui/material/locale'
import { StaticRouter } from 'react-router-dom/server'
import { PopupFrame } from './extension/popups/components/PopupFrame'
import { PersonaHomeUI } from './extension/popups/pages/Personas/Home/UI'
import { useClassicMaskFullPageTheme } from './utils/useClassicMaskFullPageTheme'
import {
    FacebookColoredIcon,
    InstagramColoredIcon,
    MindsIcon,
    TwitterColoredIcon,
    OpenSeaColoredIcon,
} from '@masknet/icons'
import type { PopupSSR_Props } from '../background/tasks/Cancellable/PopupSSR/type'
import { Suspense } from 'react'

const SOCIAL_MEDIA_ICON_MAPPING: Record<string, React.ReactNode> = {
    [EnhanceableSite.Facebook]: <FacebookColoredIcon />,
    [EnhanceableSite.Twitter]: <TwitterColoredIcon />,
    [EnhanceableSite.Instagram]: <InstagramColoredIcon />,
    [EnhanceableSite.Minds]: <MindsIcon />,
    [EnhanceableSite.OpenSea]: <OpenSeaColoredIcon />,
}
const DEFINED_SITES = [
    EnhanceableSite.Facebook,
    EnhanceableSite.Twitter,
    EnhanceableSite.Instagram,
    EnhanceableSite.Minds,
    EnhanceableSite.OpenSea,
]
function useAlwaysLightTheme() {
    return useClassicMaskFullPageTheme(Appearance.light, [enUS, false])
}
export function PopupSSR(props: PopupSSR_Props) {
    const currentPersona = props.personas?.find((x) => x.identifier.equals(props.currentPersona))
    return (
        <StaticRouter location={PopupRoutes.Personas}>
            <MaskThemeProvider
                useTheme={useAlwaysLightTheme}
                baseline
                CustomSnackbarOffsetY={0}
                useMaskIconPalette={() => 'light'}>
                <Suspense fallback={null}>
                    <PopupFrame personaLength={props.personas?.length || 0}>
                        <Suspense fallback={null}>
                            <PersonaHomeUI
                                personas={props.personas}
                                profilesWithNextID={props.profilesWithNextID}
                                currentPersona={currentPersona}
                                confirmLoading={false}
                                SOCIAL_MEDIA_ICON_MAPPING={SOCIAL_MEDIA_ICON_MAPPING}
                                definedSocialNetworks={DEFINED_SITES}
                                onChangeCurrentPersona={noop}
                                onConnectNextID={noop}
                                onConfirmDisconnect={noop}
                                onDeletePersona={noop}
                                onDisconnectProfile={noop}
                                openProfilePage={noop}
                                onConnectProfile={noop}
                            />
                        </Suspense>
                    </PopupFrame>
                </Suspense>
            </MaskThemeProvider>
        </StaticRouter>
    )
}
