import { memo } from 'react'
import { CircleLoadingIcon } from '@masknet/icons'
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

export interface LoadingPlaceholderProps {
    title?: string
    titleColor?: string
    iconColor?: string
}

export const LoadingPlaceholder = memo((props: LoadingPlaceholderProps) => {
    const { t } = useI18N()
    const { classes } = useStyles()

    return (
        <main className={classes.container}>
            <CircleLoadingIcon style={{ color: props.iconColor ?? '#1C68F3' }} />
            <Typography variant="caption" color={props.titleColor ?? '#A6A9B6'}>
                {props.title ?? t('loading')}
            </Typography>
        </main>
    )
})
