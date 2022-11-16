import type { EVM_Provider } from '../types.js'
import { BaseHostedProvider } from './BaseHosted.js'

/**
 * EIP-4337 compatible smart contract based wallet.
 */
export class SCWalletProvider extends BaseHostedProvider implements EVM_Provider {}
