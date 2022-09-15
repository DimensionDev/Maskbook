import { Card, CardContent, CardHeader, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
const useStyles = makeStyles()((theme) => {
    return {
        root: {
            minHeight: 120,
            padding: 0,
            border: `solid 1px ${theme.palette.maskColor.publicLine}`,
            margin: `${theme.spacing(2)} auto`,
            marginBottom: theme.spacing(2),
            '&:first-child': {
                marginTop: 0,
            },
            '&:last-child': {
                marginBottom: 0,
            },
            background: '#fff',
        },
        header: {
            borderBottom: `solid 1px ${theme.palette.maskColor.publicLine}`,
        },
        content: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            justifyContent: 'center',
            alignContent: 'center',
            '&:last-child': {
                paddingBottom: 16,
            },
        },
        title: {
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.maskColor.dark,
            fontWeight: 'bold',
            fontSize: 18,
        },
    }
})

export interface SnapshotCardProps {
    title: (JSX.Element & React.ReactNode) | string
    children?: React.ReactNode
}

export function SnapshotCard(props: SnapshotCardProps) {
    const { title, children } = props

    const { classes } = useStyles()
    return (
        <Card className={classes.root} variant="outlined">
            <CardHeader className={classes.header} title={<Typography className={classes.title}>{title}</Typography>} />
            <CardContent className={classes.content}>{children}</CardContent>
        </Card>
    )
}
