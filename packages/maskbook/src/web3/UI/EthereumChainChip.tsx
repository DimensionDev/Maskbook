import { Chip, makeStyles, ChipProps } from '@material-ui/core'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import { ChainId, getChainName, resolveChainColor } from '@dimensiondev/web3-shared'
import { useStylesExtends } from '../../components/custom-ui-helper'

const useStyles = makeStyles((theme) => {
    return {
        root: {},
    }
})

export interface EthereumChainChipProps extends withClasses<never> {
    chainId: ChainId
    ChipProps?: Partial<ChipProps>
}

export function EthereumChainChip(props: EthereumChainChipProps) {
    const { chainId, ChipProps } = props
    const classes = useStylesExtends(useStyles(), props)
    return (
        <Chip
            className={classes.root}
            size="small"
            label={getChainName(chainId)}
            icon={
                <FiberManualRecordIcon
                    style={{
                        color: resolveChainColor(chainId),
                    }}
                />
            }
            {...ChipProps}
        />
    )
}
