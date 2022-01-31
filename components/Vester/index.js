import React from "react";
import Button from "@components/Button";
import { formatNumber } from "@utils/functions"
import AddressLink from '../AddressLink';

import { Wrapper } from './styled';

const Vester = ({ vester }) => {

  const handleClaim = () => {
      console.log("hadle claim VEX")
  }
    return (
    <Wrapper>
      <thead>
        <tr>
          <th>Address</th>
          <th align="right">VEX Balance</th>
          <th align="right">VEX Amount Claimable</th>
        </tr>
      </thead>
      <tbody>
          <tr key={vester.address}>
            <td type="addr">
              <AddressLink shorten address={vester.address} />
            </td>
            <td type="num" align="center">
                {formatNumber(vester.vexBalance)}
            </td>
            <td type="num" align="right">
              {formatNumber(vester.claimableAmount)}
            </td>
            <td align="right">
            <Button
                  onClick={handleClaim}
                  background={null}
                  color={null}
                >
                  Claim VEX for DAO
                </Button>
            </td>
          </tr>
      </tbody>
    </Wrapper>
  )
}

export default Vester;
