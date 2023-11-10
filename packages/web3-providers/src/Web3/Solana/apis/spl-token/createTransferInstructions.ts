import BN from 'bn.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import * as SolanaWeb3 from /* webpackDefer: true */ '@solana/web3.js'
import type { AccountMeta, PublicKey, Signer } from '@solana/web3.js'
import * as BufferLayout from '@solana/buffer-layout'

enum TokenInstruction {
    InitializeMint = 0,
    InitializeAccount = 1,
    InitializeMultisig = 2,
    Transfer = 3,
    Approve = 4,
    Revoke = 5,
    SetAuthority = 6,
    MintTo = 7,
    Burn = 8,
    CloseAccount = 9,
    FreezeAccount = 10,
    ThawAccount = 11,
    TransferChecked = 12,
    ApproveChecked = 13,
    MintToChecked = 14,
    BurnChecked = 15,
    InitializeAccount2 = 16,
    SyncNative = 17,
    InitializeAccount3 = 18,
    InitializeMultisig2 = 19,
    InitializeMint2 = 20,
}

/**
 * Construct a Transfer instruction
 *
 * @param source       Source account
 * @param destination  Destination account
 * @param owner        Owner of the source account
 * @param amount       Number of tokens to transfer
 * @param multiSigners Signing accounts if `owner` is a multisig
 * @param programId    SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export function createTransferInstruction(
    source: PublicKey,
    destination: PublicKey,
    owner: PublicKey,
    amount: number,
    multiSigners: Signer[] = [],
    programId = TOKEN_PROGRAM_ID,
): SolanaWeb3.TransactionInstruction {
    const dataLayout = BufferLayout.struct<{ instruction: number; amount: Uint8Array }>([
        BufferLayout.u8('instruction'),
        BufferLayout.blob(8, 'amount'),
    ])

    const keys = addSigners(
        [
            { pubkey: source, isSigner: false, isWritable: true },
            { pubkey: destination, isSigner: false, isWritable: true },
        ],
        owner,
        multiSigners,
    )

    const data = Buffer.alloc(dataLayout.span)
    dataLayout.encode(
        {
            instruction: TokenInstruction.Transfer,
            amount: new TokenAmount(amount).toBuffer(),
        },
        data,
    )

    return new SolanaWeb3.TransactionInstruction({ keys, programId, data })
}

function addSigners(keys: AccountMeta[], ownerOrAuthority: PublicKey, multiSigners: Signer[]): AccountMeta[] {
    if (multiSigners.length) {
        keys.push({ pubkey: ownerOrAuthority, isSigner: false, isWritable: false })
        for (const signer of multiSigners) {
            keys.push({ pubkey: signer.publicKey, isSigner: true, isWritable: false })
        }
    } else {
        keys.push({ pubkey: ownerOrAuthority, isSigner: true, isWritable: false })
    }
    return keys
}

class TokenAmount extends BN {
    /**
     * Convert to Buffer representation
     */
    override toBuffer(): Buffer {
        const a = super.toArray().reverse()
        const b = Buffer.from(a)
        if (b.length === 8) {
            return b
        }

        if (b.length >= 8) {
            throw new Error('TokenAmount too large')
        }

        const zeroPad = Buffer.alloc(8)
        b.copy(zeroPad)
        return zeroPad
    }

    /**
     * Construct a TokenAmount from Buffer representation
     */
    static fromBuffer(buffer: Buffer): TokenAmount {
        if (buffer.length !== 8) {
            throw new Error(`Invalid buffer length: ${buffer.length}`)
        }

        return new BN(
            [...buffer]
                .reverse()
                .map((i) => `00${i.toString(16)}`.slice(-2))
                .join(''),
            16,
        )
    }
}
