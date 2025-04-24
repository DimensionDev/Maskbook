import { Card, CardContent, type CardProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { PropsWithChildren } from 'react'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: '100%',
            height: '100%',
            borderRadius: 0,
            overflow: 'auto',
            scrollbarWidth: 'none',
            '::-webkit-scrollbar': {
                display: 'none',
            },
        },
        overContent: {
            backgroundColor: theme.palette.maskColor.white,
            boxSizing: 'border-box',
            paddingBottom: '16px !important',
        },
    }
})

interface CollectibleCardProps extends withClasses<'root' | 'content'>, PropsWithChildren {
    CardProps?: Partial<CardProps>
}

export function CollectibleCard(props: CollectibleCardProps) {
    const { classes } = useStyles(undefined, { props })

    return (
        <Card className={classes.root} elevation={0} {...props.CardProps}>
            <CardContent className={classes.overContent}>{props.children}</CardContent>
        </Card>
    )
}
