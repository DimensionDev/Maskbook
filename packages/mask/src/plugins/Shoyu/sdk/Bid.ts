import { TypedDataSigner } from "@ethersproject/abstract-signer";
import { BigNumber, BigNumberish, BytesLike, utils, constants } from "ethers";

const TYPES = {
    Bid: [
        { name: "askHash", type: "bytes32" },
        { name: "signer", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "price", type: "uint256" },
        { name: "recipient", type: "address" },
        { name: "referrer", type: "address" },
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

export class Bid {
    askHash: string;
    signer: string;
    amount: BigNumber;
    price: BigNumber;
    recipient: string;
    referrer: string;

    constructor(
        askHash: BytesLike,
        signer: string,
        amount: BigNumberish,
        price: BigNumberish,
        recipient: string,
        referrer: string
    ) {
        this.askHash = utils.hexlify(askHash);
        this.signer = signer;
        this.amount = BigNumber.from(amount);
        this.price = BigNumber.from(price);
        this.recipient = recipient;
        this.referrer = referrer;
    }

    private getValue() {
        return {
            askHash: this.askHash,
            signer: this.signer,
            amount: this.amount.toString(),
            price: this.price.toString(),
            recipient: this.recipient,
            referrer: this.referrer,
        };
    }

    hash() {
        return utils._TypedDataEncoder.hashStruct("Bid", TYPES, this.getValue());
    }

    async sign(chainId: number, exchange: string, signer: TypedDataSigner) {
        return utils.splitSignature(await signer._signTypedData(getDomain(chainId, exchange), TYPES, this.getValue()));
    }

    verify(chainId: number, exchange: string, v: number, r: string, s: string) {
        const signer = utils.verifyTypedData(getDomain(chainId, exchange), TYPES, this.getValue(), { v, r, s });
        return signer != constants.AddressZero && signer.toLowerCase() == this.signer.toLowerCase();
    }
}
