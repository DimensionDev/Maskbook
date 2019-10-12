import * as React from 'react'
import { getUrl } from '../../utils/utils'
import { makeStyles, Divider, Typography, Link, Card, CardContent, CardActions, Button } from '@material-ui/core'
import anchorme from 'anchorme'

interface Props {
    title: React.ReactNode
    children?: React.ReactNode
    renderText?: string
}
const useStyles = makeStyles({
    upDivider: { marginBottom: 6 },
    title: { display: 'flex' },
    icon: { transform: 'translate(-1px, 1px)' },
    content: {
        marginBottom: 6,
        marginTop: 6,
        lineHeight: 1.2,
    },
})
export function AdditionalContent(props: Props) {
    const classes = useStyles()
    const icon = getUrl('/maskbook-icon-padded.png')
    return (
        <Card elevation={0}>
            <Typography variant="caption" color="textSecondary" gutterBottom className={classes.title}>
                <img alt="" width={16} height={16} src={icon} className={classes.icon} />
                {props.title}
            </Typography>
            {props.renderText ? (
                <Typography variant="body2" component="p">
                    <RenderText text={props.renderText} />
                </Typography>
            ) : (
                props.children
            )}
        </Card>
    )
}

function RenderText({ text }: { text: string }) {
    const content = React.useMemo(() => parseText(text), [text])
    return <>{content}</>
}
function parseText(string: string) {
    const links: { raw: string; protocol: string; encoded: string }[] = anchorme(string, { list: true })
    let current = string
    const result = []
    while (current.length) {
        const search1 = current.search('\n')
        const search2 = links[0] ? current.search(links[0].raw) : -1
        // ? if rest is normal
        if (search1 === -1 && search2 === -1) {
            result.push(current)
            break
        }
        // ? if rest have \n but no links
        if ((search1 < search2 && search1 !== -1) || search2 === -1) {
            result.push(current.substring(0, search1), <br key={current} />)
            current = current.substring(search1 + 1)
        }
        // ? if rest have links but no \n
        if ((search2 < search1 && search2 !== -1) || search1 === -1) {
            const link = links[0].protocol + links[0].encoded
            result.push(
                current.substring(0, search2),
                <Link target="_blank" href={link} key={link}>
                    {links[0].raw}
                </Link>,
            )
            current = current.substring(search2 + links[0].raw.length)
            links.shift()
        }
    }
    return result
}
