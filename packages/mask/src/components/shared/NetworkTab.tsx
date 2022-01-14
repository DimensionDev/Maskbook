import { makeStyles, MaskColorVar, useStylesExtends } from '@masknet/theme'
import AbstractTab, { AbstractTabProps } from './AbstractTab'
import { ChainId, getChainDetailed } from '@masknet/web3-shared-evm'
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
            display: 'grid',
            gridTemplateColumns: Array(props.chainLength)
                .fill(100 / props.chainLength + '%')
                .join(' '),
            backgroundColor: theme.palette.background.paper,
        },
        '& .Mui-selected': {
            color: '#ffffff',
            backgroundColor: `${theme.palette.primary.main}!important`,
        },
    },
}))

interface NetworkTabProps extends withClasses<'tab' | 'tabs' | 'tabPanel' | 'indicator' | 'focusTab' | 'tabPaper'> {
    chains: ChainId[]
    setChainId: (chainId: ChainId) => void
    chainId: ChainId
}
export function NetworkTab(props: NetworkTabProps) {
    const isDashboard = isDashboardPage()
    const classes = useStylesExtends(useStyles({ chainLength: props.chains.length, isDashboard }), props)
    const { chainId, setChainId, chains } = props
    const createTabItem = (name: string, chainId: ChainId) => ({
        label: <span>{name}</span>,
        sx: { p: 0 },
        cb: () => setChainId(chainId),
    })

    const tabProps: AbstractTabProps = {
        tabs: chains.map((chainId) => createTabItem(getChainDetailed(chainId)?.chain ?? 'Unknown', chainId)),
        index: chains.indexOf(chainId),
        classes,
        hasOnlyOneChild: true,
    }

    return <AbstractTab {...tabProps} />
}
