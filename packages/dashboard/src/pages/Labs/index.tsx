import { useCallback, useEffect, useState } from 'react'
import { Box } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { PageFrame } from '../../components/PageFrame'
import PluginItem from './components/PluginItem'
import {
    CollectiblesIcon,
    FileServiceIcon,
    GitcoinIcon,
    GoogGhostingIcon,
    LootManIcon,
    MarketsIcon,
    MaskBoxIcon,
    RedPacketIcon,
    SnapshotIcon,
    SwapServiceIcon,
    TransakIcon,
    ValuablesIcon,
} from '@masknet/icons'
import { useDashboardI18N } from '../../locales'
import MarketTrendSettingDialog from './components/MarketTrendSettingDialog'
import { useAccount } from '@masknet/web3-shared-evm'
import { PluginMessages } from '../../API'
import { useRemoteControlledDialog } from '@masknet/shared'
import { Services } from '../../API'
import { PLUGIN_IDS, TUTORIAL_URLS_EN } from './constants'
import { useLocation } from 'react-router-dom'
import { ContentContainer } from '../../components/ContentContainer'
import { useLanguage } from '../Settings/api'
import { WalletStateBar } from '../Wallets/components/WalletStateBar'
import { PoolTogetherURL } from '../../assets'
import { DHEDGEIcon } from '../../../../mask/src/resources/DHEDGEIcon'
import TutorialDialog from './components/TutorialDialog'

const useStyles = makeStyles()((theme) => ({
    root: {
        flex: 1,
        borderRadius: Number(theme.shape.borderRadius) * 3,
        backgroundColor: MaskColorVar.primaryBackground,
        padding: theme.spacing(2),
        marginBottom: theme.spacing(2),
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
    },
}))

function PoolTogetherIcon() {
    return <img src={PoolTogetherURL.toString()} width={28} height={28} />
}

