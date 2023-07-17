import { memo, useContext, useEffect } from 'react'
import { Icons } from '@masknet/icons'
import { Box, Link, Typography, type Theme } from '@mui/material'
import { CopyButton, SocialAccountList } from '@masknet/shared'
import { MaskLightTheme, MaskThemeProvider, makeStyles } from '@masknet/theme'
import { ScopedDomainsContainer } from '@masknet/web3-hooks-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Others } from '@masknet/web3-providers'
import { SuffixToChainIconMap, SuffixToChainIdMap } from '../constants.js'
import { PluginHeader } from './PluginHeader.js'
import { ENSContext, ENSProvider, type SearchResultInspectorProps } from './context.js'

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
            marginBottom: 1,
            cursor: 'pointer',
            color: theme.palette.maskColor.secondaryDark,
        },
        accounts: {
            marginLeft: 'auto',
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

    return (
        <>
            <PluginHeader />
            <Box className={classes.root}>
                <section className={classes.ensInfo}>
                    {domain && ChainIcon ? <ChainIcon size={30} className={classes.ensIcon} /> : null}
                    <div>
                        {domain ? (
                            <Typography className={classes.domain}>
                                {Others.formatDomainName(domain) || domain}
                            </Typography>
                        ) : null}
                        {reversedAddress ? (
                            <Typography className={classes.reversedAddress}>
                                {reversedAddress}{' '}
                                <CopyButton size={20} className={classes.reversedAddressIcon} text={reversedAddress} />
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={classes.link}
                                    href={
                                        Others.explorerResolver.addressLink(
                                            (suffix ? SuffixToChainIdMap[suffix] : ChainId.Mainnet) ?? ChainId.Mainnet,
                                            reversedAddress,
                                        ) ?? ''
                                    }>
                                    <Icons.LinkOut size={20} className={classes.reversedAddressIcon} />
                                </Link>
                            </Typography>
                        ) : null}
                    </div>
                    <SocialAccountList nextIdBindings={nextIdBindings} className={classes.accounts} />
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
