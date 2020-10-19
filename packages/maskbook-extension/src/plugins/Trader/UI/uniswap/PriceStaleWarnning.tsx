import React from 'react'
import { Paper, Box, Typography, Button, makeStyles, createStyles, Theme } from '@material-ui/core'
import WarningIcon from '@material-ui/icons/Warning'
import { useStylesExtends } from '../../../../components/custom-ui-helper'

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        root: {
            margin: theme.spacing(2, 'auto'),
            padding: theme.spacing(1),
        },
        icon: {
            marginRight: theme.spacing(1),
        },
        type: {
            display: 'flex',
        },
    })
})

export interface PriceStaleWarnningProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    onAccept(): void
}

export function PriceStaleWarnning(props: PriceStaleWarnningProps) {
    const { onAccept } = props
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Paper className={classes.root} variant="outlined">
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography className={classes.type} color="primary">
                    <WarningIcon className={classes.icon} />
                    <span>Price Updated</span>
                </Typography>
                <Button variant="text" color="primary" onClick={onAccept}>
                    Accept
                </Button>
            </Box>
        </Paper>
    )
}
