import { makeStyles } from '@masknet/theme'
import { ERC20TokenDetailed, useChainId, useNativeTokenDetailed } from '@masknet/web3-shared-evm'
import { Grid, Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import type { ChainAddress } from '../../types'
import { toNativeRewardTokenDefn, parseChainAddress } from '../../helpers'
import { APR } from '../../constants'

import { FarmTokenDetailed } from './FarmTokenDetailed'

const useStyles = makeStyles()((theme) => {
    const isDarkMode = theme.palette.mode === 'dark'
    return {
        accordion: {
            marginBottom: '20px',
            width: '100%',
            background: 'transparent',
            ':first-of-type': {
                borderRadius: 0,
            },
            ':before': {
                height: 0,
                opacity: 0,
            },
        },
        accordionSummary: {
            margin: 0,
            padding: 0,
        },
        accordionSummaryContent: {
            margin: '0px!important',
        },
        accordionDetails: {
            marginTop: '8px',
            padding: '8px',
            background: isDarkMode ? '#15171A' : theme.palette.background.default,
            borderRadius: '4px',
        },
        container: {
            fontWeight: 400,
        },
    }
})

export interface AccordionFarmProps extends React.PropsWithChildren<{}> {
    farm: {
        referredTokenDefn: ChainAddress
        rewardTokenDefn: ChainAddress
    }
    allTokensMap: Map<string, ERC20TokenDetailed>
    totalValue: number
    accordionDetails: React.ReactElement
    apr?: number
}

export function AccordionFarm({ farm, allTokensMap, totalValue, accordionDetails }: AccordionFarmProps) {
    const { classes } = useStyles()
    const chainId = useChainId()
    const { value: nativeToken } = useNativeTokenDetailed()

    const nativeRewardToken = toNativeRewardTokenDefn(chainId)
    const referredTokenAddr = parseChainAddress(farm.referredTokenDefn).address
    const rewardTokenAddr = parseChainAddress(farm.rewardTokenDefn).address

    const referredToken =
        farm.referredTokenDefn === nativeRewardToken ? nativeToken : allTokensMap.get(referredTokenAddr)
    const rewardToken = farm.rewardTokenDefn === nativeRewardToken ? nativeToken : allTokensMap.get(rewardTokenAddr)

    return (
        <Accordion className={classes.accordion}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                classes={{
                    root: classes.accordionSummary,
                    content: classes.accordionSummaryContent,
                }}>
                <Grid container className={classes.container}>
                    <Grid item xs={6}>
                        <FarmTokenDetailed
                            token={{ address: parseChainAddress(farm.referredTokenDefn).address, ...referredToken }}
                        />
                    </Grid>
                    <Grid item xs={2} display="flex" alignItems="center">
                        {APR}
                    </Grid>
                    <Grid item xs={4} display="flex" alignItems="center">
                        {Number.parseFloat(totalValue.toFixed(5))} {rewardToken?.symbol || '-'}
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>{accordionDetails}</AccordionDetails>
        </Accordion>
    )
}
