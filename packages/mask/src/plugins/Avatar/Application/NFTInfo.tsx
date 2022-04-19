import { Box, Link, Stack, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { ApplicationIcon } from '../assets/application'
import { LinkIcon } from '../assets/link'
import { resolveOpenSeaLink } from '@masknet/web3-shared-evm'
import { formatTokenId } from '../utils'
import { useI18N } from '../locales/i18n_generated'

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
    const t = useI18N()

    return (
        <Box className={classes.root}>
            {!nft ? (
                <Typography>{t.persona_set_nft()}</Typography>
            ) : !owner ? (
                <Typography variant="body1" color="#FFB915">
                    {t.persona_verification_failed()}
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
                                sx={{ marginLeft: 0.5, lineHeight: 0 }}
                                href={resolveOpenSeaLink(nft.address, nft.tokenId)}
                                target="_blank"
                                rel="noopener noreferrer">
                                <LinkIcon sx={{ width: 16, height: 16 }} />
                            </Link>
                        </Stack>
                    </Box>
                </Box>
            )}
        </Box>
    )
}
