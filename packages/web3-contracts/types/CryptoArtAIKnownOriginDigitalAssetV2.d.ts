/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import BN from 'bn.js'
import { ContractOptions } from 'web3-eth-contract'
import { EventLog } from 'web3-core'
import { EventEmitter } from 'events'
import {
    Callback,
    PayableTransactionObject,
    NonPayableTransactionObject,
    BlockType,
    ContractEventLog,
    BaseContract,
} from './types'

interface EventOptions {
    filter?: object
    fromBlock?: BlockType
    topics?: string[]
}

export type Purchase = ContractEventLog<{
    _tokenId: string
    _editionNumber: string
    _buyer: string
    _priceInWei: string
    0: string
    1: string
    2: string
    3: string
}>
export type Minted = ContractEventLog<{
    _tokenId: string
    _editionNumber: string
    _buyer: string
    0: string
    1: string
    2: string
}>
export type EditionCreated = ContractEventLog<{
    _editionNumber: string
    _editionData: string
    _editionType: string
    0: string
    1: string
    2: string
}>
export type Pause = ContractEventLog<{}>
export type Unpause = ContractEventLog<{}>
export type OwnershipRenounced = ContractEventLog<{
    previousOwner: string
    0: string
}>
export type OwnershipTransferred = ContractEventLog<{
    previousOwner: string
    newOwner: string
    0: string
    1: string
}>
export type RoleAdded = ContractEventLog<{
    operator: string
    role: string
    0: string
    1: string
}>
export type RoleRemoved = ContractEventLog<{
    operator: string
    role: string
    0: string
    1: string
}>
export type Transfer = ContractEventLog<{
    _from: string
    _to: string
    _tokenId: string
    0: string
    1: string
    2: string
}>
export type Approval = ContractEventLog<{
    _owner: string
    _approved: string
    _tokenId: string
    0: string
    1: string
    2: string
}>
export type ApprovalForAll = ContractEventLog<{
    _owner: string
    _operator: string
    _approved: boolean
    0: string
    1: string
    2: boolean
}>

