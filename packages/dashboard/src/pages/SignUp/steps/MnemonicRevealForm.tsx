import { memo, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Stack, Box, IconButton } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { MaskColorVar, useCustomSnackbar } from '@masknet/theme'
import { DashboardRoutes, ECKeyIdentifier } from '@masknet/shared-base'
import { MaskAlert } from '../../../components/MaskAlert'
import { Header } from '../../../components/RegisterFrame/ColumnContentHeader'
import {
    Body,
    ColumnContentLayout,
    PersonaLogoBox,
    SignUpAccountLogo,
} from '../../../components/RegisterFrame/ColumnContentLayout'
import { useDashboardI18N } from '../../../locales'
import { MnemonicReveal } from '../../../components/Mnemonic'
import { SignUpRoutePath } from '../routePath'
import { ButtonContainer } from '../../../components/RegisterFrame/ButtonContainer'
import { useMnemonicWordsPuzzle } from '../../../hooks/useMnemonicWordsPuzzle'
import { useCreatePersonaV2 } from '../../../hooks/useCreatePersonaV2'
import { PersonaContext } from '../../Personas/hooks/usePersonaContext'
import { Services } from '../../../API'
import PrintIcon from '@mui/icons-material/Print'
import { PreviewDialog } from './PreviewDialog'
import { DownloadIcon } from '@masknet/icons'

export const MnemonicRevealForm = memo(() => {
    const createPersona = useCreatePersonaV2()
    const { changeCurrentPersona } = PersonaContext.useContainer()
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { state } = useLocation() as { state: { personaName: string } }
    const { showSnackbar } = useCustomSnackbar()
    const { words, refreshCallback } = useMnemonicWordsPuzzle()
    const [preview, setPreview] = useState<{
        open: boolean
        type: 'print' | 'download'
    }>({
        open: false,
        type: 'print',
    })
    const [id, setId] = useState<ECKeyIdentifier | null>(null)
    const [privateKey, setPrivateKey] = useState('')

    const create = async () => {
        try {
            const identifier = await createPersona(words.join(' '), state.personaName)
            setId(identifier)
            const privateKey = await Services.Identity.exportPersonaPrivateKey(identifier)
            setPrivateKey(privateKey)

            await changeCurrentPersona(identifier)
        } catch (error) {
            showSnackbar((error as Error).message, { variant: 'error' })
        }
    }

    const onConfirm = async () => {
        if (!id) {
            await create()
        }

        navigate(`${DashboardRoutes.SignUp}/${SignUpRoutePath.ConnectSocialMedia}`)
    }

    const onPreview = async (type: 'print' | 'download') => {
        if (!id) {
            await create()
        }

        setPreview({
            open: true,
            type,
        })
    }

    useEffect(() => {
        // handle refresh words
        if (id) {
            Services.Identity.deletePersona(id, 'delete even with private')
        }
    }, [words])

    useEffect(() => {
        // handle refresh page after create
        const pageRefreshHandler = async () => {
            const personas = await Services.Identity.queryMyPersonas()
            for (let i in personas) {
                if (personas[i].nickname === state.personaName) {
                    const id = personas[i].identifier
                    Services.Identity.deletePersona(id, 'delete even with private')
                    break
                }
            }
        }

        pageRefreshHandler()
    }, [])

    return (
        <>
            <ColumnContentLayout>
                <Header
                    title={t.create_account_identity_title()}
                    action={{
                        name: t.create_account_sign_in_button(),
                        callback: () => navigate(DashboardRoutes.SignIn),
                    }}
                />
                <Body>
                    <PersonaLogoBox>
                        <SignUpAccountLogo />
                    </PersonaLogoBox>

                    <Box>
                        <Stack
                            direction="row"
                            justifyContent="flex-end"
                            sx={{ marginBottom: (theme) => theme.spacing(2) }}>
                            <Button variant="text" startIcon={<RefreshIcon />} onClick={refreshCallback}>
                                {t.refresh()}
                            </Button>
                        </Stack>
                        <MnemonicReveal words={words} />
                        <ButtonContainer>
                            <Button size="large" variant="rounded" color="primary" onClick={onConfirm}>
                                {t.create_account_mnemonic_download_or_print()}
                            </Button>
                            <IconButton onClick={() => onPreview('print')}>
                                <PrintIcon
                                    style={{ stroke: MaskColorVar.textLink, fill: MaskColorVar.primaryBackground }}
                                />
                            </IconButton>
                            <IconButton onClick={() => onPreview('download')}>
                                <DownloadIcon
                                    color="primary"
                                    style={{ stroke: MaskColorVar.textLink, fill: MaskColorVar.primaryBackground }}
                                />
                            </IconButton>
                        </ButtonContainer>
                    </Box>

                    <Box sx={{ pt: 4, pb: 2, width: '100%' }}>
                        <MaskAlert description={t.create_account_identity_warning()} type="info" />
                    </Box>
                </Body>
            </ColumnContentLayout>
            <PreviewDialog
                type={preview.type}
                open={preview.open}
                onClose={() => setPreview({ ...preview, open: false })}
                personaName={state.personaName}
                id={id?.toText()}
                words={words}
                privateKey={privateKey}
            />
        </>
    )
})
