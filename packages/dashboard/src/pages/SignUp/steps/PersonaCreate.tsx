import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { MaskTextField, useSnackbar } from '@masknet/theme'
import {
    Body,
    ColumnContentLayout,
    Footer,
    SignUpAccountLogo,
} from '../../../components/RegisterFrame/ColumnContentLayout'
import { RoutePaths } from '../../../type'
import { MaskAlert } from '../../../components/MaskAlert'
import { Header } from '../../../components/RegisterFrame/ColumnContentHeader'
import { Button } from '@material-ui/core'
import { ButtonGroup } from '../components/ActionGroup'
import { useDashboardI18N } from '../../../locales'
import { useCreatePersonaV2 } from '../../Personas/hooks/useCreatePersonaV2'
import { SignUpRoutePath } from '../routePath'

export const PersonaCreate = () => {
    const { enqueueSnackbar } = useSnackbar()
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const location = useLocation() as { state: { words: string[] } }
    const [, createPersona] = useCreatePersonaV2()
    const [personaName, setPersonaName] = useState('')

    const handleNext = async () => {
        await createPersona(location.state?.words?.join(' ') ?? '', personaName)
        navigate(`${RoutePaths.SignUp}/${SignUpRoutePath.ConnectSocialMedial}`)
    }

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
                        label="Name"
                        variant="filled"
                        InputProps={{ disableUnderline: true }}
                        onChange={(e) => setPersonaName(e.currentTarget.value)}
                    />
                    <ButtonGroup>
                        <Button color={'secondary'}>Back</Button>
                        <Button color={'primary'} onClick={handleNext}>
                            Next
                        </Button>
                    </ButtonGroup>
                </div>
                <MaskAlert description={t.create_account_identity_warning()} type={'error'} />
            </Body>
            <Footer></Footer>
        </ColumnContentLayout>
    )
}
