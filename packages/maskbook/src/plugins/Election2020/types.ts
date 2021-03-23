import type { EthereumNetwork } from '../../web3/types'

export enum CANDIDATE_TYPE {
    TRUMP = 'Trump',
    BIDEN = 'Biden',
}

export enum US_PARTY_TYPE {
    RED = 'RED',
    BLUE = 'BLUE',
}

export enum US_STATE_TYPE {
    AL = 'AL',
    AK = 'AK',
    AZ = 'AZ',
    AR = 'AR',
    CA = 'CA',
    CO = 'CO',
    CT = 'CT',
    DE = 'DE',
    FL = 'FL',
    GA = 'GA',
    HI = 'HI',
    ID = 'ID',
    IL = 'IL',
    IN = 'IN',
    IA = 'IA',
    KS = 'KS',
    KY = 'KY',
    LA = 'LA',
    ME = 'ME',
    MD = 'MD',
    MA = 'MA',
    MI = 'MI',
    MN = 'MN',
    MS = 'MS',
    MO = 'MO',
    MT = 'MT',
    NE = 'NE',
    NV = 'NV',
    NH = 'NH',
    NJ = 'NJ',
    NM = 'NM',
    NY = 'NY',
    NC = 'NC',
    ND = 'ND',
    OH = 'OH',
    OK = 'OK',
    OR = 'OR',
    PA = 'PA',
    RI = 'RI',
    SC = 'SC',
    SD = 'SD',
    TN = 'TN',
    TX = 'TX',
    UT = 'UT',
    VT = 'VT',
    VA = 'VA',
    WA = 'WA',
    WV = 'WV',
    WI = 'WI',
    WY = 'WY',
    DC = 'DC',
    ZONE_51 = 'ZONE_51',
}

export interface ElectionToken {
    tokenId: string // sha3(state + id)
    tokenImageURL: string
}

export interface Election2020JSONPayload {
    state: US_STATE_TYPE
    winner: CANDIDATE_TYPE
    sender: {
        address: string
        name: string
        message: string
    }
    ntf_token: {
        address: string
        name: string
        symbol: string
    }
    creation_time: number
    network: EthereumNetwork
}
