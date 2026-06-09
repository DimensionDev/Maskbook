import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/material'
import { memo, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import AddContactInputPanel from '../../../components/AddContactInputPanel/index.js'
import { NormalHeader } from '../../../components/index.js'
import { ContactsContext, useTitle, useTokenParams } from '../../../hooks/index.js'
import { FungibleTokenSection } from './FungibleTokenSection.js'
import { useLingui } from '@lingui/react/macro'

const useStyles = makeStyles()((theme) => ({
    page: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        height: '100%',
    },
    body: {
        flexGrow: 1,
        // padding: theme.spacing(2, 2, 0),
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },
    panel: {
        '&:not([hidden])': {
            marginTop: theme.spacing(2),
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            overflow: 'auto',
        },
    },
}))

const Transfer = memo(function Transfer() {
    const { t } = useLingui()
    const { classes } = useStyles()

    useTitle(t`Send`)
    const [params, setParams] = useSearchParams()

    const { address } = ContactsContext.useContainer()
    useEffect(() => {
        setParams(
            (p) => {
                p.set('recipient', address)
                return p.toString()
            },
            { replace: true },
        )
    }, [address, setParams])

    return (
        <Box className={classes.page}>
            <NormalHeader />
            <div className={classes.body}>
                <AddContactInputPanel p={0} m="16px 16px 0" autoFocus />
                <div className={classes.panel} data-hide-scrollbar>
                    <FungibleTokenSection />
                </div>
            </div>
        </Box>
    )
})

export const Component = memo(function TransferPage() {
    const [params] = useSearchParams()
    const defaultAddress = params.get('recipient') || ''
    const defaultName = params.get('recipientName') || ''
    const { chainId } = useTokenParams()
    const rawPendingChainId = params.get('pendingChainId')
    const pendingChainId = rawPendingChainId ? Number.parseInt(rawPendingChainId, 10) : undefined
    const defaultChainId = pendingChainId ?? chainId

    const initialState = useMemo(
        () => ({ defaultAddress, defaultName, defaultChainId }),
        [defaultAddress, defaultName, defaultChainId],
    )
    return (
        <ContactsContext initialState={initialState}>
            <Transfer />
        </ContactsContext>
    )
})
