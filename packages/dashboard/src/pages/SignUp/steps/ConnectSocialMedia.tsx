import { useEffect } from 'react'
import {
    Body,
    ColumnContentLayout,
    Footer,
    SignUpAccountLogo,
} from '../../../components/RegisterFrame/ColumnContentLayout'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../../type'
import { Header } from '../../../components/RegisterFrame/ColumnContentHeader'
import { useDashboardI18N } from '../../../locales'
import { PersonaContext } from '../../Personas/hooks/usePersonaContext'
import { upperFirst } from 'lodash-es'
import { Button, Stack } from '@material-ui/core'
import { SOCIAL_MEDIA_ICON_MAPPING } from '@masknet/shared'
import { ActionCard } from '../../../components/ActionCard'

export const ConnectSocialMedia = () => {
    const navigate = useNavigate()
    const t = useDashboardI18N()
    const { currentPersona, connectPersona, definedSocialNetworks } = PersonaContext.useContainer()

    useEffect(() => {
        if (currentPersona && currentPersona?.linkedProfiles.length > 0) {
            navigate(RoutePaths.Personas, { replace: true })
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
                action={{ name: t.create_account_sign_in_button(), callback: () => navigate(RoutePaths.SignIn) }}
            />
            <Body>
                <SignUpAccountLogo />
                <div>
                    <Stack direction="row" justifyContent="flex-end" sx={{ marginBottom: (theme) => theme.spacing(4) }}>
                        <Button variant="text" onClick={() => navigate(RoutePaths.Setup)}>
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
