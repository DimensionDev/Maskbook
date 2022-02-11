import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useRemarkable } from './hooks/useRemarkable'

const useStyles = makeStyles()((theme) => ({
    root: {
        color: 'inherit',
        fontSize: 'inherit',
        fontFamily: 'sans-serif',
        '& p, & li': {
            margin: 0,
            fontSize: 12,
        },
        '& p + p': {
            marginTop: theme.spacing(0.5),
        },
        '& h1, & h2, & h3, & h4, & h5, & h6': {
            fontSize: 14,
        },
        '& img': {
            maxWidth: '100%',
        },
        '& a': {
            color: theme.palette.text.primary,
        },
    },
}))

export interface MarkdownProps extends withClasses<'root'> {
    content: string
}

export function Markdown(props: MarkdownProps) {
    const classes = useStylesExtends(useStyles(), props)
    const html = useRemarkable(props.content)
    return <div dangerouslySetInnerHTML={{ __html: html }} className={classes.root} />
}
