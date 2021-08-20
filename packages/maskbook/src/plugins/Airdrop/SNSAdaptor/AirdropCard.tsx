import { Box, Divider } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import type { ERC20TokenDetailed } from '@masknet/web3-shared'
import { AirdropClaimCard } from './AirdropClaimCard'
import { AirdropCheckCard } from './AirdropCheckCard'

const useStyles = makeStyles()({
    root: {
        background: 'linear-gradient(90deg, #2174F6 0%, #00C6FB 100%)',
        borderRadius: 10,
        width: '100%',
    },
    divider: {
        borderBottom: '1px dashed rgba(255,255,255, 0.5)',
    },
})

export interface AirdropCardProps {
    token?: ERC20TokenDetailed
    onUpdateAmount: (amount: string) => void
    onUpdateBalance: () => void
}

export function AirdropCard(props: AirdropCardProps) {
    const { token, onUpdateAmount, onUpdateBalance } = props
    const { classes } = useStyles()
    return (
        <Box className={classes.root}>
            <AirdropClaimCard token={token} onUpdateAmount={onUpdateAmount} onUpdateBalance={onUpdateBalance} />
            <Divider className={classes.divider} />
            <AirdropCheckCard token={token} />
        </Box>
    )
}
