import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '@masknet/shared'
import AbstractTab, { AbstractTabProps } from './AbstractTab'
import { ChainId } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()(() => ({}))
interface NetworkTabProps extends withClasses<'tab' | 'tabs' | 'tabPanel' | 'indicator' | 'focusTab' | 'tabPaper'> {
    setChainId: (chainId: ChainId) => void
    chainId: ChainId
}
export function NetworkTab(props: NetworkTabProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { chainId, setChainId } = props
    const createTabItem = (name: string, chainId: ChainId) => ({
        label: <span>{name}</span>,
        sx: { p: 0 },
        cb: () => setChainId(chainId),
    })

    const tabProps: AbstractTabProps = {
        tabs: [
            createTabItem('ETH', ChainId.Mainnet),
            createTabItem('BSC', ChainId.BSC),
            createTabItem('Polygon/Matic', ChainId.Matic),
            createTabItem('Arbitrum', ChainId.Arbitrum),
            createTabItem('xDai', ChainId.xDai),
        ],
        index: [ChainId.Mainnet, ChainId.BSC, ChainId.Matic, ChainId.Arbitrum, ChainId.xDai].indexOf(chainId),
        classes,
        hasOnlyOneChild: true,
    }

    return <AbstractTab {...tabProps} />
}
