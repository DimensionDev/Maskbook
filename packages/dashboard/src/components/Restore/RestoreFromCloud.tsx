import { memo } from 'react'
import { useDashboardI18N } from '../../locales'
import { Box } from '@material-ui/core'
import { MaskAlert } from '../MaskAlert'
import { CodeValidation } from './CodeValidation'

export const RestoreFromCloud = memo(() => {
    const t = useDashboardI18N()
    const onRestore = (downloadLink: string, password: string) => {}

    return (
        <>
            <Box sx={{ width: '100%' }}>
                <CodeValidation onRestore={onRestore} />
            </Box>
            <Box sx={{ marginTop: '35px', width: '100%' }}>
                <MaskAlert description={t.sign_in_account_cloud_backup_warning()} />
            </Box>
        </>
    )
})
