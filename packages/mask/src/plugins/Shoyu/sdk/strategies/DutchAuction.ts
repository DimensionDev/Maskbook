import { BigNumber, BigNumberish, BytesLike, utils } from "ethers";

class DutchAuction {
    static from(params: BytesLike) {
        const result = utils.defaultAbiCoder.decode(["uint256", "uint256", "uint256"], params);
        return new DutchAuction(result[0], result[1], result[2]);
    }

    startPrice: BigNumber;
    endPrice: BigNumber;
    startedAt: BigNumber;

    constructor(startPrice: BigNumberish, endPrice: BigNumberish, startedAt: BigNumberish) {
        this.startPrice = BigNumber.from(startPrice.toString());
        this.endPrice = BigNumber.from(endPrice.toString());
        this.startedAt = BigNumber.from(startedAt.toString());
    }

    encode() {
        return utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint256"],
            [this.startPrice, this.endPrice, this.startedAt]
        );
    }
}

export default DutchAuction;
