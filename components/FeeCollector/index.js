import React from "react";
import Button from "@components/Button";
import vechain from "@state/vechain";
import { VEX_NETWORK } from "@utils/constants";
import { formatNumber } from "@utils/functions"
import AddressLink from '../AddressLink';

import { Wrapper } from './styled';

const FeeCollector = ({ feeCollector, handleClaim }) => {
  const { address, unlock } = vechain.useContainer();
    return (
    <Wrapper>
      <thead>
        <tr>
          <th>Address</th>
          <th>Name</th>
          <th align="right">Balance</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
          <tr key={VEX_NETWORK.vex_wvet.address}>
            <td type="addr">
              <AddressLink shorten address={VEX_NETWORK.vex_wvet.address} />
            </td>
            <td>{VEX_NETWORK.vex_wvet.name}</td>
            <td type="num" align="center">
                {formatNumber(feeCollector.vexVetBalance)}
            </td>
            <td></td>
          </tr>
          <tr key={VEX_NETWORK.wvet.address}>
            <td type="addr">
              <AddressLink shorten address={VEX_NETWORK.wvet.address} />
            </td>
            <td>{VEX_NETWORK.wvet.name}</td>
            <td type="num" align="center">
                {formatNumber(feeCollector.wvetBalance)}
            </td>
            <td align="right">
            {address ? (
              <Button
                onClick={handleClaim}
                background={null}
                color={null}
                disabled={feeCollector.wvetBalance === '0.0'}
              >
                Claim for DAO
              </Button>
            ) : (
              <Button onClick={unlock}>Connect wallet</Button>
            )}
            </td>
          </tr>
      </tbody>
    </Wrapper>
  )
}

export default FeeCollector;
