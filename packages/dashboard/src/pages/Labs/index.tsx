import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Box } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { PageFrame } from '../../components/PageFrame'
import PluginItem from './components/PluginItem'
import {
    CollectiblesIcon,
    FileServiceIcon,
    GitcoinIcon,
    GoogGhostingIcon,
    MarketsIcon,
    MaskBoxIcon,
    PetIcon,
    RedPacketIcon,
    SnapshotIcon,
    SwapServiceIcon,
    TransakIcon,
    ValuablesIcon,
    CyberConnectIcon,
} from '@masknet/icons'
import { useDashboardI18N } from '../../locales'
import MarketTrendSettingDialog from './components/MarketTrendSettingDialog'
import { useAccount } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { Messages, Services, PluginMessages } from '../../API'
import { openWindow, useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { TUTORIAL_URLS_EN } from './constants'
import { ContentContainer } from '../../components/ContentContainer'
import { WalletStateBar } from '../Wallets/components/WalletStateBar'
import { PoolTogetherURL } from '../../assets'
import { DHEDGEIcon } from '../../../../mask/src/resources/DHEDGEIcon'
import TutorialDialog from './components/TutorialDialog'
import { PluginId } from '@masknet/plugin-infra'
import ArtBlocksIcon from '../../../../mask/src/plugins/ArtBlocks/SNSAdaptor/ArtBlocksIcon'

const useStyles = makeStyles()((theme) => ({
    root: {
        flex: 1,
        borderRadius: Number(theme.shape.borderRadius) * 3,
        backgroundColor: MaskColorVar.primaryBackground,
        padding: theme.spacing(2),
        marginBottom: theme.spacing(2),
        display: 'grid',
        gridGap: theme.spacing(2),
        gridTemplateColumns: 'repeat(auto-fit, minmax(355px, 1fr))',
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
        [PluginId.FileService]: true,
        [PluginId.Gitcoin]: true,
        [PluginId.dHEDGE]: true,
        [PluginId.Pets]: true,
        [PluginId.RedPacket]: true,
        [PluginId.Transak]: true,
        [PluginId.Collectible]: true,
        [PluginId.Trader]: true,
        [PluginId.Snapshot]: true,
        [PluginId.ITO]: true,
        [PluginId.Valuables]: true,
        [PluginId.MaskBox]: true,
        [PluginId.GoodGhosting]: true,
        [PluginId.PoolTogether]: true,
        [PluginId.ArtBlocks]: true,
        [PluginId.CyberConnect]: true,
    })

    useEffect(
        () =>
            Messages.events.pluginMinimalModeChanged.on(([id, newValue]) =>
                setPluginStatus({ ...pluginStatus, [id]: !newValue }),
            ),
        [pluginStatus],
    )

    const plugins = [
        {
            id: PluginId.RedPacket,
            title: t.labs_red_packet(),
            desc: t.labs_red_packet_desc(),
            icon: <RedPacketIcon />,
            enabled: pluginStatus[PluginId.RedPacket],
        },
        {
            id: PluginId.FileService,
            title: t.labs_file_service(),
            desc: t.labs_file_service_desc(),
            icon: <FileServiceIcon />,
            enabled: pluginStatus[PluginId.FileService],
        },
        {
            id: PluginId.ITO,
            title: t.labs_markets(),
            desc: t.labs_markets_desc(),
            icon: <MarketsIcon />,
            enabled: pluginStatus[PluginId.ITO],
        },
        {
            id: PluginId.MaskBox,
            title: t.labs_mask_box(),
            desc: t.labs_mask_box_desc(),
            icon: <MaskBoxIcon />,
            enabled: pluginStatus[PluginId.MaskBox],
        },
        {
            id: PluginId.Trader,
            title: t.labs_swap(),
            desc: t.labs_swap_desc(),
            icon: <SwapServiceIcon />,
            enabled: pluginStatus[PluginId.Trader],
            setting: true,
            hideSwitch: true,
        },
        {
            id: PluginId.Transak,
            title: t.labs_transak(),
            desc: t.labs_transak_desc(),
            icon: <TransakIcon />,
            enabled: pluginStatus[PluginId.Transak],
            hideSwitch: true,
        },
        {
            id: PluginId.Collectible,
            title: t.labs_collectibles(),
            desc: t.labs_collectibles_desc(),
            icon: <CollectiblesIcon />,
            enabled: pluginStatus[PluginId.Collectible],
        },
        {
            id: PluginId.Snapshot,
            title: t.labs_snapshot(),
            desc: t.labs_snapshot_desc(),
            icon: <SnapshotIcon />,
            enabled: pluginStatus[PluginId.Snapshot],
        },
        {
            id: PluginId.Gitcoin,
            title: t.labs_gitcoin(),
            desc: t.labs_gitcoin_desc(),
            icon: <GitcoinIcon />,
            enabled: pluginStatus[PluginId.Gitcoin],
        },
        {
            id: PluginId.Valuables,
            title: t.labs_valuables(),
            desc: t.labs_valuables_desc(),
            icon: <ValuablesIcon />,
            enabled: pluginStatus[PluginId.Valuables],
        },
        {
            id: PluginId.dHEDGE,
            title: t.labs_dhedge(),
            desc: t.labs_dhedge_desc(),
            icon: <DHEDGEIcon />,
            enabled: pluginStatus[PluginId.dHEDGE],
        },
        {
            id: PluginId.Pets,
            title: t.labs_pets(),
            desc: t.labs_pets_desc(),
            icon: <PetIcon />,
            enabled: pluginStatus[PluginId.Pets],
        },
        {
            id: PluginId.GoodGhosting,
            title: t.labs_good_ghosting(),
            desc: t.labs_good_ghosting_desc(),
            icon: <GoogGhostingIcon />,
            enabled: pluginStatus[PluginId.GoodGhosting],
        },
        {
            id: PluginId.PoolTogether,
            title: t.labs_pool_together(),
            desc: t.labs_pool_together_desc(),
            icon: <PoolTogetherIcon />,
            enabled: pluginStatus[PluginId.PoolTogether],
        },
        {
            id: PluginId.ArtBlocks,
            title: t.labs_art_blocks(),
            desc: t.labs_art_blocks_desc(),
            icon: <ArtBlocksIcon />,
            enabled: pluginStatus[PluginId.ArtBlocks],
        },
        {
            id: PluginId.CyberConnect,
            title: t.labs_cyber_connect(),
            desc: t.labs_cyber_connect_desc(),
            icon: <CyberConnectIcon />,
            enabled: pluginStatus[PluginId.CyberConnect],
        },
    ]

    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
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

    const { openDialog: openEssayDialog } = useRemoteControlledDialog(PluginMessages.Pets.events.essayDialogUpdated)

    async function onSwitch(id: string, checked: boolean) {
        await Services.Settings.setPluginMinimalModeEnabled(id, !checked)
        setPluginStatus({ ...pluginStatus, [id]: checked })
    }

    function onSetting(id: string) {
        if (id === PluginId.Trader) {
            setOpenTrendSetting(true)
        }
    }

    function onTutorial(id: string) {
        openWindow(TUTORIAL_URLS_EN[id])
    }

    function onTutorialDialogClose(checked: boolean) {
        setOpenSetupTutorial(false)
        if (checked) {
            localStorage.setItem('dismissTutorialDialog', 'true')
        }
    }

    useEffect(() => {
        Object.values(PluginId).forEach(async (id) => {
            const enabled = await Services.Settings.getPluginMinimalModeEnabled(id)
            setPluginStatus((status) => ({ ...status, [id]: !enabled }))
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
        } else if (open === 'Pets') {
            openEssayDialog()
        }
    }, [location.search, openTransakDialog, openSwapDialog, openEssayDialog])

    return (
        <PageFrame title={t.labs()} primaryAction={<WalletStateBar />}>
            <ContentContainer>
                <Box className={classes.root}>
                    {plugins.map((p) => (
                        <PluginItem
                            key={p.id}
                            id={p.id}
                            title={p.title}
                            desc={p.desc}
                            icon={p.icon}
                            enabled={p.enabled}
                            onSwitch={onSwitch}
                            onTutorial={onTutorial}
                            onSetting={p.setting ? onSetting : undefined}
                            hideSwitch={p.hideSwitch}
                        />
                    ))}
                </Box>
            </ContentContainer>

            <MarketTrendSettingDialog open={openTrendSetting} onClose={() => setOpenTrendSetting(false)} />
            <TutorialDialog open={openSetupTutorial} onClose={onTutorialDialogClose} />
        </PageFrame>
    )
}
