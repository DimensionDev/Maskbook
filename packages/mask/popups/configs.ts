import {
    arbitrum as wagmiArbitrum,
    aurora as wagmiAurora,
    avalanche as wagmiAvalanche,
    base as wagmiBase,
    bsc as wagmiBsc,
    celo as wagmiCelo,
    confluxESpace as wagmiConfluxESpace,
    fantom as wagmiFantom,
    gnosis as wagmiGnosis,
    linea as wagmiLinea,
    mainnet as wagmiMainnet,
    metis as wagmiMetis,
    optimism as wagmiOptimism,
    polygon as wagmiPolygon,
    scroll as wagmiScroll,
    xLayer as wagmiXLayer,
    lens as lensMainnet,
    zkSync as wagmiZkSync,
    zora as wagmiZora,
} from 'wagmi/chains'

/**
 * List of all supported chains
 */
export const chains = [
    wagmiMainnet,
    wagmiBase,
    wagmiBsc,
    wagmiPolygon,
    wagmiOptimism,
    wagmiArbitrum,
    wagmiGnosis,
    wagmiAvalanche,
    wagmiAurora,
    wagmiConfluxESpace,
    wagmiFantom,
    wagmiXLayer,
    wagmiMetis,
    wagmiZora,
    wagmiScroll,
    wagmiLinea,
    wagmiZkSync,
    wagmiCelo,
    lensMainnet,
] as const

// privy wallet currently only supports these 10 chains
export const privyVisibleChains = [
    wagmiMainnet,
    wagmiBase,
    wagmiBsc,
    wagmiOptimism,
    wagmiPolygon,
    wagmiLinea,
    wagmiArbitrum,
    wagmiZkSync,
    wagmiCelo,
] as const satisfies ReadonlyArray<(typeof chains)[number]>
