import { type Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { base } from '../base'
import { useMemo, Suspense } from 'react'
import { Skeleton } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { PostInspector } from './PostInspector'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { parseURL } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => {
    return {
        skeleton: {
            margin: theme.spacing(2),
            '&:first-child': {
                marginTop: theme.spacing(3),
            },
        },
    }
})

const isSnapshotURL = (x: string): boolean =>
    /^https:\/\/(?:www.)?snapshot.(org|page)\/#\/(.*?)\/proposal\/[\dA-Za-z]+$/.test(x)

function Renderer({ url }: { url: string }) {
    const { classes } = useStyles()
    usePluginWrapper(true)
    const fallbackUI = Array.from({ length: 2 })
        .fill(0)
        .map((_, i) => (
            <Skeleton
                key={i}
                className={classes.skeleton}
                animation="wave"
                variant="rectangular"
                width={i === 0 ? '80%' : '60%'}
                height={15}
            />
        ))
    return (
        <Suspense fallback={fallbackUI}>
            <PostInspector url={url} />
        </Suspense>
    )
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Component(props): JSX.Element | null {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURL(x.val).find(isSnapshotURL)
        }, [props.message])
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component(): JSX.Element | null {
        const links = usePostInfoDetails.mentionedLinks()

        const link = links.find(isSnapshotURL)
        if (!link) return null
        return <Renderer url={link} />
    },
}

export default sns
