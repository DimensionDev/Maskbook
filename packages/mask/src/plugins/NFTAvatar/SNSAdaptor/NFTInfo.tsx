import { Box, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { ApplicationIcon } from '../assets/application'

const useStyles = makeStyles()(() => ({
    root: {},
    nft: {
        display: 'flex',
        alignItems: 'center',
    },
}))
interface NFTInfoProps extends withClasses<'root'> {
    nft?: { name: string; address: string; tokenId: string; symbol: string }
}

export function NFTInfo(props: NFTInfoProps) {
    const { nft } = props
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Box className={classes.root}>
            {nft ? (
                <Box className={classes.nft}>
                    <ApplicationIcon />
                    <Box sx={{ marginLeft: 0.5 }}>
                        <Typography variant="body1" color="textPrimary">
                            {nft.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {nft.symbol} #{nft.tokenId}
                        </Typography>
                    </Box>
                </Box>
            ) : (
                <Typography>Set NFT PFPs</Typography>
            )}
        </Box>
    )
}
