import { makeStyles } from '@masknet/theme'
import { CircularProgress } from '@mui/material'
import { useNFTAvatar } from '../hooks'
import { useNFTVerified } from '../hooks/useNFTVerified'
import type { RSS3_KEY_SNS } from '../constants'

const useStyles = makeStyles()((theme) => ({
    root: {},
    image: {
        width: 24,
        height: 24,
    },
}))

interface NFTContractImageProps {
    userId: string
    snsKey: RSS3_KEY_SNS
}

export function NFTContractImage(props: NFTContractImageProps) {
    const { userId, snsKey } = props
    const { classes } = useStyles()

    const { loading: loadingNFT, value: NFTAvatar } = useNFTAvatar(userId, snsKey)
    const { loading, value: contract } = useNFTVerified(NFTAvatar?.address ?? '')

    return (
        <div className={classes.root}>
            {loading || loadingNFT ? (
                <CircularProgress size="small" />
            ) : contract ? (
                <img className={classes.image} src={contract?.icon} />
            ) : null}
        </div>
    )
}
