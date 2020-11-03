import React from 'react'
import { makeStyles, Theme, createStyles, Typography, Card, ButtonBase, ButtonBaseProps } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../../components/custom-ui-helper'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            textAlign: 'center',
        },
        content: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing(4, 1),
        },
        logo: {
            width: 45,
            height: 45,
            marginBottom: theme.spacing(2),
        },
        name: {
            fontSize: 24,
            fontWeight: 500,
            marginBottom: theme.spacing(1),
        },
        description: {
            fontSize: 14,
            fontWeight: 300,
        },
    }),
)

export interface ProviderProps
    extends withClasses<
        KeysInferFromUseStyles<typeof useStyles> | 'root' | 'dialog' | 'backdrop' | 'container' | 'paper' | 'content'
    > {
    logo: React.ReactNode
    name: React.ReactNode
    description: React.ReactNode
    onClick?: () => void
    ButtonBaseProps?: Partial<ButtonBaseProps>
}

export function Provider(props: ProviderProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    return (
        <Card className={classes.root} variant="outlined" onClick={props.onClick}>
            <ButtonBase className={classes.content} {...props.ButtonBaseProps}>
                <div className={classes.logo}>{props.logo}</div>
                <Typography className={classes.name} variant="h3">
                    {props.name}
                </Typography>
                <Typography className={classes.description} color="textSecondary" variant="body2">
                    {props.description}
                </Typography>
            </ButtonBase>
        </Card>
    )
}
