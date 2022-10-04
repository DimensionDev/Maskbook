import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils'
import { Icons } from '@masknet/icons'

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
    direct: {
        color: theme.palette.secondaryDivider,
    },
}))

interface PlaceholderProps {
    retry?: () => void
}

export function Placeholder(props: PlaceholderProps) {
    const { classes } = useStyles()
    const { t } = useI18N()

    return (
        <div className={classes.placeholder}>
            <Icons.EmptySimple size={36} className={classes.direct} />
        </div>
    )
}
