import { useEffect } from 'react'
import {
    Body,
    ColumnContentLayout,
    Footer,
    SignUpAccountLogo,
} from '../../../components/RegisterFrame/ColumnContentLayout'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../../type'
import { Header } from '../../../components/RegisterFrame/ColumnContentHeader'
import { useDashboardI18N } from '../../../locales'
import { SetupActionCard } from '../../Setup'
import { PersonaContext } from '../../Personas/hooks/usePersonaContext'
import { upperFirst } from 'lodash-es'
import { FacebookIcon, InstagramIcon, TwitterIcon } from '@masknet/icons'
import { Button, Stack } from '@material-ui/core'

// icons maping
const ICON_MAPPING = [
    {
        type: 'facebook.com',
        icon: <FacebookIcon />,
    },
    {
        type: 'twitter.com',
        icon: <TwitterIcon />,
    },
    {
        type: 'instagram.com',
        icon: <InstagramIcon />,
    },
    {
        type: 'minds.com',
        icon: <InstagramIcon />,
    },
]
export const ConnectSocialMedia = () => {
    const navigate = useNavigate()
    const t = useDashboardI18N()
    const { currentPersona, connectPersona } = PersonaContext.useContainer()

    useEffect(() => {
        if (currentPersona && currentPersona?.linkedProfiles.length > 0) {
            navigate(RoutePaths.Personas, { replace: true })
        }
    }, [currentPersona])

    const handleConnect = (networkIdentifier: string) => {
        if (currentPersona) {
            connectPersona(currentPersona.identifier, networkIdentifier)
        }
    }

    return (
        <ColumnContentLayout>
            <Header
                title={t.create_account_connect_social_media_title()}
                subtitle={t.create_account_persona_subtitle()}
                action={{ name: t.create_account_sign_in_button(), callback: () => navigate(RoutePaths.Setup) }}
            />
            <Body>
                <SignUpAccountLogo />
                <div>
                    <Stack direction="row" justifyContent="flex-end" sx={{ marginBottom: (theme) => theme.spacing(4) }}>
                        <Button variant="text" onClick={() => {}}>
                            {t.go_back()}
                        </Button>
                    </Stack>
                    {ICON_MAPPING.map((d) => (
                        <SetupActionCard
                            key={d.type}
                            title={t.create_account_connect_social_media({ type: upperFirst(d.type) })}
                            icon={d.icon}
                            action={{
                                type: 'primary',
                                text: t.connect(),
                                handler: () => handleConnect(d.type),
                            }}
                        />
                    ))}
                </div>
            </Body>
            <Footer />
        </ColumnContentLayout>
    )
}
