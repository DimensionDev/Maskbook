import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '@masknet/shared'
import AbstractTab, { AbstractTabProps } from './AbstractTab'
import { ChainId, getChainDetailed } from '@masknet/web3-shared-evm'

interface StyleProps {
    chainLength: number
}
const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    tab: {
        background: theme.palette.mode === 'light' ? '#F6F8F8' : '#17191D',
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
    },
}))

interface NetworkTabProps extends withClasses<'tab' | 'tabs' | 'tabPanel' | 'indicator' | 'focusTab' | 'tabPaper'> {
    chains: ChainId[]
    setChainId: (chainId: ChainId) => void
    chainId: ChainId
}
export function NetworkTab(props: NetworkTabProps) {
    const classes = useStylesExtends(useStyles({ chainLength: props.chains.length }), props)
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
