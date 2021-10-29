import { makeStyles } from '@masknet/theme'
import { CircularProgress } from '@mui/material'
import { useNFTAvatar } from '../hooks'
import { useNFTVerified } from '../hooks/useNFTVerified'

const useStyles = makeStyles()((theme) => ({
    root: {},
    image: {
        width: 24,
        heigth: 24,
    },
}))

interface NFTContractImageProps {
    userId: string
}

export function NFTContractImage(props: NFTContractImageProps) {
    const { userId } = props
    const { classes } = useStyles()

    const { loading: loadingNFT, value: NFTAvatar } = useNFTAvatar(userId)
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
