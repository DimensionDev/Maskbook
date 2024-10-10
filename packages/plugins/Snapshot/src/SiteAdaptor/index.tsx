import { type Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { base } from '../base.js'
import { useMemo, Suspense, type JSX } from 'react'
import { Skeleton } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { PostInspector } from './PostInspector.js'
import { SearchResultType, type DAOResult } from '@masknet/web3-shared-base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { parseURLs, PluginID } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'
import { ProfileView } from './ProfileView.js'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => {
    return {
        skeleton: {
            margin: theme.spacing(2),
            '&:first-of-type': {
                marginTop: theme.spacing(3),
            },
        },
    }
})

const isSnapshotURL = (x: string): boolean =>
    /^https:\/\/(?:www.)?snapshot.(org|page)\/#\/(.*?)\/proposal\/[\dA-Za-z]+$/.test(x)

export function Renderer({ url }: { url: string }) {
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

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    DecryptedInspector(props): JSX.Element | null {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.isNone()) return null
            return parseURLs(x.value).find(isSnapshotURL)
        }, [props.message])
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector(): JSX.Element | null {
        const links = usePostInfoDetails.mentionedLinks()

        const link = links.find(isSnapshotURL)
        if (!link) return null
        return <Renderer url={link} />
    },
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            description: <Trans>Display Snapshot proposals on the X of the respective project or protocol.</Trans>,
            tutorialLink: 'https://realmasknetwork.notion.site/10c08ed9629942dd852d9afbfab61208',
            name: <Trans>DAO</Trans>,
            marketListSortingPriority: 8,
            icon: <Icons.Snapshot size={36} />,
        },
    ],
    wrapperProps: {
        icon: <Icons.Snapshot size={24} style={{ filter: 'drop-shadow(0px 6px 12px rgba(255, 159, 10, 0.2))' }} />,
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(255, 159, 10, 0.2) 100%), #FFFFFF;',
    },
    SearchResultInspector: {
        ID: PluginID.Snapshot,
        UI: {
            Content({ resultList }) {
                return <ProfileView spaceList={resultList as Array<DAOResult<ChainId.Mainnet>>} />
            },
        },
        Utils: {
            shouldDisplay(result) {
                return result.type === SearchResultType.DAO
            },
        },
    },
}

export default site
