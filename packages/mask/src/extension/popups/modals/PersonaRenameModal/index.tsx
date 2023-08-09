import { memo, useState } from 'react'
import { ActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { Box, TextField, Typography, useTheme } from '@mui/material'
import { useAsyncFn } from 'react-use'
import { PersonaContext } from '@masknet/shared'
import Services from '../../../service.js'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { ActionButton } from '@masknet/theme'
import { Icons } from '@masknet/icons'

export const PersonaRenameModal = memo<ActionModalBaseProps>(function PersonaRenameModal() {
    const { t } = useI18N()
    const theme = useTheme()
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const { currentPersona } = PersonaContext.useContainer()
    const navigate = useNavigate()

    const [{ loading }, handleClick] = useAsyncFn(async () => {
        if (!name || !currentPersona) return
        if (name.length > 24 || name.length < 1) {
            setError('popups_persona_rename_tips')
            return
        }

        try {
            await Services.Identity.renamePersona(currentPersona.identifier, name)
        } catch (error) {
            setError(t('popups_persona_persona_name_exists'))
            return
        }

        navigate(PopupRoutes.Personas, { replace: true })
    }, [name, currentPersona])

    return (
        <ActionModal
            header={t('popups_rename')}
            action={
                <ActionButton disabled={loading || !name.length || !!error} onClick={handleClick}>
                    {t('confirm')}
                </ActionButton>
            }>
            <Typography fontWeight={700} textAlign="center" color={theme.palette.maskColor.third}>
                {t('popups_persona_rename_tips')}
            </Typography>
            <Box display="flex" justifyContent="center" mx={0.5} mb={0.5}>
                <TextField
                    sx={{ mt: 4 }}
                    fullWidth
                    placeholder={currentPersona?.nickname}
                    error={!!error}
                    helperText={error}
                    value={name}
                    onChange={(e) => {
                        if (e.target.value.length > 24) return
                        if (error) setError('')
                        setName(e.target.value)
                    }}
                    InputProps={{
                        endAdornment: name.length ? (
                            <Icons.PopupClose
                                onClick={() => {
                                    setName('')
                                    setError('')
                                }}
                                size={18}
                                color={error ? theme.palette.maskColor.danger : undefined}
                            />
                        ) : null,
                        disableUnderline: true,
                    }}
                />
            </Box>
        </ActionModal>
    )
})
