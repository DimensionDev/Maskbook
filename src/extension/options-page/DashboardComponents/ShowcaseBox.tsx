import React, { ReactElement } from 'react'
import { createStyles, Paper, Typography, makeStyles, TypographyProps } from '@material-ui/core'
import { selectElementContents } from '../../../utils/utils'

const useStyle = makeStyles((theme) =>
    createStyles({
        title: {
            fontSize: 12,
            lineHeight: 1.75,
            marginTop: theme.spacing(2),
        },
        paper: {
            height: '100%',
            border: `solid 1px ${theme.palette.divider}`,
            backgroundColor: theme.palette.type === 'light' ? '#FAFAFA' : '',
            boxShadow: 'none',
            padding: theme.spacing(2, 3),
        },
        scroller: {
            height: '100%',
            overflow: 'auto',
            wordBreak: 'break-all',
        },
    }),
)

export interface ShowcaseBoxProps {
    title?: string
    TitleProps?: TypographyProps<'h5'>
    ContentProps?: TypographyProps<'div'>
    children?: React.ReactNode
}

export default function ShowcaseBox(props: ShowcaseBoxProps) {
    const classes = useStyle()
    const { title, children, TitleProps, ContentProps } = props
    const ref = React.useRef<HTMLDivElement>(null)
    const copyText = () => selectElementContents(ref.current!)
    return (
        <>
            {title ? (
                <Typography className={classes.title} component="h5" {...TitleProps}>
                    {title}
                </Typography>
            ) : null}
            <Paper className={classes.paper}>
                <div className={classes.scroller}>
                    <Typography component="div" variant="body1" onClick={copyText} ref={ref} {...ContentProps}>
                        {children}
                    </Typography>
                </div>
            </Paper>
        </>
    )
}
