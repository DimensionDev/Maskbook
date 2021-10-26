import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '@masknet/shared'
import AbstractTab, { AbstractTabProps } from './AbstractTab'
import { ChainId, getChainDetailed } from '@masknet/web3-shared-evm'

interface StyleProps {
    chainLength: number
    parentWidth: number
}
const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    tab: {
        background: theme.palette.mode === 'light' ? '#F6F8F8' : '#17191D',
    },
    tabs: {
        '& .MuiTabs-flexContainer': {
            display: 'grid',
            gridTemplateColumns: Array(props.chainLength)
                .fill(Math.floor(props.parentWidth / props.chainLength) - 1 + 'px')
                .join(' '),
            columnGap: 1,
            backgroundColor: theme.palette.background.paper,
        },
    },
}))

interface NetworkTabProps extends withClasses<'tab' | 'tabs' | 'tabPanel' | 'indicator' | 'focusTab' | 'tabPaper'> {
    chains: ChainId[]
    setChainId: (chainId: ChainId) => void
    chainId: ChainId
    parentWidth: number
}
export function NetworkTab(props: NetworkTabProps) {
    const classes = useStylesExtends(
        useStyles({ chainLength: props.chains.length, parentWidth: props.parentWidth }),
        props,
    )
    const { chainId, setChainId, chains } = props
    const createTabItem = (name: string, chainId: ChainId) => ({
        label: <span>{name}</span>,
        sx: { p: 0 },
        cb: () => setChainId(chainId),
    })

    const tabProps: AbstractTabProps = {
        tabs: chains.map((chainId) =>
            createTabItem(getChainDetailed(chainId)?.chain?.replace('Matic', 'Polygon') ?? 'Unknown', chainId),
        ),
        index: chains.indexOf(chainId),
        classes,
        hasOnlyOneChild: true,
    }

    return <AbstractTab {...tabProps} />
}