export default function Plugins() {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const location = useLocation()
    const [openTrendSetting, setOpenTrendSetting] = useState(false)
    const [openSetupTutorial, setOpenSetupTutorial] = useState(!localStorage.getItem('dismissTutorialDialog'))
    const [pluginStatus, setPluginStatus] = useState({
        [PLUGIN_IDS.FILE_SERVICE]: true,
        [PLUGIN_IDS.GITCOIN]: true,
        [PLUGIN_IDS.DHEDGE]: true,
        [PLUGIN_IDS.RED_PACKET]: true,
        [PLUGIN_IDS.TRANSAK]: true,
        [PLUGIN_IDS.COLLECTIBLES]: true,
        [PLUGIN_IDS.SWAP]: true,
        [PLUGIN_IDS.SNAPSHOT]: true,
        [PLUGIN_IDS.MARKETS]: true,
        [PLUGIN_IDS.VALUABLES]: true,
        [PLUGIN_IDS.MASK_BOX]: true,
        [PLUGIN_IDS.GOOD_GHOSTING]: true,
        [PLUGIN_IDS.POOL_TOGETHER]: true,
    })

    const plugins = [
        {
            id: PLUGIN_IDS.RED_PACKET,
            title: t.labs_red_packet(),
            desc: t.labs_red_packet_desc(),
            icon: <RedPacketIcon />,
            enabled: pluginStatus[PLUGIN_IDS.RED_PACKET],
        },
        {
            id: PLUGIN_IDS.FILE_SERVICE,
            title: t.labs_file_service(),
            desc: t.labs_file_service_desc(),
            icon: <FileServiceIcon />,
            enabled: pluginStatus[PLUGIN_IDS.FILE_SERVICE],
        },
        {
            id: PLUGIN_IDS.MARKETS,
            title: t.labs_markets(),
            desc: t.labs_markets_desc(),
            icon: <MarketsIcon />,
            enabled: pluginStatus[PLUGIN_IDS.MARKETS],
        },
        {
            id: PLUGIN_IDS.MASK_BOX,
            title: t.labs_mask_box(),
            desc: t.labs_mask_box_desc(),
            icon: <MaskBoxIcon />,
            enabled: pluginStatus[PLUGIN_IDS.MASK_BOX],
        },
        {
            id: PLUGIN_IDS.SWAP,
            title: t.labs_swap(),
            desc: t.labs_swap_desc(),
            icon: <SwapServiceIcon />,
            enabled: pluginStatus[PLUGIN_IDS.SWAP],
            setting: true,
        },
        {
            id: PLUGIN_IDS.TRANSAK,
            title: t.labs_transak(),
            desc: t.labs_transak_desc(),
            icon: <TransakIcon />,
            enabled: pluginStatus[PLUGIN_IDS.TRANSAK],
        },
        {
            id: PLUGIN_IDS.COLLECTIBLES,
            title: t.labs_collectibles(),
            desc: t.labs_collectibles_desc(),
            icon: <CollectiblesIcon />,
            enabled: pluginStatus[PLUGIN_IDS.COLLECTIBLES],
        },
        {
            id: PLUGIN_IDS.SNAPSHOT,
            title: t.labs_snapshot(),
            desc: t.labs_snapshot_desc(),
            icon: <SnapshotIcon />,
            enabled: pluginStatus[PLUGIN_IDS.SNAPSHOT],
        },
        {
            id: PLUGIN_IDS.GITCOIN,
            title: t.labs_gitcoin(),
            desc: t.labs_gitcoin_desc(),
            icon: <GitcoinIcon />,
            enabled: pluginStatus[PLUGIN_IDS.GITCOIN],
        },
        {
            id: PLUGIN_IDS.VALUABLES,
            title: t.labs_valuables(),
            desc: t.labs_valuables_desc(),
            icon: <ValuablesIcon />,
            enabled: pluginStatus[PLUGIN_IDS.VALUABLES],
        },
        {
            id: PLUGIN_IDS.DHEDGE,
            title: t.labs_dhedge(),
            desc: t.labs_dhedge_desc(),
            icon: <DHEDGEIcon />,
            enabled: pluginStatus[PLUGIN_IDS.DHEDGE],
        },
        {
            id: PLUGIN_IDS.PETS,
            title: t.labs_pets(),
            desc: t.labs_pets_desc(),
            icon: <LootManIcon />,
            enabled: pluginStatus[PLUGIN_IDS.PETS],
        },
        {
            id: PLUGIN_IDS.GOOD_GHOSTING,
            title: t.labs_good_ghosting(),
            desc: t.labs_good_ghosting_desc(),
            icon: <GoogGhostingIcon />,
            enabled: pluginStatus[PLUGIN_IDS.GOOD_GHOSTING],
        },
        {
            id: PLUGIN_IDS.POOL_TOGETHER,
            title: t.labs_pool_together(),
            desc: t.labs_pool_together_desc(),
            icon: <PoolTogetherIcon />,
            enabled: pluginStatus[PLUGIN_IDS.POOL_TOGETHER],
        },
    ]

    const language = useLanguage()

    const account = useAccount()
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginMessages.Transak.buyTokenDialogUpdated)
    const openTransakDialog = useCallback(
        (code?: string) => {
            setBuyDialog({
                open: true,
                address: account,
                code,
            })
        },
        [account],
    )

    const { openDialog: openSwapDialog } = useRemoteControlledDialog(PluginMessages.Swap.swapDialogUpdated)

    async function onSwitch(id: string, checked: boolean) {
        await Services.Settings.setPluginEnabled(id, checked)
        setPluginStatus({ ...pluginStatus, [id]: checked })
    }

    function onSetting(id: string) {
        if (id === PLUGIN_IDS.SWAP) {
            setOpenTrendSetting(true)
        }
    }

    function onTutorial(id: string) {
        const url = TUTORIAL_URLS_EN[id]
        if (url) {
            window.open(url)
        }
    }

    function onTutorialDialogClose(checked: boolean) {
        setOpenSetupTutorial(false)
        if (checked) {
            localStorage.setItem('dismissTutorialDialog', 'true')
        }
    }

    useEffect(() => {
        Object.values(PLUGIN_IDS).forEach(async (id) => {
            const enabled = await Services.Settings.getPluginEnabled(id)
            setPluginStatus((status) => ({ ...status, [id]: enabled }))
        })
    }, [])

    useEffect(() => {
        const search = new URLSearchParams(location.search)
        const open = search.get('open')
        const code = search.get('code')

        if (open === 'Transak') {
            openTransakDialog(code ?? '')
        } else if (open === 'Swap') {
            openSwapDialog()
        }
    }, [location.search, openTransakDialog, openSwapDialog])

    return (
        <PageFrame title={t.labs()} primaryAction={<WalletStateBar />}>
            <ContentContainer>
                <Box className={classes.root}>
                    {plugins.map((p) => (
                        <PluginItem
                            id={p.id}
                            title={p.title}
                            desc={p.desc}
                            icon={p.icon}
                            enabled={p.enabled}
                            onSwitch={onSwitch}
                            onTutorial={onTutorial}
                            onSetting={p.setting ? onSetting : undefined}
                        />
                    ))}
                </Box>
            </ContentContainer>

            <MarketTrendSettingDialog open={openTrendSetting} onClose={() => setOpenTrendSetting(false)} />
            <TutorialDialog open={openSetupTutorial} onClose={onTutorialDialogClose} />
        </PageFrame>
    )
}
