import { useState } from 'react'
import { TextField, IconButton } from '@material-ui/core'
import { makeStyles, createStyles, ThemeProvider } from '@material-ui/core/styles'
import SearchIcon from '@material-ui/icons/Search'
import ClearIcon from '@material-ui/icons/Clear'
import { pick } from 'lodash-es'
import PluginCard from '../DashboardComponents/PluginCard'
import { PluginMetaData, PluginConfig, PluginScope } from '../../../plugins/types'
import { AirdropPluginDefine } from '../../../plugins/Airdrop/define'
import { EthereumPluginDefine } from '../../../plugins/Ethereum/define'
import { FileServicePluginDefine } from '../../../plugins/FileService/UI-define'
import { GitcoinPluginDefine } from '../../../plugins/Gitcoin//define'
import { ITO_PluginDefine } from '../../../plugins/ITO/define'
import { NFT_PluginsDefine } from '../../../plugins/NFT/define'
import { PollsPluginDefine } from '../../../plugins/Polls/define'
import { RedPacketPluginDefine } from '../../../plugins/RedPacket/define'
import { TraderPluginDefine } from '../../../plugins/Trader/define'
import { TransakPluginDefine } from '../../../plugins/Transak/define'
import { WalletPluginDefine } from '../../../plugins/Wallet/define'

import DashboardRouterContainer from './Container'
import { useI18N } from '../../../utils/i18n-next-ui'
import { extendsTheme } from '../../../utils/theme'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
            maxWidth: 360,
            backgroundColor: theme.palette.background.paper,
        },
        pluginList: {
            padding: theme.spacing(3, 0),
            margin: 0,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridGap: theme.spacing(3),
            [theme.breakpoints.down('sm')]: {
                display: 'block',
            },
        },
        pluginItem: {
            listStyle: 'none',
        },
    }),
)

const pluginsTheme = extendsTheme((theme) => ({}))

const pickFields = ['ID', 'pluginName', 'identifier', 'scope']
const pickPluginMeta = (
    pluginDefine: PluginConfig,
    extraMeta: Partial<Pick<PluginMetaData, 'description' | 'logo'>>,
): PluginMetaData => {
    return {
        ...pick(pluginDefine, pickFields),
        ...extraMeta,
        logo: extraMeta.logo ?? '🔌',
        version: '0.0.1',
    } as PluginMetaData
}
const plugins: PluginMetaData[] = [
    pickPluginMeta(AirdropPluginDefine, { description: 'Airdrop plugin', logo: '🪂' }),
    pickPluginMeta(EthereumPluginDefine, { description: 'Ethereum plugin', logo: '♦️' }),
    pickPluginMeta(FileServicePluginDefine, { description: 'File Service plugin', logo: '📃' }),
    pickPluginMeta(GitcoinPluginDefine, { description: 'File Service plugin', logo: '🔗' }),
    pickPluginMeta(ITO_PluginDefine, { description: 'ITO plugin' }),
    pickPluginMeta(NFT_PluginsDefine, { description: 'NFT plugin', logo: '🖼' }),
    pickPluginMeta(PollsPluginDefine, { description: 'Polls plugin', logo: '📊' }),
    pickPluginMeta(RedPacketPluginDefine, { description: 'RedPacket plugin', logo: '🧧' }),
    pickPluginMeta(TraderPluginDefine, { description: 'Trader plugin', logo: '™️' }),
    pickPluginMeta(TransakPluginDefine, { description: 'Transaction plugin', logo: '💸' }),
    pickPluginMeta(WalletPluginDefine, { description: 'Wallet plugin', logo: '💰' }),
]

export default function DashboardSettingsRouter() {
    const { t } = useI18N()
    const [search, setSearch] = useState('')
    const [searchUI, setSearchUI] = useState('')
    const classes = useStyles()

    const actions = [
        <TextField
            placeholder={t('search')}
            size="small"
            value={searchUI}
            onChange={(e) => {
                setSearchUI(e.target.value)
                setSearch(e.target.value)
            }}
            InputProps={{
                endAdornment: (
                    <IconButton size="small" onClick={() => setSearch('')}>
                        {search ? <ClearIcon /> : <SearchIcon />}
                    </IconButton>
                ),
            }}
        />,
    ]

    return (
        <DashboardRouterContainer
            title={t('plugins')}
            actions={actions}
            floatingButtons={[
                {
                    icon: <SearchIcon />,
                    handler: () => {},
                },
            ]}>
            <ThemeProvider theme={pluginsTheme}>
                <ul className={classes.pluginList}>
                    {plugins.filter(x => x.scope === PluginScope.Public).map((y) => (
                        <li className={classes.pluginItem}>
                            <PluginCard key={y.ID} plugin={y} />
                        </li>
                    ))}
                </ul>
            </ThemeProvider>
        </DashboardRouterContainer>
    )
}
