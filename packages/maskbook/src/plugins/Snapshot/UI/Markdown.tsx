import { makeStyles } from '@material-ui/core'
import { useRemarkable } from '../hooks/useRemarkable'

const useStyles = makeStyles((theme) => ({
    root: {
        color: 'inherit',
        fontSize: 'inherit',
        fontFamily: 'sans-serif',
        '& p': {
            margin: 0,
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

export interface MarkdownProps {
    content: string
}

export function Markdown(props: MarkdownProps) {
    const classes = useStyles()
    const html = useRemarkable(props.content)
    return <div dangerouslySetInnerHTML={{ __html: html }} className={classes.root}></div>
}
