import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import type { FarmExists, FarmDepositIncreased, FarmMetastate } from '@masknet/web3-contracts/types/ReferralFarmsV1'
import type { BigNumberish } from '@ethersproject/bignumber'

export enum TokenType {
    REFER = 0,
    REWARD = 1,
}

export enum PagesType {
    LANDING = 'landing',
    REFERRAL_FARMS = 'Referral Farms',
    CREATE_FARM = 'Create Farm',
    REFER_TO_FARM = 'Refer to Farm',
    BUY_TO_FARM = 'Buy to Farm',
    SELECT_TOKEN = 'Select a Token to Refer',
    ADJUST_REWARDS = 'Adjust Rewards',
    DEPOSIT = 'Deposit',
    TRANSACTION = 'Transaction',
}
export enum TabsReferralFarms {
    TOKENS = 'Crypto Tokens',
    NFT = 'NFTs',
}

export enum TabsCreateFarm {
    NEW = 'New',
    CREATED = 'Created',
}

export enum TabsReferAndBuy {
    NEW = 'New',
    MY_REWARDS = 'My Rewards',
}
export interface PageHistory {
    page: PagesType
    title: string
}

export interface DepositProps {
    totalFarmReward: string
    token?: FungibleTokenDetailed
    attraceFee: number
    requiredChainId: ChainId
    onDeposit: () => Promise<void>
}

export interface AdjustFarmRewards {
    farm?: FarmExistsEvent
    rewardToken?: FungibleTokenDetailed
    referredToken?: FungibleTokenDetailed
}

export interface AdjustFarmRewardsInterface extends AdjustFarmRewards, PageInterface {}

export interface DepositDialogInterface {
    deposit?: DepositProps
    adjustFarmData?: {
        farm?: FarmExistsEvent
        rewardToken?: FungibleTokenDetailed
        referredToken?: FungibleTokenDetailed
    }
}

export enum TransactionStatus {
    CONFIRMATION = 'Confirmation',
    CONFIRMED = 'CONFIRMED',
    FAILED = 'FAILED',
}

type TransactionProps =
    | {
          status: TransactionStatus.CONFIRMATION
          title: string
          subtitle?: string
      }
    | {
          status: TransactionStatus.CONFIRMED
          actionButton: {
              label: string
              onClick: (token?: FungibleTokenDetailed) => void
          }
          transactionHash: string
      }
    | {
          status: TransactionStatus.FAILED
          actionButton: {
              label: string
              onClick: () => void
          }
          subtitle?: string
      }

export interface TransactionDialogInterface {
    onClose?: () => void
    transaction?: TransactionProps
}

export interface DialogInterface {
    hideBackBtn?: boolean
    hideAttrLogo?: boolean
    adjustFarmDialog?: AdjustFarmRewardsInterface
    depositDialog?: DepositDialogInterface
    transactionDialog?: TransactionDialogInterface
}

export type ChangePage = (page: PagesType, title?: string, props?: DialogInterface) => void

export interface PageInterface {
    pageType?: PagesType
    onClose?: () => void
    continue: (currentPage: PagesType, nextPage: PagesType, title?: string, props?: DialogInterface) => void
    onChangePage?: ChangePage
}

export interface ReferralMetaData {
    referral_token: string
    referral_token_name: string
    referral_token_symbol: string
    referral_token_icon: string | string[]
    referral_token_chain_id: ChainId
    promoter_address?: string
    sender: string
}

// uint32 integer which represents the network the token is on.
// Eg: 1 for eth-mainnet, 4 for eth-rinkeby, 137 for polygon-mainnet, ...
// Find more on https://chainlist.org/
export type ChainId = number

// 20-byte hex-encoded "normal" Ethereum Virtual Machine public address.
// Eg: 0xaa97fed7413a944118db403ce65116dcc4d381e2
export type EvmAddress = string

// 32-byte hex-encoded string
// Eg: 0x46401a1ea83c45ef34b64281c8161df97eaf1b1b25ed2a5866c7dc6a1503150f
export type Bytes32 = string

