import { Box, Accordion, AccordionSummary, AccordionDetails, Typography, Grid, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { Nft, Metadata } from '../types'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const useStyles = makeStyles()((theme) => {
    return {
        body: {
            background: theme.palette.background.paper,
            borderRadius: theme.spacing(0.5),
        },
        accordion: {
            backgroundColor: 'none',
            boxShadow: 'none',
            borderRadius: theme.spacing(0.5),
            margin: theme.spacing(2, 0, 2, 0),
            '&.Mui-expanded': {
                borderRadius: theme.spacing(0.5),
            },
        },
        accordionHeader: {
            backgroundColor: theme.palette.action.selected,
            borderRadius: theme.spacing(0.5),
        },
        accordionBody: {
            padding: '1px',
        },
        description: {
            margin: theme.spacing(2, 0, 2, 0),
        },
        typography: {
            margin: theme.spacing(0.8, 0, 0.8, 0),
        },
    }
})

interface Props extends React.PropsWithChildren<{}> {
    nft: Nft
    metadata: Metadata
}

function FoundationDetails(props: Props) {
    const { classes } = useStyles()
    return (
        <Box p={3} className={classes.body}>
            <Accordion className={classes.accordion} defaultExpanded={true}>
                <AccordionSummary
                    className={classes.accordionHeader}
                    sx={{ height: '44px' }}
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header">
                    <Typography>About</Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.accordionBody}>
                    <Typography className={classes.typography}>
                        Created by{' '}
                        <Link href={`https://etherscan.io/address/${props.nft.creator.id}`} target="_blank">
                            {formatEthereumAddress(props.nft.creator.id, 4)}
                        </Link>
                    </Typography>
                    <Typography className={classes.typography}>{props.metadata.description}</Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion className={classes.accordion} defaultExpanded={true}>
                <AccordionSummary
                    className={classes.accordionHeader}
                    sx={{ height: '44px' }}
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header">
                    <Typography>Chain info</Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.accordionBody}>
                    <Grid container spacing={0}>
                        <Grid item xs={6}>
                            <Typography className={classes.typography} align="left">
                                Contract Address
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Link href={`https://etherscan.io/address/${props.nft.nftContract.id}`} target="_blank">
                                <Typography className={classes.typography} align="right">
                                    {formatEthereumAddress(props.nft.nftContract.id, 4)}
                                </Typography>
                            </Link>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography className={classes.typography} align="left">
                                Token ID
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography className={classes.typography} align="right">
                                {props.nft.tokenId}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography className={classes.typography} align="left">
                                Blockchain
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography className={classes.typography} align="right">
                                Ethereum
                            </Typography>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Box>
    )
}
export default FoundationDetails
