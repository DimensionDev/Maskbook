import { memo, useContext, useEffect } from 'react'
import { Icons } from '@masknet/icons'
import { Box, Link, Typography, type Theme } from '@mui/material'
import { CopyButton, SocialAccountList, useUserTotalBalance } from '@masknet/shared'
import { MaskLightTheme, MaskThemeProvider, makeStyles } from '@masknet/theme'
import { ScopedDomainsContainer } from '@masknet/web3-hooks-base'
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { EVMUtils } from '@masknet/web3-providers'
import { PluginHeader } from './PluginHeader.js'
import { SuffixToChainIconMap, SuffixToChainIdMap } from '../constants.js'
import { ENSContext, ENSProvider, type SearchResultInspectorProps } from './context.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            padding: theme.spacing(0, 2),
        },
        ensInfo: {
            height: 42,
            display: 'flex',
            alignItems: 'center',
            marginBottom: 16,
        },
        ensIcon: {
            marginRight: 4,
        },
        domain: {
            fontWeight: 700,
            color: theme.palette.maskColor.publicMain,
            fontSize: 18,
            lineHeight: '18px',
        },
        reversedAddress: {
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.maskColor.secondaryDark,
            fontSize: 14,
            lineHeight: '18px',
        },
        link: {
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none !important',
        },
        reversedAddressIcon: {
            marginRight: 2,
            cursor: 'pointer',
            color: theme.palette.maskColor.secondaryDark,
            lineHeight: 0,
        },
        accounts: {
            marginLeft: 'auto',
            display: 'flex',
            gap: theme.spacing(2),
            alignItems: 'center',
        },
        walletValue: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
        },
        label: {
            color: theme.palette.maskColor.publicSecond,
            fontSize: 14,
            fontWeight: 400,
            lineHeight: '18px',
        },
        value: {
            color: theme.palette.maskColor.publicMain,
            fontSize: 16,
            fontWeight: 700,
            lineHeight: '20px',
        },
    }
})

export const SearchResultInspectorContent = memo(function SearchResultInspectorContent() {
    const { classes } = useStyles()
    const { reversedAddress, nextIdBindings, domain } = useContext(ENSContext)
    const suffix = domain ? domain.split('.').pop()! : undefined
    const ChainIcon = suffix ? SuffixToChainIconMap[suffix] ?? Icons.ETH : null

    const { setPair } = ScopedDomainsContainer.useContainer()
    useEffect(() => {
        if (!reversedAddress || !domain) return
        setPair(reversedAddress, domain)
    }, [reversedAddress, domain])

    const { data: totalBalance } = useUserTotalBalance(reversedAddress)

    return (
        <>
            <PluginHeader />
            <Box className={classes.root}>
                <section className={classes.ensInfo}>
                    {domain && ChainIcon ?
                        <ChainIcon size={30} className={classes.ensIcon} />
                    :   null}
                    <div>
                        {domain ?
                            <Typography className={classes.domain}>
                                {EVMUtils.formatDomainName(domain) || domain}
                            </Typography>
                        :   null}
                        {reversedAddress ?
                            <Typography className={classes.reversedAddress}>
                                {formatEthereumAddress(reversedAddress, 4)}{' '}
                                <CopyButton size={20} className={classes.reversedAddressIcon} text={reversedAddress} />
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={classes.link}
                                    href={
                                        EVMUtils.explorerResolver.addressLink(
                                            (suffix ? SuffixToChainIdMap[suffix] : ChainId.Mainnet) ?? ChainId.Mainnet,
                                            reversedAddress,
                                        ) ?? ''
                                    }>
                                    <Icons.LinkOut size={20} className={classes.reversedAddressIcon} />
                                </Link>
                            </Typography>
                        :   null}
                    </div>
                    <div className={classes.accounts}>
                        {totalBalance !== undefined ?
                            <div className={classes.walletValue}>
                                <Trans>
                                    <Typography className={classes.label}>USD Value</Typography>
                                    <Typography className={classes.value}>
                                        $
                                        {totalBalance.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </Typography>
                                </Trans>
                            </div>
                        :   null}
                        <SocialAccountList nextIdBindings={nextIdBindings} />
                    </div>
                </section>
            </Box>
        </>
    )
})

const useTheme = () => MaskLightTheme
const useMaskIconPalette = (theme: Theme) => theme.palette.mode

export const SearchResultInspector = memo(function SearchResultInspector(props: SearchResultInspectorProps) {
    return (
        <ENSProvider {...props}>
            <MaskThemeProvider useTheme={useTheme} useMaskIconPalette={useMaskIconPalette}>
                <SearchResultInspectorContent />
            </MaskThemeProvider>
        </ENSProvider>
    )
})
