import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { MaskTextField } from '@masknet/theme'
import {
    Body,
    ColumnContentLayout,
    Footer,
    SignUpAccountLogo,
} from '../../../components/RegisterFrame/ColumnContentLayout'
import { RoutePaths } from '../../../type'
import { Header } from '../../../components/RegisterFrame/ColumnContentHeader'
import { Button } from '@material-ui/core'
import { ButtonGroup } from '../components/ActionGroup'
import { useDashboardI18N } from '../../../locales'
import { useCreatePersonaV2 } from '../../Personas/hooks/useCreatePersonaV2'
import { SignUpRoutePath } from '../routePath'
import { useSnackbarCallback } from '@masknet/shared'

export const PersonaCreate = () => {
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const location = useLocation() as { state: { words: string[] } }
    const createPersona = useCreatePersonaV2()
    const [personaName, setPersonaName] = useState('')

    const handleNext = useSnackbarCallback({
        executor: () => createPersona(location.state?.words?.join(' ') ?? '', personaName),
        onSuccess: () => navigate(`${RoutePaths.SignUp}/${SignUpRoutePath.ConnectSocialMedial}`),
        onError: () => {
            navigate(`${RoutePaths.SignUp}`)
        },
        deps: [],
    })

    return (
        <ColumnContentLayout>
            <Header
                title={t.create_account_identity_title()}
                action={{ name: t.create_account_sign_in_button(), callback: () => navigate(RoutePaths.Login) }}
            />
            <Body>
                <SignUpAccountLogo />
                <div>
                    <MaskTextField
                        required
                        label="Name"
                        variant="filled"
                        InputProps={{ disableUnderline: true }}
                        onChange={(e) => setPersonaName(e.currentTarget.value)}
                    />
                    <ButtonGroup>
                        <Button color={'secondary'} onClick={() => navigate(-1)}>
                            Back
                        </Button>
                        <Button color={'primary'} onClick={handleNext} disabled={!personaName}>
                            Next
                        </Button>
                    </ButtonGroup>
                </div>
            </Body>
            <Footer />
        </ColumnContentLayout>
    )
}
