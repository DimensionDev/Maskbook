import { memo } from 'react'
import { Typography, useTheme } from '@mui/material'
import { useI18N } from '../../../../utils/index.js'
import { LoadingBase, makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        flex: 1,
        gap: 12,
        minHeight: 600,
        minWidth: 400,
    },
}))

export interface LoadingPlaceholderProps {
    title?: string
    titleColor?: string
    iconColor?: string
}

export const LoadingPlaceholder = memo((props: LoadingPlaceholderProps) => {
    const { t } = useI18N()
    const theme = useTheme()
    const { classes } = useStyles()

    return (
        <main className={classes.container}>
            <LoadingBase style={{ color: props.iconColor ?? theme.palette.maskColor.main }} />
            <Typography variant="caption" color={props.titleColor ?? theme.palette.maskColor.second}>
                {props.title ?? t('loading')}
            </Typography>
        </main>
    )
})
