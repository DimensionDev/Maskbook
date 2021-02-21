import { Box, createStyles, Divider, makeStyles } from '@material-ui/core'
import type { ERC20TokenDetailed } from '../../../web3/types'
import { AirdropClaimCard } from './AirdropClaimCard'
import { AirdropCheckCard } from './AirdropCheckCard'

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            background: 'linear-gradient(90deg, #2174F6 0%, #00C6FB 100%)',
            borderRadius: 10,
            width: '100%',
        },
        divider: {
            borderBottom: '1px dashed rgba(255,255,255, 0.5)',
        },
    }),
)

export interface AirdropCardProps {
    token?: ERC20TokenDetailed
    onUpdateAmount: (amount: string) => void
}

export function AirdropCard(props: AirdropCardProps) {
    const { token, onUpdateAmount } = props
    const classes = useStyles()

    return (
        <Box className={classes.root}>
            <AirdropClaimCard token={token} onUpdateAmount={onUpdateAmount} />
            <Divider className={classes.divider} />
            <AirdropCheckCard token={token} />
        </Box>
    )
}
