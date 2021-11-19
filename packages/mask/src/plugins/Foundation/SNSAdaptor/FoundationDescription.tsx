import { Box, Accordion, AccordionSummary, AccordionDetails, Typography, Grid, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { Nft, Metadata } from '../types'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const useStyles = makeStyles()((theme) => {
    return {
        accordion: {
            backgroundColor: 'none',
            minWidth: '435px',
            boxShadow: 'none',
            borderRadius: '4px',
            margin: theme.spacing(2, 0, 2, 0),
            '&.Mui-expanded': {
                borderRadius: '4px',
            },
        },
        accordionHeader: {
            backgroundColor: theme.palette.action.selected,
            minWidth: '435px',
            minHeight: '64px',
            borderRadius: '4px',
        },
        accordionBody: {
            minWidth: '435px',
            padding: 0,
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
    description: string
    nft: Nft
    metadata: Metadata
}

function FoundationDescription() {
    const { classes } = useStyles()
    return (
        <Box p={3}>
            <Accordion className={classes.accordion} defaultExpanded={true}>
                <AccordionSummary
                    className={classes.accordionHeader}
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header">
                    <Typography>About</Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.accordionBody}>
                    <Typography className={classes.typography}>
                        Created by{' '}
                        <Link
                            href="https://etherscan.io/address/0x44458837ac4036337e5Ce46Ce28A744e05e02016"
                            target="_blank">
                            {formatEthereumAddress('0x44458837ac4036337e5Ce46Ce28A744e05e02016', 4)}
                        </Link>
                    </Typography>
                    <Typography className={classes.typography}>
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Consequuntur esse corporis
                        perspiciatis minima inventore, ducimus debitis saepe omnis repellat deleniti, dolorem veritatis
                        veniam officia distinctio dolores adipisci architecto earum possimus.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion className={classes.accordion} defaultExpanded={true}>
                <AccordionSummary
                    className={classes.accordionHeader}
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
                            <Link
                                href="https://etherscan.io/address/0x44458837ac4036337e5Ce46Ce28A744e05e02016"
                                target="_blank">
                                <Typography className={classes.typography} align="right">
                                    {formatEthereumAddress('0x44458837ac4036337e5Ce46Ce28A744e05e02016', 4)}
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
                                450
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
export default FoundationDescription
