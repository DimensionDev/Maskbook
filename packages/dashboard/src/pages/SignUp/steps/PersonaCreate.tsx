import { useState } from 'react'
import { useNavigate } from 'react-router'
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
import { SignUpRoutePath } from '../routePath'
import { useSnackbarCallback } from '@masknet/shared'
import { useCreatePersonaV2 } from '../../../hooks/useCreatePersonaV2'

export const PersonaCreate = () => {
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const createPersona = useCreatePersonaV2()
    const [personaName, setPersonaName] = useState('')

    // useEffect(() => {
    //     if (!loading && !identity) {
    //         navigate(RoutePaths.SignUp)
    //     }
    // }, [loading])

    const handleNext = useSnackbarCallback({
        executor: () => createPersona('', personaName),
        onSuccess: () => navigate(`${RoutePaths.SignUp}/${SignUpRoutePath.ConnectSocialMedial}`),
        onError: () => {
            navigate(`${RoutePaths.SignUp}`)
        },
        successText: t.create_account_persona_successfully(),
        deps: [],
    })

    return (
        <ColumnContentLayout>
            <Header
                title={t.create_account_persona_title()}
                subtitle={t.create_account_persona_subtitle()}
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
                        <Button color="secondary" onClick={() => navigate(-1)}>
                            Back
                        </Button>
                        <Button color="primary" onClick={handleNext} disabled={!personaName}>
                            Next
                        </Button>
                    </ButtonGroup>
                </div>
            </Body>
            <Footer />
        </ColumnContentLayout>
    )
}
