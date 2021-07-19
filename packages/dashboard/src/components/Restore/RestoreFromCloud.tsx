import { memo } from 'react'
import { useDashboardI18N } from '../../locales'
import { MaskColorVar } from '@masknet/theme'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import { makeStyles } from '@material-ui/core'
import { MaskAlert } from '../MaskAlert'
import { Code } from './code'

const Container = styled('div')`
    width: 100%;
`

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
    alter: {
        marginTop: theme.spacing(6),
        width: '100%',
    },
}))

export const RestoreFromCloud = memo(() => {
    const t = useDashboardI18N()
    const classes = useStyles()

    return (
        <>
            <Container>
                <Code />
            </Container>
            <div className={classes.alter}>
                <MaskAlert description={t.sign_in_account_cloud_backup_warning()} />
            </div>
        </>
    )
})
