import { makeStyles } from "@material-ui/core"
import { useRemarkable } from "../hooks/useRemarkable"

const useStyles = makeStyles(() => ({
    root: {
        fontFamily: 'sans-serif',
    }
}))

export interface MarkdownProps {
    content: string
}

export function Markdown(props: MarkdownProps) {
    const classes = useStyles()
    const html = useRemarkable(props.content)
    return <div dangerouslySetInnerHTML={{__html: html}} className={classes.root}></div>
}