export interface CryptoArtAIKnownOriginDigitalAssetV2 extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): CryptoArtAIKnownOriginDigitalAssetV2
    clone(): CryptoArtAIKnownOriginDigitalAssetV2
    methods: {
        supportsInterface(_interfaceId: string | number[]): NonPayableTransactionObject<boolean>

        updateActive(_editionNumber: number | string | BN, _active: boolean): NonPayableTransactionObject<void>

        name(): NonPayableTransactionObject<string>

        getApproved(_tokenId: number | string | BN): NonPayableTransactionObject<string>

        approve(_to: string, _tokenId: number | string | BN): NonPayableTransactionObject<void>

        priceInWeiToken(_tokenId: number | string | BN): NonPayableTransactionObject<string>

        setTokenURI(_tokenId: number | string | BN, _uri: string): NonPayableTransactionObject<void>

        totalSupply(): NonPayableTransactionObject<string>

        updateKoCommissionAccount(_koCommissionAccount: string): NonPayableTransactionObject<void>

        InterfaceId_ERC165(): NonPayableTransactionObject<string>

        editionData(_editionNumber: number | string | BN): NonPayableTransactionObject<string>

        updateTokenBaseURI(_newBaseURI: string): NonPayableTransactionObject<void>

        checkRole(_operator: string, _role: number | string | BN): NonPayableTransactionObject<void>

        transferFrom(_from: string, _to: string, _tokenId: number | string | BN): NonPayableTransactionObject<void>

        totalPurchaseValueInWei(): NonPayableTransactionObject<string>

        tokenOfOwnerByIndex(_owner: string, _index: number | string | BN): NonPayableTransactionObject<string>

        updateStartDate(
            _editionNumber: number | string | BN,
            _startDate: number | string | BN,
        ): NonPayableTransactionObject<void>

        artistCommission(_editionNumber: number | string | BN): NonPayableTransactionObject<{
            _artistAccount: string
            _artistCommission: string
            0: string
            1: string
        }>

        tokenURIEdition(_editionNumber: number | string | BN): NonPayableTransactionObject<string>

        unpause(): NonPayableTransactionObject<void>

        mint(_to: string, _editionNumber: number | string | BN): NonPayableTransactionObject<string>

        'safeTransferFrom(address,address,uint256)'(
            _from: string,
            _to: string,
            _tokenId: number | string | BN,
        ): NonPayableTransactionObject<void>

        'safeTransferFrom(address,address,uint256,bytes)'(
            _from: string,
            _to: string,
            _tokenId: number | string | BN,
            _data: string | number[],
        ): NonPayableTransactionObject<void>

        burn(_tokenId: number | string | BN): NonPayableTransactionObject<void>

        totalNumberAvailable(): NonPayableTransactionObject<string>

        addAddressToAccessControl(_operator: string, _role: number | string | BN): NonPayableTransactionObject<void>

        priceInWeiEdition(_editionNumber: number | string | BN): NonPayableTransactionObject<string>

        tokenBaseURI(): NonPayableTransactionObject<string>

        exists(_tokenId: number | string | BN): NonPayableTransactionObject<boolean>

        tokenByIndex(_index: number | string | BN): NonPayableTransactionObject<string>

        updateArtistCommission(
            _editionNumber: number | string | BN,
            _rate: number | string | BN,
        ): NonPayableTransactionObject<void>

        editionType(_editionNumber: number | string | BN): NonPayableTransactionObject<string>

        tokensOf(_owner: string): NonPayableTransactionObject<string[]>

        paused(): NonPayableTransactionObject<boolean>

        ownerOf(_tokenId: number | string | BN): NonPayableTransactionObject<string>

        purchaseDatesEdition(_editionNumber: number | string | BN): NonPayableTransactionObject<{
            _startDate: string
            _endDate: string
            0: string
            1: string
        }>

        artistsEditions(_artistsAccount: string): NonPayableTransactionObject<string[]>

        totalAvailableEdition(_editionNumber: number | string | BN): NonPayableTransactionObject<string>

        koCommissionAccount(): NonPayableTransactionObject<string>

        balanceOf(_owner: string): NonPayableTransactionObject<string>

        renounceOwnership(): NonPayableTransactionObject<void>

        detailsOfEdition(editionNumber: number | string | BN): NonPayableTransactionObject<{
            _editionData: string
            _editionType: string
            _startDate: string
            _endDate: string
            _artistAccount: string
            _artistCommission: string
            _priceInWei: string
            _tokenURI: string
            _totalSupply: string
            _totalAvailable: string
            _active: boolean
            0: string
            1: string
            2: string
            3: string
            4: string
            5: string
            6: string
            7: string
            8: string
            9: string
            10: boolean
        }>

        updateEditionTokenURI(_editionNumber: number | string | BN, _uri: string): NonPayableTransactionObject<void>

        tokensOfEdition(_editionNumber: number | string | BN): NonPayableTransactionObject<string[]>

        underMint(_to: string, _editionNumber: number | string | BN): NonPayableTransactionObject<string>

        updatePriceInWei(
            _editionNumber: number | string | BN,
            _priceInWei: number | string | BN,
        ): NonPayableTransactionObject<void>

        editionOfTokenId(_tokenId: number | string | BN): NonPayableTransactionObject<string>

        pause(): NonPayableTransactionObject<void>

        purchaseTo(_to: string, _editionNumber: number | string | BN): PayableTransactionObject<string>

        createActiveEdition(
            _editionNumber: number | string | BN,
            _editionData: string | number[],
            _editionType: number | string | BN,
            _startDate: number | string | BN,
            _endDate: number | string | BN,
            _artistAccount: string,
            _artistCommission: number | string | BN,
            _priceInWei: number | string | BN,
            _tokenURI: string,
            _totalAvailable: number | string | BN,
        ): NonPayableTransactionObject<boolean>

        owner(): NonPayableTransactionObject<string>

        ROLE_MINTER(): NonPayableTransactionObject<string>

        hasRole(_operator: string, _role: number | string | BN): NonPayableTransactionObject<boolean>

        symbol(): NonPayableTransactionObject<string>

        removeAddressFromAccessControl(
            _operator: string,
            _role: number | string | BN,
        ): NonPayableTransactionObject<void>

        updateOptionalCommission(
            _editionNumber: number | string | BN,
            _rate: number | string | BN,
            _recipient: string,
        ): NonPayableTransactionObject<void>

        ROLE_UNDER_MINTER(): NonPayableTransactionObject<string>

        createInactivePreMintedEdition(
            _editionNumber: number | string | BN,
            _editionData: string | number[],
            _editionType: number | string | BN,
            _startDate: number | string | BN,
            _endDate: number | string | BN,
            _artistAccount: string,
            _artistCommission: number | string | BN,
            _priceInWei: number | string | BN,
            _tokenURI: string,
            _totalSupply: number | string | BN,
            _totalAvailable: number | string | BN,
        ): NonPayableTransactionObject<boolean>

        reclaimEther(): NonPayableTransactionObject<void>

        setApprovalForAll(_to: string, _approved: boolean): NonPayableTransactionObject<void>

        highestEditionNumber(): NonPayableTransactionObject<string>

        batchTransfer(_to: string, _tokenIds: (number | string | BN)[]): NonPayableTransactionObject<void>

        createActivePreMintedEdition(
            _editionNumber: number | string | BN,
            _editionData: string | number[],
            _editionType: number | string | BN,
            _startDate: number | string | BN,
            _endDate: number | string | BN,
            _artistAccount: string,
            _artistCommission: number | string | BN,
            _priceInWei: number | string | BN,
            _tokenURI: string,
            _totalSupply: number | string | BN,
            _totalAvailable: number | string | BN,
        ): NonPayableTransactionObject<boolean>

        updateArtistsAccount(
            _editionNumber: number | string | BN,
            _artistAccount: string,
        ): NonPayableTransactionObject<void>

        tokenData(_tokenId: number | string | BN): NonPayableTransactionObject<{
            _editionNumber: string
            _editionType: string
            _editionData: string
            _tokenURI: string
            _owner: string
            0: string
            1: string
            2: string
            3: string
            4: string
        }>

        totalSupplyEdition(_editionNumber: number | string | BN): NonPayableTransactionObject<string>

        purchaseDatesToken(_tokenId: number | string | BN): NonPayableTransactionObject<{
            _startDate: string
            _endDate: string
            0: string
            1: string
        }>

        editionActive(_editionNumber: number | string | BN): NonPayableTransactionObject<boolean>

        totalRemaining(_editionNumber: number | string | BN): NonPayableTransactionObject<string>

        updateTotalAvailable(
            _editionNumber: number | string | BN,
            _totalAvailable: number | string | BN,
        ): NonPayableTransactionObject<void>

        ROLE_KNOWN_ORIGIN(): NonPayableTransactionObject<string>

        editionExists(_editionNumber: number | string | BN): NonPayableTransactionObject<boolean>

        tokenURI(_tokenId: number | string | BN): NonPayableTransactionObject<string>

        updateEditionType(
            _editionNumber: number | string | BN,
            _editionType: number | string | BN,
        ): NonPayableTransactionObject<void>

        editionOptionalCommission(_editionNumber: number | string | BN): NonPayableTransactionObject<{
            _rate: string
            _recipient: string
            0: string
            1: string
        }>

        updateEndDate(
            _editionNumber: number | string | BN,
            _endDate: number | string | BN,
        ): NonPayableTransactionObject<void>

        createInactiveEdition(
            _editionNumber: number | string | BN,
            _editionData: string | number[],
            _editionType: number | string | BN,
            _startDate: number | string | BN,
            _endDate: number | string | BN,
            _artistAccount: string,
            _artistCommission: number | string | BN,
            _priceInWei: number | string | BN,
            _tokenURI: string,
            _totalAvailable: number | string | BN,
        ): NonPayableTransactionObject<boolean>

        editionsOfType(_type: number | string | BN): NonPayableTransactionObject<string[]>

        isApprovedForAll(_owner: string, _operator: string): NonPayableTransactionObject<boolean>

        purchase(_editionNumber: number | string | BN): PayableTransactionObject<string>

        totalNumberMinted(): NonPayableTransactionObject<string>

        transferOwnership(_newOwner: string): NonPayableTransactionObject<void>

        batchTransferFrom(
            _from: string,
            _to: string,
            _tokenIds: (number | string | BN)[],
        ): NonPayableTransactionObject<void>

        updateTotalSupply(
            _editionNumber: number | string | BN,
            _totalSupply: number | string | BN,
        ): NonPayableTransactionObject<void>

        tokenURISafe(_tokenId: number | string | BN): NonPayableTransactionObject<string>
    }
    events: {
        Purchase(cb?: Callback<Purchase>): EventEmitter
        Purchase(options?: EventOptions, cb?: Callback<Purchase>): EventEmitter

        Minted(cb?: Callback<Minted>): EventEmitter
        Minted(options?: EventOptions, cb?: Callback<Minted>): EventEmitter

        EditionCreated(cb?: Callback<EditionCreated>): EventEmitter
        EditionCreated(options?: EventOptions, cb?: Callback<EditionCreated>): EventEmitter

        Pause(cb?: Callback<Pause>): EventEmitter
        Pause(options?: EventOptions, cb?: Callback<Pause>): EventEmitter

        Unpause(cb?: Callback<Unpause>): EventEmitter
        Unpause(options?: EventOptions, cb?: Callback<Unpause>): EventEmitter

        OwnershipRenounced(cb?: Callback<OwnershipRenounced>): EventEmitter
        OwnershipRenounced(options?: EventOptions, cb?: Callback<OwnershipRenounced>): EventEmitter

        OwnershipTransferred(cb?: Callback<OwnershipTransferred>): EventEmitter
        OwnershipTransferred(options?: EventOptions, cb?: Callback<OwnershipTransferred>): EventEmitter

        RoleAdded(cb?: Callback<RoleAdded>): EventEmitter
        RoleAdded(options?: EventOptions, cb?: Callback<RoleAdded>): EventEmitter

        RoleRemoved(cb?: Callback<RoleRemoved>): EventEmitter
        RoleRemoved(options?: EventOptions, cb?: Callback<RoleRemoved>): EventEmitter

        Transfer(cb?: Callback<Transfer>): EventEmitter
        Transfer(options?: EventOptions, cb?: Callback<Transfer>): EventEmitter

        Approval(cb?: Callback<Approval>): EventEmitter
        Approval(options?: EventOptions, cb?: Callback<Approval>): EventEmitter

        ApprovalForAll(cb?: Callback<ApprovalForAll>): EventEmitter
        ApprovalForAll(options?: EventOptions, cb?: Callback<ApprovalForAll>): EventEmitter

        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
    }

    once(event: 'Purchase', cb: Callback<Purchase>): void
    once(event: 'Purchase', options: EventOptions, cb: Callback<Purchase>): void

    once(event: 'Minted', cb: Callback<Minted>): void
    once(event: 'Minted', options: EventOptions, cb: Callback<Minted>): void

    once(event: 'EditionCreated', cb: Callback<EditionCreated>): void
    once(event: 'EditionCreated', options: EventOptions, cb: Callback<EditionCreated>): void

    once(event: 'Pause', cb: Callback<Pause>): void
    once(event: 'Pause', options: EventOptions, cb: Callback<Pause>): void

    once(event: 'Unpause', cb: Callback<Unpause>): void
    once(event: 'Unpause', options: EventOptions, cb: Callback<Unpause>): void

    once(event: 'OwnershipRenounced', cb: Callback<OwnershipRenounced>): void
    once(event: 'OwnershipRenounced', options: EventOptions, cb: Callback<OwnershipRenounced>): void

    once(event: 'OwnershipTransferred', cb: Callback<OwnershipTransferred>): void
    once(event: 'OwnershipTransferred', options: EventOptions, cb: Callback<OwnershipTransferred>): void

    once(event: 'RoleAdded', cb: Callback<RoleAdded>): void
    once(event: 'RoleAdded', options: EventOptions, cb: Callback<RoleAdded>): void

    once(event: 'RoleRemoved', cb: Callback<RoleRemoved>): void
    once(event: 'RoleRemoved', options: EventOptions, cb: Callback<RoleRemoved>): void

    once(event: 'Transfer', cb: Callback<Transfer>): void
    once(event: 'Transfer', options: EventOptions, cb: Callback<Transfer>): void

    once(event: 'Approval', cb: Callback<Approval>): void
    once(event: 'Approval', options: EventOptions, cb: Callback<Approval>): void

    once(event: 'ApprovalForAll', cb: Callback<ApprovalForAll>): void
    once(event: 'ApprovalForAll', options: EventOptions, cb: Callback<ApprovalForAll>): void
}
