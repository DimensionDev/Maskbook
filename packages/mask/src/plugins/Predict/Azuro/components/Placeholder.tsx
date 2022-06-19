import { makeStyles } from '@masknet/theme'
import { DirectIcon } from '@masknet/icons'
import { useI18N } from '../../../../utils'
import Button from '@mui/material/Button'

const useStyles = makeStyles()((theme, props) => ({
    placeholder: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
        width: '100%',
    },
    icon: {
        fill: theme.palette.secondaryDivider,
        fontSize: 36,
    },
    retry: {
        fontSize: 14,
        color: theme.palette.text.primary,
        '&:hover': {
            background: 'none',
        },
    },
}))

interface PlaceholderProps {
    retry?: () => void
}

export function Placeholder(props: PlaceholderProps) {
    const { retry } = props
    const { classes } = useStyles()
    const { t } = useI18N()

    return (
        <div className={classes.placeholder}>
            <DirectIcon className={classes.icon} />
            {retry ? (
                <Button variant="text" className={classes.retry} onClick={() => retry()}>
                    {t('retry')}
                </Button>
            ) : null}
        </div>
    )
}
