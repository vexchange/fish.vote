import vechain from "@state/vechain";
import { find, isEmpty } from 'lodash';
import { createContainer } from "unstated-next";
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { VEX_NETWORK } from "@utils/constants";
import { utils, ethers } from "ethers";
import FeeCollectorABI from "@utils/abi/FeeCollector";
import VEXABI from "@utils/abi/vex";
import TreasuryVesterABI from "@utils/abi/TreasuryVester";

import ErrorToast from "@components/ErrorToast";
import SuccessToast from "@components/SuccessToast";
import PendingToast from "@components/PendingToast";

function useAssets()
{
    const { provider, address } = vechain.useContainer();

    // list of token addresses to display as assets
    const DISPLAYED_ASSETS = [
        VEX_NETWORK.vex_governance_token,
        VEX_NETWORK.wvet,
        ];

    const [balances, setBalances] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [vester, setVester] = useState(null);
    const [isLoadingVester, setIsLoadingVester] = useState(true);
    const [feeCollector, setFeeCollector] = useState(null);
    const [isLoadingFeeCollector, setIsLoadingFeeCollector] = useState(true);
    const [updateBalances, setUpdateBalances] = useState(false);

    useEffect(() => {
        const getBalances = () => {
            setIsLoading(true);
            const balanceOfABI = find(VEXABI, { name: 'balanceOf' });

            const balancePromises = DISPLAYED_ASSETS.map(async token => {
                const balanceOfMethod = provider.thor.account(token.address).method(balanceOfABI);
                const { decoded } = await balanceOfMethod.call(VEX_NETWORK.timelock.address);

                return {
                    address: token.address,
                    name: token.name,
                    balance: utils.formatUnits(decoded['0']),
                };
            });

            Promise.all(balancePromises).then(data => {
                setBalances(data);
                setIsLoading(false);
            })
        }

        const getVester = async () => {
            setIsLoadingVester(true);
            const address = VEX_NETWORK.vester.address
            const balanceOfABI = find(VEXABI, { name: 'balanceOf' });
            const balanceOfMethod = provider.thor.account(VEX_NETWORK.vex_governance_token.address).method(balanceOfABI);

            const vesterABIs = ['vestingBegin', 'vestingEnd', 'vestingAmount', 'lastUpdate'].map( methodName => find(TreasuryVesterABI, { name: methodName }));
            const vesterMethods = vesterABIs.map( abi => provider.thor.account(address).method(abi).call());

            const vexBalanceResult  = (await balanceOfMethod.call(address)).decoded[0];
            const vesterNumbers = (await Promise.all(vesterMethods)).map(result => result.decoded['0']);

            const currentBlockTimestamp = (await provider.thor.block().get()).timestamp;
            const vestingEnd = +vesterNumbers[1]
            const vestingBegin = +vesterNumbers[0]
            const lastUpdate = +vesterNumbers[3]
            const vestingAmount = vesterNumbers[2]
            const vexBalance = utils.formatUnits(vexBalanceResult)
           

            let claimableAmount
            if (currentBlockTimestamp >= vestingEnd) {
                claimableAmount = vexBalance;
            } 
            else {
                const rawAmount = ethers.BigNumber.from(vestingAmount).mul(currentBlockTimestamp - lastUpdate).div(vestingEnd - vestingBegin);
                claimableAmount = utils.formatUnits(rawAmount.toString());;
            }

            setVester({ vexBalance, claimableAmount, address})
            setIsLoadingVester(false);
        }

        const getFeeCollector = async () => {
          setIsLoadingFeeCollector(true);
          const address = VEX_NETWORK.fee_collector.address
          const balanceOfABI = find(VEXABI, { name: 'balanceOf' });
          const balanceOfMethods = [VEX_NETWORK.vex_wvet.address, VEX_NETWORK.wvet.address].map( tokenAddress => provider.thor.account(tokenAddress).method(balanceOfABI).call(address))
          const balances = (await Promise.all(balanceOfMethods)).map(result => result.decoded['0']);
          const vexVetBalance = utils.formatUnits(balances[0].toString())
          const wvetBalance  = utils.formatUnits(balances[1].toString())

          setFeeCollector({ vexVetBalance, wvetBalance})
          setIsLoadingFeeCollector(false);
      }

        if ((isEmpty(balances) || updateBalances) && provider) {
            getBalances();
            setUpdateBalances(false)
        }
        if ((!vester || updateBalances) && provider) {
            getVester();
            setUpdateBalances(false)
        }

        if ((!feeCollector || updateBalances) && provider) {
          getFeeCollector();
          setUpdateBalances(false)
      }
    }, [provider, updateBalances]);

    const claimVEXFromVester = async () => {
        const claimABI = find(TreasuryVesterABI, { name: 'claim' })
        const method = provider.thor.account(VEX_NETWORK.vester.address).method(claimABI);;

        const clause = method.asClause();
        const txResponse = await provider.vendor.sign('tx', [clause])
                                  .signer(address) // This modifier really necessary?
                                  .comment("Sign to claim VEX for DAO")
                                  .request();
    
        const toastID = toast.loading(<PendingToast tx={txResponse} />);
        const txVisitor = provider.thor.transaction(txResponse.txid);
        let txReceipt = null;
        const ticker = provider.thor.ticker();
    
        // Wait for tx to be confirmed and mined
        while(!txReceipt) {
          await ticker.next();
          txReceipt = await txVisitor.getReceipt();
        }
    
        if (!txReceipt.reverted) {
          toast.update(toastID, {
            render: (
              <SuccessToast
                tx={txReceipt}
                action="Claimed VEX"
              />
            ),
            type: "success",
            isLoading: false,
            autoClose: 5000
          });
        }
        // Handle failed tx
        else {
          toast.update(toastID, {
            render: <ErrorToast />,
            type: "error",
            isLoading: false,
            autoClose: 5000
          });
        }
    
        // Update balances of assets and vester
        setUpdateBalances(true);
      };

      const claimWVETFromCollector = async () => {
        const claimABI = find(FeeCollectorABI, { name: 'SweepDesired' })
        const method = provider.thor.account(VEX_NETWORK.fee_collector.address).method(claimABI);;

        const clause = method.asClause();
        const txResponse = await provider.vendor.sign('tx', [clause])
                                  .signer(address) // This modifier really necessary?
                                  .comment("Sign to claim WVET for DAO")
                                  .request();
    
        const toastID = toast.loading(<PendingToast tx={txResponse} />);
        const txVisitor = provider.thor.transaction(txResponse.txid);
        let txReceipt = null;
        const ticker = provider.thor.ticker();
    
        // Wait for tx to be confirmed and mined
        while(!txReceipt) {
          await ticker.next();
          txReceipt = await txVisitor.getReceipt();
        }
    
        if (!txReceipt.reverted) {
          toast.update(toastID, {
            render: (
              <SuccessToast
                tx={txReceipt}
                action="Claimed WVET"
              />
            ),
            type: "success",
            isLoading: false,
            autoClose: 5000
          });
        }
        // Handle failed tx
        else {
          toast.update(toastID, {
            render: <ErrorToast />,
            type: "error",
            isLoading: false,
            autoClose: 5000
          });
        }
    
        // Update balances of assets and vester
        setUpdateBalances(true);
      };
    

    return {
        balances,
        vester,
        isLoading,
        isLoadingVester,
        feeCollector,
        isLoadingFeeCollector,
        claimVEXFromVester,
        claimWVETFromCollector
    }
}

// Create unstated-next container
const assets = createContainer(useAssets);
export default assets;
