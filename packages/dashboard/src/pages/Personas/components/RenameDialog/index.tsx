import { FormEvent, memo, useCallback } from 'react'
import { MaskDialog, MaskTextField } from '@masknet/theme'
import { Button, DialogActions, DialogContent } from '@material-ui/core'
import { useDashboardI18N } from '../../../../locales'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PERSONA_NAME_MAX_LENGTH } from '../../../../utils'

export interface RenameDialogProps {
    open: boolean
    nickname?: string
    onClose: () => void
    onConfirm: (name: string) => void
}

type FormInputs = {
    nickname: string
}

export const RenameDialog = memo<RenameDialogProps>(({ open, nickname, onClose, onConfirm }) => {
    const t = useDashboardI18N()

    const schema = z.object({
        nickname: z
            .string()
            .max(PERSONA_NAME_MAX_LENGTH, t.personas_name_maximum_tips({ length: String(PERSONA_NAME_MAX_LENGTH) })),
    })

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors, isDirty, isValid },
    } = useForm<FormInputs>({
        resolver: zodResolver(schema),
        defaultValues: {
            nickname: nickname,
        },
    })

    const handleFormSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        handleSubmit((data) => onConfirm(data.nickname.trim()))(event).catch(() => {
            setError('nickname', {
                type: 'value',
                message: t.personas_name_existed(),
            })
        })
    }, [])

    return (
        <MaskDialog open={open} title={t.personas_rename()} onClose={onClose}>
            <form name="persona-rename-form" onSubmit={handleFormSubmit}>
                <DialogContent>
                    <Controller
                        control={control}
                        render={({ field }) => (
                            <MaskTextField
                                {...field}
                                placeholder={t.personas_rename_placeholder()}
                                style={{ width: '100%' }}
                                error={!!errors.nickname?.message}
                                helperText={errors.nickname?.message}
                                InputProps={{ disableUnderline: true }}
                            />
                        )}
                        name="nickname"
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={onClose}>
                        {t.personas_cancel()}
                    </Button>
                    <Button disabled={!isDirty || !isValid} type="submit">
                        {t.personas_confirm()}
                    </Button>
                </DialogActions>
            </form>
        </MaskDialog>
    )
})
