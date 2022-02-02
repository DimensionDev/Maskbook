import { TypedDataSigner } from "@ethersproject/abstract-signer";
import * as domain from "domain";
import { BigNumberish, BytesLike, Signer, utils } from "ethers";

const keccak256 = (bytes: BytesLike) => {
    return utils.solidityKeccak256(["bytes"], [bytes]);
};

export const signMintBatch721 = async (
    chainId: number,
    tokenFactory: string,
    nft: string,
    to: string,
    tokenIds: BigNumberish[],
    data: BytesLike,
    nonce: BigNumberish,
    signer: Signer
) => {
    // abi.encode(
    //     // keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')
    //     0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f,
    //     keccak256(bytes(Strings.toHexString(uint160(address(this))))),
    //     0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6, // keccak256(bytes("1"))
    //     block.chainid,
    //     address(this)
    // )
    const domainSeparator = utils.defaultAbiCoder.encode(
        ["bytes32", "bytes32", "bytes32", "uint256", "address"],
        [
            "0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f",
            keccak256(tokenFactory.toLowerCase()),
            "0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6",
            chainId,
            tokenFactory,
        ]
    );
    // bytes32 hash = keccak256(abi.encode(MINT_BATCH_721_TYPEHASH, nft, to, tokenIds, data, nonces[owner]++));
    const hash = keccak256(
        utils.defaultAbiCoder.encode(
            ["bytes32", "address", "address", "uint256[]", "bytes", "uint256"],
            ["0x884adba7f4e17962aed36c871036adea39c6d9f81fb25407a78db239e9731e86", nft, to, tokenIds, "0x", nonce]
        )
    );
    // bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, hash));
    const digest = keccak256(utils.solidityPack(["bytes2", "bytes32", "bytes32"], ["0x1901", domainSeparator, hash]));
    return utils.splitSignature(await signer.signMessage(digest));
};

export const signMintBatch1155 = async (
    chainId: number,
    tokenFactory: string,
    nft: string,
    to: string,
    tokenIds: BigNumberish[],
    amounts: BigNumberish[],
    data: BytesLike,
    nonce: BigNumberish,
    signer: TypedDataSigner
) => {
    const domain = {
        name: tokenFactory.toLowerCase(),
        version: "1",
        chainId,
        verifyingContract: tokenFactory,
    };
    const types = {
        MintBatch721: [
            { name: "nft", type: "address" },
            { name: "to", type: "address" },
            { name: "tokenIds", type: "uint256[]" },
            { name: "amounts", type: "uint256[]" },
            { name: "data", type: "bytes" },
            { name: "nonce", type: "uint256" },
        ],
    };
    const value = {
        nft,
        to,
        tokenIds,
        amounts,
        data,
        nonce,
    };
    return utils.splitSignature(await signer._signTypedData(domain, types, value));
};
