import { Plugin, usePostInfoDetails, usePluginWrapper } from '@masknet/plugin-infra'
import { base } from '../base'
import { useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { parseURL, extractTextFromTypedMessage } from '@masknet/shared-base'
import Profile from './Profile'

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

const isCyberConnectUrl = (x: string): boolean => x.includes('app.cyberconnect.me')

function Renderer({ url }: { url: string }) {
    usePluginWrapper(true)
    return <Profile url={url} />
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Component(props): JSX.Element | null {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURL(x.val).find(isCyberConnectUrl)
        }, [props.message])
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component(): JSX.Element | null {
        const link = usePostInfoDetails.mentionedLinks().find(isCyberConnectUrl)
        if (!link) return null
        return <Renderer url={link} />
    },
}

export default sns
