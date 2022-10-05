import { React, useEffect, useState } from "react";
import { formatDollarAmount, formatNumber, formatSmallNumber } from "@utils/functions";
import AddressLink from "../AddressLink";
import assets from "@state/assets";
import tokenInfo from "@state/tokenInfo";
import pairInfo from "@state/pairInfo";

const format = '0.0a';

const BalanceRow = ({ balance, address, name }) => {
  const { tokens } = tokenInfo.useContainer();
  const { pairs } = pairInfo.useContainer();
  const { getUsdTokenPrice} = assets.useContainer();
  const [ usdTokenPrice, setUsdTokenPrice] = useState()

  useEffect(() => {
    const getUsdPrice = async () => {
      setUsdTokenPrice(await getUsdTokenPrice(address, pairs, tokens))
    }
    if (pairs && tokens && address) {
      getUsdPrice()
    }
  }, [pairs, tokens, address])

  const isNumber = isNaN(formatNumber(balance, format))
  const isDollarAmount = isNaN(formatDollarAmount(balance * usdTokenPrice, format))

  return (
    <>
      <tr key={address}>
        <td type="addr" data-label="Address">
          <AddressLink shorten length={4} address={address} />
        </td>
        <td data-label="Name">{name}</td>
        <td type="num" align="center" data-label="Amount">
          {!isNumber ? formatNumber(balance, format) : balance }
        </td>
        <td type="num" align="right" data-label="USD Value">
          { usdTokenPrice
            ? !isDollarAmount 
              ? formatDollarAmount(balance * usdTokenPrice, format)
              : "N/A"
            : null
          }
        </td>
      </tr>
    </>
  );
};

export default BalanceRow;
