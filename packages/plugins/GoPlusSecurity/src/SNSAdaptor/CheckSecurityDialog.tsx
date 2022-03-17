import { useRemoteControlledDialog } from '@masknet/shared'
import { DialogContent, Stack } from '@mui/material'
import { makeStyles, MaskDialog, useStylesExtends } from '@masknet/theme'
import { PluginGoPlusSecurityMessages } from '../messages'
import { useI18N } from '../locales'
import { SearchBox } from './components/SearchBox'
import { useAsyncFn } from 'react-use'
import { GoPlusLabs } from '@masknet/web3-providers'
import { Searching } from './components/Searching'
import { TokenCard } from './components/TokenCard'
import { Footer } from './components/Footer'
import type { TokenSecurity } from './components/Conmmon'
import { DefaultPlaceholder } from './components/DefaultPlaceholder'
import { NotFound } from './components/NotFound'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '600px',
    },
    content: {
        width: '552px',
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
        <MaskDialog title={t.dialog_title()} open={open} onClose={closeDialog}>
            <DialogContent className={classes.content}>
                <Stack>
                    <SearchBox onSearch={onSearch} />
                    <Stack>
                        {searching && <Searching />}
                        {error && <NotFound />}
                        {!error && !searching && value && <TokenCard tokenSecurity={value} />}
                        {!error && !searching && !value && <DefaultPlaceholder />}
                    </Stack>
                    <Footer />
                </Stack>
            </DialogContent>
        </MaskDialog>
    )
}