// 24-byte hex-encoded string
// Eg: 0x34b64281c8161df97eaf1b1b25ed2a5866c7dc6a1503150f
export type Bytes24 = string

// 24-byte hex-encoded structure which encodes chainId and EvmAddress (or others) into one addressable value while keeping them recognizable and searchable.
// Limited to uint32 chainIds, which includes most of the blockchain networks. [See full list](https://chainlist.org/)
// Eg: 0x00000001aa97fed7413a944118db403ce65116dcc4d381e2
export type ChainAddress = Bytes24

export interface ChainAddressProps {
    chainId: number
    address: EvmAddress
    isNative: boolean
}

// 32-byte hex-encoded hash of encode(sponsor,rewardToken,referredTokenDefn)
// Eg: 0x7a0bb0f2ee16291cee6e20dfa60968dbb7da4d3b3305bcaeedd5412603ef83b3
export type FarmHash = string

export type FarmExistsEvent = Pick<
    FarmExists['returnValues'],
    'farmHash' | 'sponsor' | 'referredTokenDefn' | 'rewardTokenDefn'
>
export type FarmDepositIncreasedEvent = Pick<FarmDepositIncreased['returnValues'], 'farmHash' | 'delta'>
export type FarmMetastateEvent = Pick<FarmMetastate['returnValues'], 'farmHash' | 'key' | 'value'>

export interface FarmMetaDataEvent extends FarmDepositIncreasedEvent, FarmMetastateEvent {}
export interface FarmMetaDataLog {
    args: FarmMetaDataEvent
    topic: string
}

export interface RewardsHarvested {
    farmHash: FarmHash
    caller: EvmAddress
    rewardTokenDefn: ChainAddress
    value: number
    leafHash: string
}

export interface Farm extends FarmExistsEvent {
    // sum of all delta in FarmDepositIncreased event
    totalFarmRewards: number
    dailyFarmReward: number
}

export interface FarmDetailed extends Farm {
    rewardToken?: FungibleTokenDetailed
    referredToken?: FungibleTokenDetailed
}

export interface Entitlement {
    entitlee: EvmAddress
    farmHash: FarmHash
    confirmation: BigNumberish
    proof: string[]
    rewardValue: BigNumberish
}

export interface Reward extends Entitlement {}

export interface RewardDetailed extends Reward {
    rewardTokenDefn?: ChainAddress
    referredTokenDefn?: ChainAddress
    rewardToken?: FungibleTokenDetailed
    referredToken?: FungibleTokenDetailed
    claimed: boolean
}

export interface AccountRewards {
    [rewardTokenDefn: string]: RewardDetailed[]
}

export interface RewardData {
    dailyReward: number
    totalReward: number
    rewardToken?: FungibleTokenDetailed
}

// apis
export type Node = {
    url: string
    location: Geolocation
}
export type Geolocation = {
    lat: number
    lon: number
}
export type Dao = {
    chainId: number
    address?: string
    startBlockNumber: number
}
export type Airport = {
    iata: string
    lat: number
    lon: number
}
export type Discovery = {
    daoList: Dao[]
    indexers: Node[]
    womOracles: Node[]
    airports: Airport[]
}

export enum RpcMethod {
    oracle_chainId = 'oracle_chainId',
    oracle_getDerivedBlockByHash = 'oracle_getDerivedBlockByHash',
    oracle_getBundleReceipt = 'oracle_getBundleReceipt',
    oracle_getDerivedBlockByNumber = 'oracle_getDerivedBlockByNumber',
    oracle_getOperationalAddress = 'oracle_getOperationalAddress',
    oracle_getTimePromise = 'oracle_getTimePromise',
    oracle_sendProofOfRecommendationOrigin = 'oracle_sendProofOfRecommendationOrigin',
    oracle_sendProofOfRecommendation = 'oracle_sendProofOfRecommendation',
    oracle_getLogs = 'oracle_getLogs',
}
