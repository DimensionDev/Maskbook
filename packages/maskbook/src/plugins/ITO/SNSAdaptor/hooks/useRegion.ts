import { useState } from 'react'
import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
// TODO better way to do the i18n of region
import regions from '../../assets/regions.json'

// country and region code from https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
// there are many regions in the list, CountryCode is not precise,  so named as RegionCode or CountryRegionCode ?
enum RegionEnum {
    AF,
    AX,
    AL,
    DZ,
    AS,
    AD,
    AO,
    AI,
    AQ,
    AG,
    AR,
    AM,
    AW,
    AU,
    AT,
    AZ,
    BS,
    BH,
    BD,
    BB,
    BY,
    BE,
    BZ,
    BJ,
    BM,
    BT,
    BO,
    BQ,
    BA,
    BW,
    BV,
    BR,
    IO,
    BN,
    BG,
    BF,
    BI,
    KH,
    CM,
    CA,
    CV,
    KY,
    CF,
    TD,
    CL,
    CN,
    CX,
    CC,
    CO,
    KM,
    CG,
    CD,
    CK,
    CR,
    CI,
    HR,
    CU,
    CW,
    CY,
    CZ,
    DK,
    DJ,
    DM,
    DO,
    EC,
    EG,
    SV,
    GQ,
    ER,
    EE,
    ET,
    FK,
    FO,
    FJ,
    FI,
    FR,
    GF,
    PF,
    TF,
    GA,
    GM,
    GE,
    DE,
    GH,
    GI,
    GR,
    GL,
    GD,
    GP,
    GU,
    GT,
    GG,
    GN,
    GW,
    GY,
    HT,
    HM,
    VA,
    HN,
    HK,
    HU,
    IS,
    IN,
    ID,
    IR,
    IQ,
    IE,
    IM,
    IL,
    IT,
    JM,
    JP,
    JE,
    JO,
    KZ,
    KE,
    KI,
    KP,
    KR,
    KW,
    KG,
    LA,
    LV,
    LB,
    LS,
    LR,
    LY,
    LI,
    LT,
    LU,
    MO,
    MK,
    MG,
    MW,
    MY,
    MV,
    ML,
    MT,
    MH,
    MQ,
    MR,
    MU,
    YT,
    MX,
    FM,
    MD,
    MC,
    MN,
    ME,
    MS,
    MA,
    MZ,
    MM,
    NA,
    NR,
    NP,
    NL,
    NC,
    NZ,
    NI,
    NE,
    NG,
    NU,
    NF,
    MP,
    NO,
    OM,
    PK,
    PW,
    PS,
    PA,
    PG,
    PY,
    PE,
    PH,
    PN,
    PL,
    PT,
    PR,
    QA,
    RE,
    RO,
    RU,
    RW,
    BL,
    SH,
    KN,
    LC,
    MF,
    PM,
    VC,
    WS,
    SM,
    ST,
    SA,
    SN,
    RS,
    SC,
    SL,
    SG,
    SX,
    SK,
    SI,
    SB,
    SO,
    ZA,
    GS,
    SS,
    ES,
    LK,
    SD,
    SR,
    SJ,
    SZ,
    SE,
    CH,
    SY,
    TW,
    TJ,
    TZ,
    TH,
    TL,
    TG,
    TK,
    TO,
    TT,
    TN,
    TR,
    TM,
    TC,
    TV,
    UG,
    UA,
    AE,
    GB,
    US,
    UM,
    UY,
    UZ,
    VU,
    VE,
    VN,
    VG,
    VI,
    WF,
    EH,
    YE,
    ZM,
    ZW,
}

export type RegionCode = keyof typeof RegionEnum

const regionNameMap = new Map(regions.map((r) => [r.code, r.name])) as Map<RegionCode, string>
export const regionCodes = regions.map((r) => r.code as RegionCode)

type Region = {
    code: RegionCode
    name: string
}

interface RegionResolver {
    (): Promise<Region>
}

function createRegionResolver(api: string, field: string): RegionResolver {
    return async () => {
        const response = await fetch(api)
        const result = await response.json()
        const code = result[field]
        if (!code) {
            throw new Error('Failed to resolve region')
        }

        if (!(code in RegionEnum)) {
            throw new Error('unknown region')
        }

        return {
            code,
            name: regionNameMap.get(code)!,
        }
    }
}

const IPGeoResolver = createRegionResolver('https://service.r2d2.to/geolocation', 'region')

export function useIPRegion(): AsyncStateRetry<Region> {
    return useAsyncRetry(IPGeoResolver)
}

export function useRegionList(): Array<Region> {
    // TODO return name by i18n
    return regions as Array<Region>
}

export function useRegionSelect(initRegionCodes?: RegionCode[]) {
    return useState<RegionCode[]>(initRegionCodes ? [...initRegionCodes] : [...regionCodes])
}

export function encodeRegionCode(codes: RegionCode[]) {
    const isMoreThanHalf = codes.length > regionCodes.length / 2
    if (isMoreThanHalf) {
        return '-' + regionCodes.filter((c) => !codes.includes(c))
    }
    return '+' + codes.join(',')
}

export function decodeRegionCode(str: string): RegionCode[] {
    str = str.toUpperCase()

    const isReverse = str[0] === '-'

    const codes = str
        .slice(1)
        .split(',')
        .filter((c) => regionNameMap.has(c as RegionCode)) as RegionCode[]

    if (isReverse) {
        return regionCodes.filter((c) => !codes.includes(c))
    }
    return codes
}

export function checkRegionRestrict(regions: RegionCode[]): boolean {
    return regions.length !== regionCodes.length
}
