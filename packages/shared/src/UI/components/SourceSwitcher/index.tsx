import { makeStyles } from '@masknet/theme'
import { uniqBy } from 'lodash-es'
import { Stack, Typography } from '@mui/material'
import type { Web3Helper } from '@masknet/web3-helpers'
import { resolveSourceTypeName } from '@masknet/web3-shared-base'
import { Box } from '@mui/system'
import { FootnoteMenu } from '../FootnoteMenu/index.js'
import { SourceProviderIcon } from '../SourceProviderIcon/index.js'

const useStyles = makeStyles()((theme) => {
    return {
        source: {
            justifyContent: 'space-between',
        },
        sourceMenu: {
            fontSize: 14,
            fontWeight: 700,
        },
        sourceName: {
            fontWeight: 700,
            color: theme.palette.mode === 'dark' ? '' : theme.palette.maskColor.publicMain,
        },
    }
})

export interface SourceSwitcherProps extends withClasses<'source' | 'selectedOption' | 'arrowDropIcon'> {
    result: Web3Helper.TokenResultAll
    resultList: Web3Helper.TokenResultAll[]
    setResult: (a: Web3Helper.TokenResultAll) => void
}

export function SourceSwitcher(props: SourceSwitcherProps) {
    const { result, setResult, resultList } = props
    const { classes } = useStyles(undefined, { props })
    const sourceTypes = uniqBy(resultList, (x) => x.source).map((x) => x.source)
    return (
        <Box className={classes.source}>
            <Stack
                className={classes.sourceMenu}
                display="inline-flex"
                flexDirection="row"
                alignItems="center"
                gap={0.5}>
                <FootnoteMenu
                    options={uniqBy(resultList, (x) => x.source).map((x) => ({
                        name: (
                            <Stack display="inline-flex" flexDirection="row" alignItems="center" gap={0.5}>
                                <Typography className={classes.sourceName}>
                                    {resolveSourceTypeName(x.source)}
                                </Typography>
                                <SourceProviderIcon provider={x.source} size={20} />
                            </Stack>
                        ),
                        value: x,
                    }))}
                    selectedIndex={typeof result.source !== 'undefined' ? sourceTypes.indexOf(result.source) : -1}
                    onChange={setResult}
                    classes={{ title: classes.selectedOption, icon: classes.arrowDropIcon }}
                />
            </Stack>
        </Box>
    )
}
