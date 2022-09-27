import { useEffect } from 'react'
import {
    Body,
    ColumnContentLayout,
    Footer,
    PersonaLogoBox,
    SignUpAccountLogo,
} from '../../../components/RegisterFrame/ColumnContentLayout.js'
import { useNavigate } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import { Header } from '../../../components/RegisterFrame/ColumnContentHeader.js'
import { useDashboardI18N } from '../../../locales/index.js'
import { PersonaContext } from '../../Personas/hooks/usePersonaContext.js'
import { upperFirst } from 'lodash-unified'
import { Button, Stack } from '@mui/material'
import { SOCIAL_MEDIA_ICON_MAPPING } from '@masknet/shared'
import { ActionCard } from '../../../components/ActionCard/index.js'

export const ConnectSocialMedia = () => {
    const navigate = useNavigate()
    const t = useDashboardI18N()
    const { currentPersona, connectPersona, definedSocialNetworks } = PersonaContext.useContainer()

    useEffect(() => {
        if (currentPersona && currentPersona?.linkedProfiles.length > 0) {
            navigate(DashboardRoutes.Personas, { replace: true })
        }
    }, [currentPersona])

    const handleConnect = async (networkIdentifier: string) => {
        if (currentPersona) {
            await connectPersona(currentPersona.identifier, networkIdentifier)
        }
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
                        <Button variant="text" onClick={() => navigate(DashboardRoutes.Setup)}>
                            {t.go_back()}
                        </Button>
                    </Stack>
                    {definedSocialNetworks.map(({ networkIdentifier }) => (
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
