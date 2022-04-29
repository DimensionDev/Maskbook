import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useI18N } from '../../../../utils'

const useStyles = makeStyles()((theme) => ({
    container: {
        width: '100%',
        backgroundColor: theme.palette.background.default,
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
    const { t } = useI18N()
    const { classes } = useStyles()
    return (
        <div className={classes.container}>
            <Typography>{t('plugin_tips_verify_line_intro')}</Typography>
            <CloseIcon className={classes.closeIcon} onClick={() => onClose()} />
        </div>
    )
}
