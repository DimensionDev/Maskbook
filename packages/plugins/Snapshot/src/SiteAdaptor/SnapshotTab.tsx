import { Card, CardContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { PropsWithChildren } from 'react'
const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: '100%',
            borderRadius: 0,
            backgroundColor: theme.palette.maskColor.white,
            overflowY: 'auto',
            overflowX: 'hidden',
            height: 400,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        content: {
            padding: `${theme.spacing(2)} !important`,
        },
    }
})

export function SnapshotTab(props: PropsWithChildren) {
    const { classes } = useStyles()
    return (
        <Card className={classes.root} elevation={0}>
            <CardContent className={classes.content}>{props.children}</CardContent>
        </Card>
    )
}
