import {
    makeStyles,
    createStyles,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Link,
    Box,
} from '@material-ui/core'
import { CollectibleTab } from './CollectibleTab'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { CollectibleState } from '../hooks/useCollectibleState'

const useStyles = makeStyles((theme) => {
    return createStyles({
        summary: {
            backgroundColor: '#f7f9fa',
            borderRadius: theme.shape.borderRadius,
            color: '#15181B',
        },
        description: {
            color: '#15181b',
            fontSize: 14,
            wordBreak: 'break-all',
        },
        trait_content: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2,1fr)',
            gap: theme.spacing(2),
        },
        trait: {
            backgroundColor: '#F7F9FA',
            padding: theme.spacing(2),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: 14,
            fontWeight: 600,
            color: '#15181B',
        },
        chain_row: {
            display: 'flex',
            justifyContent: 'space-between',
            color: '#15181b',
        },
    })
})

export interface TokenTabProps {}

export function TokenTab(props: TokenTabProps) {
    const classes = useStyles()
    const { token, asset } = CollectibleState.useContainer()

    if (!asset.value) return null

    return (
        <CollectibleTab>
            <Accordion defaultExpanded>
                <AccordionSummary className={classes.summary} expandIcon={<ExpandMoreIcon />}>
                    Base
                </AccordionSummary>
                <AccordionDetails>
                    {asset.value.creator ? (
                        <Typography>
                            Created by{' '}
                            <Link
                                href={`https://opensea.io/accounts/${
                                    asset.value.creator.user?.username ?? asset.value.creator.address
                                }`}>
                                {asset.value.creator.user?.username ?? asset.value.creator.address.slice(2, 8)}
                            </Link>
                        </Typography>
                    ) : (
                        <Typography>
                            Owned by{' '}
                            <Link
                                href={`https://opensea.io/accounts/${
                                    asset.value.owner?.user?.username ?? asset.value.owner?.address ?? ''
                                }`}>
                                {asset.value.owner?.user?.username ?? asset.value.owner?.address.slice(2, 8) ?? ''}
                            </Link>
                        </Typography>
                    )}
                    <Typography className={classes.description}>{asset.value.description}</Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded>
                <AccordionSummary className={classes.summary} expandIcon={<ExpandMoreIcon />}>
                    Properties
                </AccordionSummary>
                <AccordionDetails className={classes.trait_content}>
                    {asset.value.traits.map(({ trait_type, value }) => {
                        return (
                            <Box className={classes.trait} key={trait_type + value}>
                                <Typography sx={{ color: '#1C68F3' }}>{trait_type}</Typography>
                                <Typography>{value}</Typography>
                            </Box>
                        )
                    })}
                </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded>
                <AccordionSummary className={classes.summary} expandIcon={<ExpandMoreIcon />}>
                    About {asset.value.assetContract.name}
                </AccordionSummary>
                <AccordionDetails>
                    <Typography className={classes.description}>{asset.value.assetContract.description}</Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded>
                <AccordionSummary className={classes.summary} expandIcon={<ExpandMoreIcon />}>
                    Chain Info
                </AccordionSummary>
                <AccordionDetails>
                    <Box className={classes.chain_row}>
                        <Typography>Contract Address</Typography>
                        <Link
                            href={`https://etherscan.io/address/${token?.contractAddress ?? ''}`}
                            target="_blank"
                            rel="noopener noreferrer">
                            {token?.contractAddress.slice(0, 6)}...{token?.contractAddress.slice(-6)}
                        </Link>
                    </Box>
                    <Box className={classes.chain_row}>
                        <Typography>Token ID</Typography>
                        <Typography>{token?.tokenId}</Typography>
                    </Box>
                    <Box className={classes.chain_row}>
                        <Typography>BlockChain</Typography>
                        <Typography>Ethereum</Typography>
                    </Box>
                </AccordionDetails>
            </Accordion>
        </CollectibleTab>
    )
}
