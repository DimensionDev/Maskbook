import { type Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { base } from '../base.js'
import { useMemo, Suspense } from 'react'
import { Skeleton } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { PostInspector } from './PostInspector.js'
import { SearchResultType, type DAOResult } from '@masknet/web3-shared-base'
import { Trans } from 'react-i18next'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { parseURLs, PluginID } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'
import { ProfileView } from './ProfileView.js'
import type { ChainId } from '@masknet/web3-shared-evm'

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
    DecryptedInspector(props): JSX.Element | null {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURLs(x.val).find(isSnapshotURL)
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
            description: <Trans i18nKey="plugin_snapshot_description" ns={PluginID.Snapshot} />,
            tutorialLink: 'https://realmasknetwork.notion.site/10c08ed9629942dd852d9afbfab61208',
            name: <Trans i18nKey="plugin_snapshot_info_dao" ns={PluginID.Snapshot} />,
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

export default sns
