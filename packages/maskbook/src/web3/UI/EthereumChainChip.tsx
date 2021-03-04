import { Chip, createStyles, makeStyles, ChipProps } from '@material-ui/core'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import type { ChainId } from '../types'
import { resolveChainName, resolveChainColor } from '../pipes'
import { useStylesExtends } from '../../components/custom-ui-helper'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {},
    })
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
            label={resolveChainName(chainId)}
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
