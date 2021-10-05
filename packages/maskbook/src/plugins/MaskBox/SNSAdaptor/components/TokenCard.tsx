import { Box, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { ERC721ContractDetailed, useERC721TokenDetailed } from '@masknet/web3-shared'

const useStyles = makeStyles()((theme) => ({
    root: {},
}))

export interface TokenCardProps {
    tokenId: string
    contractDetailed: ERC721ContractDetailed
}

export function TokenCard(props: TokenCardProps) {
    const { contractDetailed, tokenId } = props
    const { classes } = useStyles()
    const { value: tokenDetailed } = useERC721TokenDetailed(contractDetailed, tokenId)

    if (!tokenDetailed) return <Box className={classes.root} />

    return (
        <Box className={classes.root}>
            <Typography>{tokenDetailed?.info.name}</Typography>
        </Box>
    )
}
