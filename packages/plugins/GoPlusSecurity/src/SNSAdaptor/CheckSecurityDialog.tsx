import { Box, DialogContent, Stack } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../locales'
import { SearchBox } from './components/SearchBox'
import { useAsyncFn } from 'react-use'
import { GoPlusLabs } from '@masknet/web3-providers'
import { Searching } from './components/Searching'
import { SecurityPanel } from './components/SecurityPanel'
import { Footer } from './components/Footer'
import { Center, TokenSecurity } from './components/Common'
import { DefaultPlaceholder } from './components/DefaultPlaceholder'
import { NotFound } from './components/NotFound'
import type { ChainId } from '@masknet/web3-shared-evm'
import { InjectedDialog } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: 600,
    },
    paperRoot: {},
    content: {
        height: 510,
        maxHeight: 510,
        padding: theme.spacing(2),
    },
}))

export interface BuyTokenDialogProps extends withClasses<never | 'root'> {
    open: boolean
    onClose(): void
}

export function CheckSecurityDialog(props: BuyTokenDialogProps) {
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { open, onClose } = props

    const [{ value, loading: searching, error }, onSearch] = useAsyncFn(async (chainId: ChainId, content: string) => {
        const values = await GoPlusLabs.getTokenSecurity(chainId, [content.trim()])
        if (!Object.keys(values ?? {}).length) throw new Error('Contract Not Found')
        return Object.entries(values ?? {}).map((x) => ({ ...x[1], contract: x[0], chainId }))[0] as
            | TokenSecurity
            | undefined
    }, [])

    return (
        <InjectedDialog classes={{ paper: classes.paperRoot }} title={t.__plugin_name()} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <Stack height="100%" spacing={2}>
                    <Box>
                        <SearchBox onSearch={onSearch} />
                    </Box>
                    <Stack flex={1}>
                        {searching && (
                            <Center>
                                <Searching />
                            </Center>
                        )}
                        {error && !searching && <NotFound />}
                        {!error && !searching && value && <SecurityPanel tokenSecurity={value} />}
                        {!error && !searching && !value && (
                            <Center>
                                <DefaultPlaceholder />
                            </Center>
                        )}
                    </Stack>
                    <Box>
                        <Footer />
                    </Box>
                </Stack>
            </DialogContent>
        </InjectedDialog>
    )
}
