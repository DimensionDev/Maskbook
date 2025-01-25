import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { useSiteThemeMode } from '@masknet/plugin-infra/content-script'
import { InjectedDialog, NetworkTab, usePageTab, useParamTab, type InjectedDialogProps } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, MaskTabList } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { Tab, useTheme } from '@mui/material'
import { useLayoutEffect, type ReactNode } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import { nftDefaultChains, RoutePaths } from '../../constants.js'
import { HistoryTabs, RedPacketTabs } from '../../types.js'

const useStyles = makeStyles<{ isDim: boolean }>()((theme, { isDim }) => {
    // it's hard to set dynamic color, since the background color of the button is blended transparent
    const darkBackgroundColor = isDim ? '#38414b' : '#292929'
    return {
        tabWrapper: {
            width: '100%',
            paddingBottom: theme.spacing(2),
        },
        arrowButton: {
            backgroundColor: theme.palette.mode === 'dark' ? darkBackgroundColor : undefined,
        },
    }
})

export function RouterDialog({
    pageMap,
    ...props
}: InjectedDialogProps & { pageMap: Record<RedPacketTabs, RoutePaths> }) {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const theme = useTheme()
    const mode = useSiteThemeMode(theme)

    useLayoutEffect(() => {
        if (pathname === RoutePaths.Exit) {
            props.onClose?.()
        }
    }, [pathname === RoutePaths.Exit, props.onClose])

    const { classes } = useStyles({ isDim: mode === 'dim' })
    const [currentTab, onChange] = usePageTab<RedPacketTabs>(pageMap)

    const createTabs = (
        <TabContext value={currentTab}>
            <MaskTabList variant="base" onChange={onChange} aria-label="Redpacket">
                <Tab label={<Trans>Tokens</Trans>} value={RedPacketTabs.tokens} />
                <Tab label={<Trans>NFTs</Trans>} value={RedPacketTabs.collectibles} />
            </MaskTabList>
        </TabContext>
    )
    const [currentHistoryTab, onChangeHistoryTab] = useParamTab<HistoryTabs>(HistoryTabs.Claimed)
    const historyTabs = (
        <TabContext value={currentHistoryTab}>
            <MaskTabList variant="base" onChange={onChangeHistoryTab} aria-label="Redpacket">
                <Tab label={<Trans>Sent</Trans>} value={HistoryTabs.Sent} />
                <Tab label={<Trans>Claimed</Trans>} value={HistoryTabs.Claimed} />
            </MaskTabList>
        </TabContext>
    )
    const isCreate = matchPath(`${RoutePaths.Create}/*`, pathname)
    const isEvmCreate =
        matchPath(RoutePaths.CreateTokenRedPacket, pathname) || matchPath(RoutePaths.CreateNftRedPacket, pathname)
    const titleTabs =
        isCreate ? createTabs
        : matchPath(RoutePaths.History, pathname) ? historyTabs
        : null
    const networkTabs =
        isEvmCreate && currentTab === RedPacketTabs.collectibles ?
            <div className={classes.tabWrapper}>
                <NetworkTab
                    chains={nftDefaultChains}
                    hideArrowButton={currentTab === RedPacketTabs.collectibles}
                    pluginID={NetworkPluginID.PLUGIN_EVM}
                    classes={{ arrowButton: classes.arrowButton }}
                />
            </div>
        :   null
    const titleMap: Record<string, ReactNode> = {
        [RoutePaths.ConfirmTokenRedPacket]: <Trans>Confirm the Lucky Drop</Trans>,
        [RoutePaths.History]: <Trans>History</Trans>,
        [RoutePaths.HistoryDetail]: <Trans>Claim Details</Trans>,
        [RoutePaths.NftHistory]: <Trans>History</Trans>,
        [RoutePaths.CustomCover]: <Trans>Add a Custom Cover</Trans>,
    }
    const titleTailMap: Record<string, ReactNode> = {
        [RoutePaths.CreateTokenRedPacket]: (
            <Icons.History
                onClick={() => navigate({ pathname: RoutePaths.History, search: `tab=${HistoryTabs.Sent}` })}
            />
        ),
        [RoutePaths.CreateSolanaRedPacket]: (
            <Icons.History
                onClick={() => navigate({ pathname: RoutePaths.History, search: `tab=${HistoryTabs.Sent}` })}
            />
        ),
        [RoutePaths.CreateNftRedPacket]: (
            <Icons.History
                onClick={() => {
                    navigate(RoutePaths.NftHistory)
                }}
            />
        ),
    }

    return (
        <InjectedDialog
            {...props}
            title={titleMap[pathname] || <Trans>Lucky Drop</Trans>}
            titleTabs={titleTabs}
            networkTabs={networkTabs}
            titleTail={titleTailMap[pathname] || null}
            onClose={() => {
                navigate(-1)
            }}
        />
    )
}
