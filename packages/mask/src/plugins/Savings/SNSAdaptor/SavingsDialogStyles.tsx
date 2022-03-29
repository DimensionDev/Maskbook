import { makeStyles } from '@masknet/theme'

export const useStyles = makeStyles<{ isDashboard: boolean }>()((theme, { isDashboard }) => ({
    walletStatusBox: {
        width: 535,
        margin: '24px auto',
    },
    networkTab: {
        width: 535,
        margin: theme.spacing(1, 'auto', 2),
    },
    tableTabWrapper: {
        padding: theme.spacing(2),
    },
    indicator: {
        display: 'none',
    },
    tabPanel: {
        marginTop: theme.spacing(3),
    },
    content: {
        paddingTop: 0,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    savingsRoot: {
        width: 535,
        margin: 'auto',
    },
}))
