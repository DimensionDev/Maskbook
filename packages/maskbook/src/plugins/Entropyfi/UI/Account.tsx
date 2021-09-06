import { DarkColor } from '@masknet/theme/constants'
import { Grid } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
    root: {
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
        backgroundColor: '#290b5a',
        textAlign: 'center',
        padding: theme.spacing(2),
    },
    refresh: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        padding: theme.spacing(1),
        fontSize: 'inherit',
    },
    progress: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        padding: theme.spacing(1),
    },
    totalDeposits: {
        display: 'flex',
        justifyContent: 'space-between',
        background: 'linear-gradient(334deg,#4c249f 28%,rgba(255,119,225,.9) 164%),#290b5a',
        padding: theme.spacing(2, 4),
        borderRadius: theme.spacing(1),
        marginBottom: theme.spacing(1),
        color: DarkColor.textSecondary,
    },
    noAccountPool: {
        padding: theme.spacing(2, 4),
        color: DarkColor.textSecondary,
    },
    missingPool: {
        padding: theme.spacing(2, 4),
        color: '#7458df',
    },
    missingPoolLink: {
        color: 'inherit',
        '&:hover': {
            color: '#ffffff',
        },
    },
    pools: {
        margin: theme.spacing(1, 0),
    },
}))

export function Account() {
    const { t } = useI18N()
    const { classes } = useStyles()

    return (
        <Grid container direction="column" className={classes.root}>
            <span> Account </span>
        </Grid>
    )
}
