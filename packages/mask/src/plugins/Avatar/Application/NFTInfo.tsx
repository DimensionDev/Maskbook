import { Box, Link, Stack, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { ApplicationIcon } from '../assets/application'
import { LinkIcon } from '../assets/link'
import { resolveOpenSeaLink } from '@masknet/web3-shared-evm'
import { formatTokenId } from '../utils'

const useStyles = makeStyles()(() => ({
    root: {},
    nft: {
        display: 'flex',
        alignItems: 'center',
    },
}))
interface NFTInfoProps extends withClasses<'root'> {
    nft?: { name: string; address: string; tokenId: string; symbol: string }
    owner: boolean
}

export function NFTInfo(props: NFTInfoProps) {
    const { nft, owner } = props
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Box className={classes.root}>
            {!nft ? (
                <Typography>Set NFT PFPs</Typography>
            ) : !owner ? (
                <Typography variant="body1" color="#FFB915">
                    NFT PFP verification failed
                </Typography>
            ) : (
                <Box className={classes.nft}>
                    <ApplicationIcon />
                    <Box sx={{ marginLeft: 0.5 }}>
                        <Typography variant="body1" color="textPrimary">
                            {nft.name}
                        </Typography>
                        <Stack display="flex" flexDirection="row">
                            <Typography variant="body2" color="textSecondary">
                                {formatTokenId(nft.symbol, nft.tokenId)}
                            </Typography>
                            <Link
                                sx={{ marginLeft: 0.5 }}
                                href={resolveOpenSeaLink(nft.address, nft.tokenId)}
                                target="_blank"
                                rel="noopener noreferrer">
                                <LinkIcon />
                            </Link>
                        </Stack>
                    </Box>
                </Box>
            )}
        </Box>
    )
}
