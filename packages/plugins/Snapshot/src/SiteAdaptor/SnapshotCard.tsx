import { Card, CardContent, CardHeader, Skeleton, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { memo, useEffect, useRef, useState, useTransition } from 'react'
import { range } from 'lodash-es'
import { useIntersection } from 'react-use'

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
            background: theme.palette.maskColor.white,
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
            color: theme.palette.maskColor.publicMain,
            fontWeight: 'bold',
            fontSize: 18,
        },
    }
})

interface SnapshotCardProps {
    title: React.ReactNode
    children?: React.ReactNode
    lazy?: boolean
}

export const SnapshotCard = memo(function SnapshotCard(props: SnapshotCardProps) {
    const { title, children, lazy } = props
    const { classes } = useStyles()
    const ref = useRef<HTMLElement>(null)
    const [seen, setSeen] = useState(!lazy)
    const [isPending, setTransition] = useTransition()
    const ob = useIntersection(ref as any, {})
    useEffect(() => {
        if (ob?.isIntersecting) {
            setTransition(() => setSeen(true))
        }
    }, [ob?.isIntersecting])

    return (
        <Card className={classes.root} variant="outlined" ref={ref as any}>
            <CardHeader className={classes.header} title={<Typography className={classes.title}>{title}</Typography>} />
            {isPending ? range(6).map((i) => <Skeleton key={i} animation="wave" height={30} sx={{ m: 1 }} />) : null}
            {seen ?
                <CardContent className={classes.content}>{children}</CardContent>
            :   null}
        </Card>
    )
})
