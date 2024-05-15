import { useNavigate } from 'react-router-dom'
import { upperFirst } from 'lodash-es'
import { DashboardRoutes, type EnhanceableSite } from '@masknet/shared-base'
import { Button, Stack } from '@mui/material'
import { PersonaContext, SOCIAL_MEDIA_ICON_MAPPING } from '@masknet/shared'
import {
    Body,
    ColumnContentLayout,
    Footer,
    PersonaLogoBox,
    SignUpAccountLogo,
} from '../../../components/RegisterFrame/ColumnContentLayout.js'
import { Header } from '../../../components/RegisterFrame/ColumnContentHeader.js'
import { useDashboardTrans } from '../../../locales/index.js'
import { ActionCard } from '../../../components/ActionCard/index.js'
import {
    requestPermissionFromExtensionPage,
    type SiteAdaptor,
    useSupportedSocialNetworkSites,
} from '../../../../shared-ui/index.js'
import Services from '#services'

export function Component() {
    const navigate = useNavigate()
    const t = useDashboardTrans()
    const { currentPersona } = PersonaContext.useContainer()

    const definedSocialNetworkAdaptors: SiteAdaptor[] = useSupportedSocialNetworkSites()

    const handleConnect = async (networkIdentifier: string) => {
        if (currentPersona) {
            if (!(await requestPermissionFromExtensionPage(networkIdentifier as EnhanceableSite))) return
            await Services.SiteAdaptor.connectSite(currentPersona.identifier, networkIdentifier)
        }
        navigate(DashboardRoutes.Personas, { replace: true })
    }

    return (
        <ColumnContentLayout>
            <Header
                title={t.create_account_connect_social_media_title()}
                subtitle={t.create_account_persona_subtitle()}
                action={{ name: t.create_account_sign_in_button(), callback: () => navigate(DashboardRoutes.SignIn) }}
            />
            <Body>
                <PersonaLogoBox>
                    <SignUpAccountLogo />
                </PersonaLogoBox>
                <div>
                    <Stack direction="row" justifyContent="flex-end" sx={{ marginBottom: (theme) => theme.spacing(4) }}>
                        <Button variant="text" onClick={() => navigate(DashboardRoutes.SignUpPersona)}>
                            {t.go_back()}
                        </Button>
                    </Stack>
                    {definedSocialNetworkAdaptors.map(({ networkIdentifier }) => (
                        <ActionCard
                            key={networkIdentifier}
                            title={t.create_account_connect_social_media({
                                type: upperFirst(networkIdentifier),
                            })}
                            icon={SOCIAL_MEDIA_ICON_MAPPING[networkIdentifier]}
                            action={{
                                type: 'primary',
                                text: t.connect(),
                                handler: () => handleConnect(networkIdentifier),
                            }}
                        />
                    ))}
                </div>
            </Body>
            <Footer />
        </ColumnContentLayout>
    )
}
