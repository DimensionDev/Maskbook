import * as React from 'react'
import { getUrl } from '../../utils/utils'
import { makeStyles, Typography, Link, Card } from '@material-ui/core'
import anchorme from 'anchorme'
import { useStylesExtends } from '../custom-ui-helper'
import classNames from 'classnames'

export interface AdditionalContentProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    title: React.ReactNode
    children?: React.ReactNode
    center?: boolean
    renderText?: string
    hideIcon?: boolean
}
const useStyles = makeStyles({
    root: { backgroundColor: 'transparent' },
    title: { display: 'flex', alignItems: 'center' },
    center: { justifyContent: 'center' },
    icon: { transform: 'translate(-1px, 0)' },
})
export const AdditionalContent = React.memo(function AdditionalContent(props: AdditionalContentProps) {
    const classes = useStylesExtends(useStyles(), props)
    const icon = getUrl('/maskbook-icon-padded.png')
    const stop = React.useCallback((ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => ev.stopPropagation(), [])
    return (
        <Card className={classes.root} elevation={0} onClick={stop}>
            <Typography
                variant="caption"
                color="textSecondary"
                gutterBottom
                className={classNames(classes.title, { [classes.center]: props.center })}>
                {props.hideIcon ? null : <img alt="" width={16} height={16} src={icon} className={classes.icon} />}
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
})

const RenderText = React.memo(function RenderText(props: { text: string }) {
    return <>{parseText(props.text)}</>
})

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
