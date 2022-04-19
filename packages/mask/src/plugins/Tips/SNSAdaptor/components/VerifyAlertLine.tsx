import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

const useStyles = makeStyles()((theme) => ({
    container: {
        width: '100%',
        backgroundColor: theme.palette.text.secondary,
        color: theme.palette.text.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '9px 8px',
        boxSizing: 'border-box',
    },
    closeIcon: {
        cursor: 'pointer',
        marginRight: theme.spacing(1),
    },
}))

interface VerifyAlertLineProps {
    onClose: () => void
}

export function VerifyAlertLine({ onClose }: VerifyAlertLineProps) {
    const { classes } = useStyles()
    return (
        <div className={classes.container}>
            <Typography>Please add and verify your wallet to set the address for receiving tips.</Typography>
            <CloseIcon className={classes.closeIcon} onClick={() => onClose()} />
        </div>
    )
}
