import { useWeb3State, Web3Helper } from '@masknet/plugin-infra/web3'
import { makeStyles, MaskColorVar, useStylesExtends } from '@masknet/theme'
import AbstractTab, { AbstractTabProps } from './AbstractTab'
import { isDashboardPage } from '@masknet/shared-base'

interface StyleProps {
    chainLength: number
    isDashboard: boolean
}
const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    tab: {
        backgroundColor: !props.isDashboard
            ? `${theme.palette.background.default}!important`
            : `${MaskColorVar.primaryBackground2}!important`,
        marginRight: 1,
        '&:last-child': {
            marginRight: 0,
        },
    },
    tabs: {
        '& .MuiTabs-flexContainer': {
            backgroundColor: theme.palette.background.paper,
        },
        '& .Mui-selected': {
            color: '#ffffff',
            backgroundColor: `${theme.palette.primary.main}!important`,
        },
        '& .MuiTabs-scroller': {
            margin: '0 1px',
        },
        '& .MuiTabs-scrollButtons': {
            width: 'unset',
            backgroundColor: !props.isDashboard
                ? `${theme.palette.background.default}!important`
                : `${MaskColorVar.primaryBackground2}!important`,
            '&.Mui-disabled': {
                opacity: 1,
                '& svg': {
                    opacity: 0.3,
                },
            },
        },
    },
}))

interface NetworkTabProps extends withClasses<'tab' | 'tabs' | 'tabPanel' | 'indicator' | 'focusTab' | 'tabPaper'> {
    chains: Web3Helper.ChainIdAll[]
    setChainId: (chainId: Web3Helper.ChainIdAll) => void
    chainId: Web3Helper.ChainIdAll
}
export function NetworkTab(props: NetworkTabProps) {
    const { Others } = useWeb3State() as Web3Helper.Web3StateAll
    const isDashboard = isDashboardPage()
    const classes = useStylesExtends(useStyles({ chainLength: props.chains.length, isDashboard }), props)
    const { chainId, setChainId, chains } = props
    const createTabItem = (name: string, chainId: Web3Helper.ChainIdAll) => ({
        label: <span>{name}</span>,
        sx: { p: 0 },
        cb: () => setChainId(chainId),
    })

    const tabProps: AbstractTabProps = {
        tabs: chains.map((chainId) => createTabItem(Others?.chainResolver.chainName(chainId) ?? 'Unknown', chainId)),
        index: chains.indexOf(chainId),
        classes,
        hasOnlyOneChild: true,
        scrollable: true,
    }

    return <AbstractTab {...tabProps} />
}
