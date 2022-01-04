import { NftSwap } from '@traderxyz/nft-swap-sdk';
import { createExternalProvider } from '../../../web3/helpers'
import { ExternalProvider, Web3Provider } from '@ethersproject/providers'

const provider = new Web3Provider(createExternalProvider() as unknown as ExternalProvider)
const signer = provider.getSigner()
const swap = new NftSwap(provider, signer)
