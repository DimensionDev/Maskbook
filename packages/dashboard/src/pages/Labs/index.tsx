import { makeStyles, Box } from '@material-ui/core'
import { PageFrame } from '../../components/DashboardFrame'
import PluginItem, { PluginItemPlaceHodler } from './components/PluginItem'
import { pluginIcons } from '@masknet/icons'
import { useDashboardI18N } from '../../locales'

const {
    FileServiceIcon,
    MarketsIcon,
    RedPacketIcon,
    SwapIcon,
    TransakIcon,
    SnapshotIcon,
    MarketTrendIcon,
    CollectiblesIcon,
    GitcoinIcon,
    ValuablesIcon,
    DhedgeIcon,
} = pluginIcons

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    list: {
        display: 'flex',
        '& >*': {
            flex: 1,
        },
    },
}))

export default function Plugins() {
    const t = useDashboardI18N()
    const classes = useStyles()

    function onSwitch(name: string, checked: boolean) {
        // TODO: sync setting
        console.log(`switch ${name}`, checked)
    }

    function onTwitter(name: string) {
        console.log('twitter', name)
    }

    function onFacebook(name: string) {
        console.log('facebook', name)
    }

    function onExplore(name: string) {
        console.log('explore', name)
    }

    return (
        <PageFrame title={t.labs()}>
            <Box className={classes.root}>
                <Box className={classes.list}>
                    <PluginItem
                        name="fileService"
                        title={t.labs_file_service()}
                        desc={t.labs_file_service_desc()}
                        icon={<FileServiceIcon />}
                        onTwitter={onTwitter}
                        onFacebook={onFacebook}
                        onSwitch={onSwitch}></PluginItem>
                    <PluginItem
                        name="markets"
                        title={t.labs_markets()}
                        desc={t.labs_markets_desc()}
                        icon={<MarketsIcon />}
                        onTwitter={onTwitter}
                        onFacebook={onFacebook}
                        onSwitch={onSwitch}></PluginItem>
                    <PluginItem
                        name="redPacket"
                        title={t.labs_red_packet()}
                        desc={t.labs_red_packet_desc()}
                        icon={<RedPacketIcon />}
                        onTwitter={onTwitter}
                        onFacebook={onFacebook}
                        onSwitch={onSwitch}></PluginItem>
                </Box>
                <Box className={classes.list}>
                    <PluginItem
                        name="swap"
                        title={t.labs_swap()}
                        desc={t.labs_swap_desc()}
                        onSwitch={onSwitch}
                        onExplore={onExplore}
                        icon={<SwapIcon />}></PluginItem>
                    <PluginItem
                        name="transak"
                        title={t.labs_transak()}
                        desc={t.labs_transak_desc()}
                        icon={<TransakIcon />}
                        onExplore={onExplore}
                        onSwitch={onSwitch}></PluginItem>
                    <PluginItemPlaceHodler />
                </Box>
                <Box className={classes.list}>
                    <PluginItem
                        name="snapshot"
                        title={t.labs_snapshot()}
                        desc={t.labs_snapshot_desc()}
                        icon={<SnapshotIcon />}
                        onSwitch={onSwitch}></PluginItem>
                    <PluginItem
                        name="marketTrend"
                        title={t.labs_market_trend()}
                        desc={t.labs_market_trend_desc()}
                        icon={<MarketTrendIcon />}
                        onSwitch={onSwitch}></PluginItem>
                    <PluginItem
                        name="collectibles"
                        title={t.labs_collectibles()}
                        desc={t.labs_collectibles_desc()}
                        icon={<CollectiblesIcon />}
                        onSwitch={onSwitch}></PluginItem>
                </Box>
                <Box className={classes.list}>
                    <PluginItem
                        name="gitcoin"
                        title={t.labs_gitcoin()}
                        desc={t.labs_gitcoin_desc()}
                        icon={<GitcoinIcon />}
                        onSwitch={onSwitch}></PluginItem>
                    <PluginItem
                        name="valuables"
                        title={t.labs_valuables()}
                        desc={t.labs_valuables_desc()}
                        icon={<ValuablesIcon />}
                        onSwitch={onSwitch}></PluginItem>
                    <PluginItem
                        name="dhedge"
                        title={t.labs_dhedge()}
                        desc={t.labs_dhedge_desc()}
                        icon={<DhedgeIcon />}
                        onSwitch={onSwitch}></PluginItem>
                </Box>
            </Box>
        </PageFrame>
    )
}
