import { useContext } from 'react'
import { uniqBy } from 'lodash-es'
import { Box } from '@mui/system'
import { SourceSwitcher } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Stack, Typography } from '@mui/material'
import { TrendingViewContext } from './context.js'
import { PluginDescriptor } from './PluginDescriptor.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles<{
    isTokenTagPopper: boolean
    isCollectionProjectPopper: boolean
}>()((theme, props) => {
    return {
        source: {
            display: 'flex',
            justifyContent: 'space-between',
        },
        sourceNote: {
            color: theme.palette.maskColor.secondaryDark,
            marginRight: 4,
            fontWeight: 700,
        },
        sourceMenu: {
            fontSize: 14,
            fontWeight: 700,
        },
        selectedOption: {
            fontWeight: 700,
            color:
                props.isCollectionProjectPopper || props.isTokenTagPopper ?
                    theme.palette.maskColor.main
                :   theme.palette.maskColor.dark,
        },
        arrowDropIcon: {
            color:
                props.isCollectionProjectPopper || props.isTokenTagPopper ?
                    theme.palette.maskColor.main
                :   theme.palette.maskColor.dark,
        },
    }
})

export interface TrendingViewDescriptorProps {
    result: Web3Helper.TokenResultAll
    resultList: Web3Helper.TokenResultAll[]
    setResult: (a: Web3Helper.TokenResultAll) => void
}

export function TrendingViewDescriptor(props: TrendingViewDescriptorProps) {
    const { result, resultList, setResult } = props
    const {
        isProfilePage,
        isCollectionProjectPopper = false,
        isTokenTagPopper = true,
    } = useContext(TrendingViewContext)

    const { classes } = useStyles({ isTokenTagPopper, isCollectionProjectPopper })

    const displayList = uniqBy(
        resultList.filter((x) => x.type === result.type),
        (x) => x.source,
    )

    return (
        <PluginDescriptor
            isCollectionProjectPopper={isCollectionProjectPopper}
            isProfilePage={isProfilePage}
            isTokenTagPopper={isTokenTagPopper}>
            <Box className={classes.source}>
                <Stack
                    className={classes.sourceMenu}
                    display="inline-flex"
                    flexDirection="row"
                    alignItems="center"
                    gap={0.5}>
                    <Typography className={classes.sourceNote}>
                        <Trans>Powered by</Trans>
                    </Typography>
                </Stack>
                <SourceSwitcher
                    resultList={displayList}
                    result={result}
                    setResult={setResult}
                    classes={{ selectedOption: classes.selectedOption, arrowDropIcon: classes.arrowDropIcon }}
                />
            </Box>
        </PluginDescriptor>
    )
}
