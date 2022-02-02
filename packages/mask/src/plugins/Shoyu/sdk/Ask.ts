import { TypedDataSigner } from "@ethersproject/abstract-signer";
import { BigNumber, BigNumberish, BytesLike, utils, constants } from "ethers";

const TYPES = {
    Ask: [
        { name: "signer", type: "address" },
        { name: "proxy", type: "address" },
        { name: "token", type: "address" },
        { name: "tokenId", type: "uint256" },
        { name: "amount", type: "uint256" },
        { name: "strategy", type: "address" },
        { name: "currency", type: "address" },
        { name: "recipient", type: "address" },
        { name: "deadline", type: "uint256" },
        { name: "params", type: "bytes" },
    ],
};

function getDomain(chainId: number, exchange: string) {
    return {
        name: exchange.toLowerCase(),
        version: "1",
        chainId,
        verifyingContract: exchange,
    };
}

export class Ask {
    signer: string;
    proxy: string;
    token: string;
    tokenId: BigNumber;
    amount: BigNumber;
    strategy: string;
    currency: string;
    recipient: string;
    deadline: BigNumber;
    params: string;

    constructor(
        signer: string,
        proxy: string,
        token: string,
        tokenId: BigNumberish,
        amount: BigNumberish,
        strategy: string,
        currency: string,
        recipient: string,
        deadline: BigNumberish,
        params: BytesLike
    ) {
        this.signer = signer;
        this.proxy = proxy;
        this.token = token;
        this.tokenId = BigNumber.from(tokenId);
        this.amount = BigNumber.from(amount);
        this.strategy = strategy;
        this.currency = currency;
        this.recipient = recipient;
        this.deadline = BigNumber.from(deadline);
        this.params = utils.hexlify(params);
    }

    private getValue() {
        return {
            signer: this.signer,
            proxy: this.proxy,
            token: this.token,
            tokenId: this.tokenId.toString(),
            amount: this.amount.toString(),
            strategy: this.strategy,
            currency: this.currency,
            recipient: this.recipient,
            deadline: this.deadline.toString(),
            params: this.params,
        };
    }

    hash() {
        return utils._TypedDataEncoder.hashStruct("Ask", TYPES, this.getValue());
    }

    async sign(chainId: number, exchange: string, signer: TypedDataSigner) {
        return utils.splitSignature(await signer._signTypedData(getDomain(chainId, exchange), TYPES, this.getValue()));
    }

    verify(chainId: number, exchange: string, v: number, r: string, s: string) {
        const signer = utils.verifyTypedData(getDomain(chainId, exchange), TYPES, this.getValue(), { v, r, s });
        return signer != constants.AddressZero && signer.toLowerCase() == this.signer.toLowerCase();
    }
}
