import { BigNumber, BigNumberish, BytesLike, utils } from "ethers";

class EnglishAuction {
    static from(params: BytesLike) {
        const result = utils.defaultAbiCoder.decode(["uint256", "uint256"], params);
        return new EnglishAuction(result[0], result[1]);
    }

    startPrice: BigNumber;
    startedAt: BigNumber;

    constructor(startPrice: BigNumberish, startedAt: BigNumberish) {
        this.startPrice = BigNumber.from(startPrice.toString());
        this.startedAt = BigNumber.from(startedAt.toString());
    }

    encode() {
        return utils.defaultAbiCoder.encode(["uint256", "uint256"], [this.startPrice, this.startedAt]);
    }
}

export default EnglishAuction;
