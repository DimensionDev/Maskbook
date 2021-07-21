import { memo } from 'react'
import { useDashboardI18N } from '../../locales'
import { MaskColorVar } from '@masknet/theme'
import { Container, makeStyles } from '@material-ui/core'
import { MaskAlert } from '../MaskAlert'
import { CodeValidation } from './CodeValidation'

const useStyles = makeStyles((theme) => ({
    root: {
        border: `solid 1px ${theme.palette.divider}`,
        width: '100%',
        height: 176,
        borderRadius: 4,
        background: MaskColorVar.secondaryContrastText.alpha(0.15),
    },
    file: {
        display: 'none',
    },
}))

export const RestoreFromCloud = memo(() => {
    const t = useDashboardI18N()
    const classes = useStyles()

    return (
        <>
            <Container>
                <CodeValidation />
            </Container>
            <Container sx={{ marginTop: '35px' }}>
                <MaskAlert description={t.sign_in_account_cloud_backup_warning()} />
            </Container>
        </>
    )
})
