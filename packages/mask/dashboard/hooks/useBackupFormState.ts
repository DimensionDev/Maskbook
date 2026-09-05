import { zodResolver } from '@hookform/resolvers/zod'
import { useLingui } from '@lingui/react/macro'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { UserContext } from '../../shared-ui/index.js'
import { passwordRegexp } from '../utils/regexp.js'

export interface BackupFormInputs {
    backupPassword: string
}

export function useBackupFormState() {
    const { t } = useLingui()
    const { user } = UserContext.useContainer()

    const formState = useForm<BackupFormInputs>({
        mode: 'onBlur',
        context: {
            user,
        },
        defaultValues: {
            backupPassword: '',
        },
        resolver: zodResolver(
            z.object({
                backupPassword: z
                    .string()
                    .min(8, t`Incorrect Password`)
                    .max(20, t`Incorrect Password`)
                    .refine((password) => password === user.backupPassword, t`Incorrect Backup Password`)
                    .refine((password) => passwordRegexp.test(password), t`Incorrect Password`),
            }),
        ),
    })

    return {
        formState,
    }
}
