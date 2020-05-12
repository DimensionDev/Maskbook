import React from 'react'
import { Typography, Divider, IconButton } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { useI18N } from '../../../utils/i18n-next-ui'

import LinkOffIcon from '@material-ui/icons/LinkOff'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import { useStylesExtends } from '../../../components/custom-ui-helper'

const useStyles = makeStyles((theme) =>
    createStyles({
        title: {
            fontWeight: 500,
            fontSize: 12,
            lineHeight: 1.75,
        },
        text: {
            fontSize: 14,
            lineHeight: '24px',
            borderBottom: `solid 1px ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(1, 2),
            '& > :first-child': {
                flex: '1 1 auto',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
            },
            '& > :last-child': {
                flex: '0 0 auto',
            },
        },
        cursor: {
            cursor: 'pointer',
        },
        control: {
            marginBottom: theme.spacing(2),
        },
    }),
)

export interface ProviderLineProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    network: string
    connected?: boolean
    userId?: string
    onAction?: () => void
}

export default function ProviderLine(props: ProviderLineProps) {
    const { t } = useI18N()
    const { network, connected, userId, onAction } = props
    const classes = useStylesExtends(useStyles(), props)

    return (
        <div className={classes.control}>
            <Typography className={classes.title} variant="body2" color="textSecondary">
                {network}
            </Typography>
            <Typography
                className={classNames(classes.text, { [classes.cursor]: !connected })}
                color="primary"
                variant="body1"
                component="a"
                onClick={connected ? undefined : onAction}>
                <span title={connected ? `@${userId}` : undefined}>
                    {connected ? `@${userId}` : `${t('connect_to')} ${network}`}
                </span>
                {connected ? (
                    <IconButton size="small" onClick={onAction} className={classes.cursor}>
                        <LinkOffIcon />
                    </IconButton>
                ) : (
                    <IconButton color="inherit" size="small">
                        <ArrowForwardIcon />
                    </IconButton>
                )}
            </Typography>
        </div>
    )
}
