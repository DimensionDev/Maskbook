import { ProtocolType } from './types'

export type ProtocolInfo = {
    twitter: string
    name: string
    website: string
}

export const AllProtocolInfos: Record<ProtocolType, ProtocolInfo> = {
    [ProtocolType.Lido]: {
        twitter: 'LidoFinance',
        name: 'Lido',
        website: 'https://stake.lido.fi/',
    },
    [ProtocolType.BENQI]: {
        twitter: 'BenqiFinance',
        name: 'BENQI',
        website: 'https://app.benqi.fi/',
    },
    [ProtocolType.Compound]: {
        twitter: 'compoundfinance',
        name: 'Compound',
        website: 'https://app.compound.finance/',
    },
    [ProtocolType.AAVE]: {
        twitter: 'AaveAave',
        name: 'Aave',
        website: 'https://aave.com/',
    },
    [ProtocolType.Aurigami]: {
        twitter: 'aurigami_PLY',
        name: 'Aurigami',
        website: 'https://www.aurigami.finance/',
    },
    [ProtocolType.Giest]: {
        twitter: 'GeistFinance',
        name: 'Geist Finance',
        website: 'https://geist.finance/',
    },
    [ProtocolType.Alpaca]: {
        twitter: 'Alpaca Finance',
        name: 'AlpacaFinance',
        website: 'https://www.alpacafinance.org/',
    },
    [ProtocolType.Moola]: {
        twitter: 'Moola_Market',
        name: 'Moola',
        website: 'https://app.moola.market/',
    },
    [ProtocolType.Tranquil]: {
        twitter: 'tranquil_fi',
        name: 'Tranquil',
        website: 'https://www.tranquil.finance/',
    },
}
