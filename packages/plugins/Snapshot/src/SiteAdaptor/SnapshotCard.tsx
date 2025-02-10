import { Card, CardContent, CardHeader, Skeleton, Typography, type CardProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { memo, useEffect, useRef, useState, useTransition } from 'react'
import { range } from 'lodash-es'
import { useIntersection } from 'react-use'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            minHeight: 120,
            padding: 0,
            border: `solid 1px ${theme.palette.maskColor.line}`,
            margin: `${theme.spacing(2)} auto`,
            marginBottom: theme.spacing(2),
            '&:first-child': {
                marginTop: 0,
            },
            '&:last-child': {
                marginBottom: 0,
            },
            background: theme.palette.maskColor.bg,
        },
        header: {
            borderBottom: `solid 1px ${theme.palette.maskColor.line}`,
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
            color: theme.palette.maskColor.main,
            fontWeight: 'bold',
            fontSize: 18,
        },
    }
})

interface SnapshotCardProps extends Omit<CardProps, 'title'> {
    title: React.ReactNode
    lazy?: boolean
}

export const SnapshotCard = memo(function SnapshotCard({
    title,
    children,
    lazy,
    className,
    ...rest
}: SnapshotCardProps) {
    const { classes, cx } = useStyles()
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
        <Card className={cx(classes.root, className)} variant="outlined" ref={ref as any} {...rest}>
            <CardHeader className={classes.header} title={<Typography className={classes.title}>{title}</Typography>} />
            {isPending ? range(6).map((i) => <Skeleton key={i} animation="wave" height={30} sx={{ m: 1 }} />) : null}
            {seen ?
                <CardContent className={classes.content}>{children}</CardContent>
            :   null}
        </Card>
    )
})
