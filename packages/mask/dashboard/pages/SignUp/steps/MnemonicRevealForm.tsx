import { memo, useCallback, useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Stack, Box, IconButton, FormControlLabel, Checkbox } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Refresh as RefreshIcon, Print as PrintIcon } from '@mui/icons-material'
import { Icons } from '@masknet/icons'
import { MaskColorVar, useCustomSnackbar } from '@masknet/theme'
import { DashboardRoutes, type ECKeyIdentifier } from '@masknet/shared-base'
import { Header } from '../../../components/RegisterFrame/ColumnContentHeader.js'
import { PersonaLogoBox, SignUpAccountLogo } from '../../../components/RegisterFrame/ColumnContentLayout.js'
import { useDashboardI18N } from '../../../locales/index.js'
import { MnemonicReveal } from '../../../components/Mnemonic/index.js'
import { SignUpRoutePath } from '../routePath.js'
import { ButtonContainer } from '../../../components/RegisterFrame/ButtonContainer.js'
import { useMnemonicWordsPuzzle } from '../../../hooks/useMnemonicWordsPuzzle.js'
import { useCreatePersonaV2 } from '../../../hooks/useCreatePersonaV2.js'
import Services from '#services'
import { PreviewDialog } from './PreviewDialog.js'

const ColumnContentLayout = styled('div')`
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
`

const Body = styled('main')(({ theme }) => ({
    flex: '1 5',
    width: '78%',
    [theme.breakpoints.down('md')]: {
        width: '95%',
    },
}))

export const MnemonicRevealForm = memo(() => {
    const createPersona = useCreatePersonaV2()

    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { state } = useLocation() as {
        state: {
            personaName: string
        }
    }
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
    const [checked, setChecked] = useState(false)

    const changeCurrentPersona = useCallback(Services.Settings.setCurrentPersonaIdentifier, [])

    const create = async () => {
        try {
            const identifier = await createPersona(words.join(' '), state.personaName)
            setId(identifier)
            const privateKey = await Services.Backup.backupPersonaPrivateKey(identifier)
            setPrivateKey(privateKey || '')

            await changeCurrentPersona(identifier)
        } catch (error) {
            showSnackbar((error as Error).message, { variant: 'error' })
        }
    }

    const onConfirm = async () => {
        if (!id) await create()
        navigate(`${DashboardRoutes.SignUp}/${SignUpRoutePath.ConnectSocialMedia}`)
    }

    const onPreview = async (type: 'print' | 'download') => {
        if (!id) await create()

        setPreview({
            open: true,
            type,
        })
    }

    useEffect(() => {
        // handle refresh words
        if (!id) return

        setId(null)
        Services.Identity.deletePersona(id, 'delete even with private')
    }, [words])

    useAsync(async () => {
        // handle refresh page after create
        const personas = await Services.Identity.queryOwnedPersonaInformation(true)
        const persona = personas.find((p) => p.nickname === state.personaName)
        if (!persona) return

        await Services.Identity.deletePersona(persona.identifier, 'delete even with private')
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
                            <Button
                                variant="text"
                                startIcon={<RefreshIcon color="primary" style={{ fill: '#1C68F3' }} />}
                                onClick={refreshCallback}>
                                {t.refresh()}
                            </Button>
                        </Stack>
                        <MnemonicReveal words={words} />
                        <FormControlLabel
                            control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />}
                            label={t.create_account_mnemonic_download_or_print()}
                            sx={{ marginTop: '8px', color: MaskColorVar.textSecondary }}
                        />
                        <ButtonContainer>
                            <Button
                                size="large"
                                variant="rounded"
                                color="primary"
                                onClick={onConfirm}
                                disabled={!checked}>
                                {t.next()}
                            </Button>
                            <IconButton onClick={() => onPreview('print')}>
                                <PrintIcon
                                    style={{ stroke: MaskColorVar.textLink, fill: MaskColorVar.primaryBackground }}
                                />
                            </IconButton>
                            <IconButton onClick={() => onPreview('download')}>
                                <Icons.Download color="MaskColorVar.textLink" />
                            </IconButton>
                        </ButtonContainer>
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
