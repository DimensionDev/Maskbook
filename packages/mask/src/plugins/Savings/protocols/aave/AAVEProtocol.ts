import { ProtocolType } from '../../types'
import AAVELikeProtocol from '../common/protocol/AAVELikeProtocol'

export class AAVEProtocol extends AAVELikeProtocol {
    override get type() {
        return ProtocolType.AAVE
    }
}
