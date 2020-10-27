import React from 'react'
import { makeStyles, Theme, Typography, Link, useTheme } from '@material-ui/core'
import { useI18N } from '../../utils/i18n-next-ui'

const useStyle = makeStyles((theme: Theme) => ({
    text: {
        fontSize: 'inherit',
        marginLeft: theme.spacing(0.5),
        marginRight: theme.spacing(0.5),
    },
}))

export interface PayloadReplacerProps {
    payload: string
}

export function PayloadReplacer({ payload }: PayloadReplacerProps) {
    const { t } = useI18N()
    const classes = useStyle()
    const theme = useTheme()
    return (
        <Typography className={classes.text} color="textPrimary" component="span" variant="body1">
            <Link
                // HACK: !important inline style in react doesn't work, see stackoverflow.com/questions/23074748
                ref={(node) => {
                    if (node) {
                        node.style.setProperty('color', theme.palette.primary.main, 'important')
                    }
                }}
                href={
                    payload.startsWith('https://mask.io') || payload.startsWith('https://maskbook.com')
                        ? payload
                        : 'https://mask.io'
                }>
                {t('post_substitute_label')}
            </Link>
        </Typography>
    )
}
