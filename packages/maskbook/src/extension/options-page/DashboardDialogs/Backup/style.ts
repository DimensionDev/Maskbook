import { createStyles, makeStyles, Theme } from '@material-ui/core'

export const useDatabaseStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
        },
        dashboardPreviewCardTable: {
            paddingLeft: 28,
            paddingRight: 28,
            marginTop: 2,
            marginBottom: 28,
        },
        buttonText: {
            color: '#fff',
        },
    }),
)
