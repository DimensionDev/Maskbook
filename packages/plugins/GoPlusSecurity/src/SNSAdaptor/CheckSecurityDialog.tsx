import { Box, DialogContent, Stack } from '@mui/material'
import { makeStyles, MaskDialog, useStylesExtends } from '@masknet/theme'
import { PluginGoPlusSecurityMessages } from '../messages'
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
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: 600,
    },
    content: {
        width: 552,
        height: 580,
        maxHeight: 580,
    },
}))

export interface BuyTokenDialogProps extends withClasses<never | 'root'> {}

export function CheckSecurityDialog(props: BuyTokenDialogProps) {
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    // #region remote controlled buy token dialog
    const { open, closeDialog } = useRemoteControlledDialog(
        PluginGoPlusSecurityMessages.checkSecurityDialogEvent,
        (ev) => {
            if (!ev.open) return
        },
    )
    // #endregion

    const [{ value, loading: searching, error }, onSearch] = useAsyncFn(async (chainId: number, content: string) => {
        const values = await GoPlusLabs.getTokenSecurity(chainId, [content])
        if (!Object.keys(values ?? {}).length) throw new Error()
        return Object.entries(values ?? {}).map((x) => ({ ...x[1], contract: x[0] }))[0] as TokenSecurity | undefined
    }, [])

    return (
        <MaskDialog title={t.dialog_title()} open onClose={closeDialog}>
            <DialogContent className={classes.content}>
                <Stack height="100%" spacing={2}>
                    <Box>
                        <SearchBox onSearch={onSearch} />
                    </Box>
                    <Stack flex={1}>
                        {searching && (
                            <Center>
                                {' '}
                                <Searching />{' '}
                            </Center>
                        )}
                        {error && (
                            <Center>
                                <NotFound />
                            </Center>
                        )}
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
        </MaskDialog>
    )
}
