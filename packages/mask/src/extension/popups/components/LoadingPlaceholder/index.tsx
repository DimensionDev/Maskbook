import { memo } from 'react'
import { LoadingIcon } from '@masknet/icons'
import { Typography } from '@mui/material'
import { useI18N } from '../../../../utils'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        flex: 1,
        gap: 12,
    },
}))

export const LoadingPlaceholder = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()

    return (
        <main className={classes.container}>
            <LoadingIcon style={{ color: '#1C68F3' }} />
            <Typography variant="caption" color="#A6A9B6">
                {t('loading')}
            </Typography>
        </main>
    )
})
