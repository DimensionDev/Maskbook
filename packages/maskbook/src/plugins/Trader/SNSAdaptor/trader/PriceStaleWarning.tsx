import { Paper, Box, Typography, Button } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import WarningIcon from '@mui/icons-material/Warning'
import { useStylesExtends } from '@masknet/shared'

const useStyles = makeStyles()((theme) => {
    return {
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
    }
})

export interface PriceStaleWarningProps extends withClasses<never> {
    onAccept(): void
}

export function PriceStaleWarning(props: PriceStaleWarningProps) {
    const { onAccept } = props
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Paper className={classes.root} variant="outlined">
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
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
