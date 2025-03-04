import { ethers } from "ethers";
import { find } from "lodash";
import { getAddress } from "ethers/lib/utils";

// Total VEX to reach quorum
const QUORUM_TOTAL_VEX = 1000000


const vex_governance_token = {
  name: "VEX",
  address: "0x0BD802635eb9cEB3fCBe60470D2857B86841aab6",
}

const wvet = {
  name: "Wrapped VET",
  address: "0xD8CCDD85abDbF68DFEc95f06c973e87B1b5A9997"
}

const vex_wvet = {
  name: "VEX/WVET",
  address: "0x39cd888a1583498AD30E716625AE1a00ff51286D"
}
// Declare constants by network
const VEX_CONSTANTS = {
  mainnet: {
    node_url: "https://mainnet.veblocks.net",
    explorer_base_url: "https://explore.vechain.org/",
    governor_alpha: {
      name: "Governor",
      address: "0xa0a636893Ed688076286174Bc23b34C31BED3089",
    },
    distributor: {
      name: "Distributor",
      address: "0x72ee1c849b7353ad1452e56af136e4b0ff68a07e",
      displayed_assets: [wvet]
    },
    vex_governance_token,
    vex_wvet,
    wvet,
    timelock: {
      name: "Timelock",
      address: "0x41D293Ee2924FF67Bd934fC092Be408162448f86",
      displayed_assets: [wvet, vex_governance_token, vex_wvet]
    },
    factory: {
      name: "VexchangeV2Factory",
      address: "0xB312582C023Cc4938CF0faEA2fd609b46D7509A2"
    },
    router: {
      name: "Router",
      address: "0x6c0a6e1d922e0e63901301573370b932ae20dadb",
    },
    vester: {
      name: "TreasuryVester",
      address: "0x8Fc3737CF99984961b43f86ce5C82cfaa4B49657"
    },
    wvet_fee_collector: {
      name: "WVETFeeCollector",
      address: "0xc2ccf0af1b34367b639d0fd7bb4335da12bcc798",
      displayed_assets: [wvet]
    },
    vex_fee_collector: {
      name: "VEXFeeCollector",
      address: "0x10445a86645838306194c07f81ebd00bb7b82598",
      displayed_assets: [wvet, vex_governance_token]
    },
  },
  testnet: {
    node_url: "https://testnet.veblocks.net",
    explorer_base_url: "https://explore-testnet.vechain.org/",
    governor_alpha: {
      name: "Governor",
      address: "0x40b4F819bB35D07159AADDd415670328ecf301b5",
    },
    vex_governance_token: {
      name: "VEX",
      address: "0x10bf15c804AB02cEBb9E82CB61B200bba46C7CDE",
    },
    timelock: {
      name: "Timelock",
      address: "0xFd883d0947848eeA79bA1425fcE38b6f00dF3ea0",
    },
    factory: {
      name: "VexchangeV2Factory",
      address: "0xD15A91EE3f57313A6129A4a58c73fcBDAd34c23c"
    },
    router: {
      name: "Router",
      address: "0x01d6B50b31C18D7f81EDe43935caDF79901B0ea0"
    },
    wvet: {
      name: "Wrapped VET",
      address: "0x93E5Fa8011612FAB061eF58CbAB9262d2e76407b"
    },
    vester: {
      name: "TreasuryVester",
      address: "0x0f2bAC68Ec5F5Ca86c13a9829BCEd9f442f1786C"
    }
  }
}

// Collect current network
const MAINNET = process.env.NEXT_PUBLIC_VECHAIN_MAINNET === "true";

// Return network array based on network
const VEX_NETWORK = VEX_CONSTANTS[MAINNET ? "mainnet" : "testnet"]

// Return network name
const VEX_NETWORK_NAME = MAINNET ? "mainnet" : "testnet"

// Declare possible governance actions
const VEX_ACTIONS = [
  {
    contract: "VEX Token",
    address: VEX_NETWORK.vex_governance_token.address,
    functions: [
      {
        name: "Transfer",
        signature: "transfer(address,uint256)",
        args: [
          {
            name: "recipient",
            placeholder: "address",
            type: "text",
          },
          {
            name: "amount",
            placeholder: "value",
            type: "number",
            decimals: 18
          },
        ],
        values: [],
      },
      {
        name: "Approve",
        signature: "approve(address,uint256)",
        args: [
          {
            name: "spender",
            placeholder: "address",
            type: "text"
          },
          {
            name: "amount",
            placeholder: "amount",
            type: "number",
            decimals: 18
          }
        ],
        values: [],
      },
      {
        name: "Mint",
        signature: "mint(address,uint256)",
        args: [
          {
            name: "destination",
            placeholder: "address",
            type: "text"
          },
          {
            name: "amount",
            placeholder: "amount",
            type: "number",
            decimals: 18
          }
        ],
        values: []
      },
      {
        name: "Burn",
        signature: "burn(uint256)",
        args: [
          {
            name: "rawAmount",
            placeholder: "amount",
            type: "number",
            decimals: 18
          }
        ],
        values: []
      },
      {
        name: "Set minter",
        signature: "setMinter(address)",
        args: [
          {
            name: "newMinter",
            placeholder: "address",
            type: "text"
          }
        ],
        values: []
      }
    ],
  },
  {
    contract: "WVET Token",
    address: VEX_NETWORK.wvet.address,
    functions: [
      {
        name: "Transfer",
        signature: "transfer(address,uint256)",
        args: [
          {
            name: "recipient",
            placeholder: "address",
            type: "text",
          },
          {
            name: "amount",
            placeholder: "value",
            type: "number",
            decimals: 18
          },
        ],
        values: [],
      },
      {
        name: "Approve",
        signature: "approve(address,uint256)",
        args: [
          {
            name: "spender",
            placeholder: "address",
            type: "text"
          },
          {
            name: "amount",
            placeholder: "amount",
            type: "number",
            decimals: 18
          }
        ],
        values: [],
      },
    ],
  },
  {
    contract: "Timelock",
    address: VEX_NETWORK.timelock.address,
    functions: [
      {
        name: "Set pending admin",
        signature: "setPendingAdmin(address)",
        args: [
          {
            name: "admin",
            placeholder: "address",
            type: "text",
          },
        ],
        values: [],
      },
      {
        name: "Set timelock delay",
        signature: "setDelay(uint256)",
        args: [
          {
            name: "Delay",
            placeholder: "time in seconds. Minimum 2 days (172800), maximum 30 days (2592000)",
            type: "number",
            decimals: 0
          }
        ],
        values: [],
      }
    ],
  },
  {
    contract: "Factory",
    address: VEX_NETWORK.factory.address,
    functions: [
      {
        name: "Set platform fee to",
        signature: "setPlatformFeeTo(address)",
        args: [
          {
            name: "platformFeeTo",
            placeholder: "address",
            type: "text"
          }
        ],
        values: []
      },
      {
        name: "Set default swap fee",
        signature: "setDefaultSwapFee(uint256)",
        args: [
          {
            name: "swapFee",
            placeholder: "basis points",
            type: "number",
            decimals: 0
          }
        ],
        values: []
      },
      {
        name: "Set default platform fee",
        signature: "setDefaultPlatformFee(uint256)",
        args: [
          {
            name: "platformFee",
            placeholder: "basis points",
            type: "number",
            decimals: 0
          }
        ],
        values: []
      },
      {
        name: "Set default recoverer",
        signature: "setDefaultRecoverer(address)",
        args: [
          {
            name: "default recoverer",
            placeholder: "address",
            type: "text"
          }
        ],
        values: []
      },
      {
        name: "Set swap fee for pair",
        signature: "setSwapFeeForPair(address,uint256)",
        args: [
          {
            name: "pair",
            placeholder: "address",
            type: "text"
          },
          {
            name: "swapFee",
            placeholder: "basis points",
            type: "number",
            decimals: 0
          }
        ],
        values: []
      },
      {
        name: "Set platform fee for pair",
        signature: "setPlatformFeeForPair(address,uint256)",
        args: [
          {
            name: "pair",
            placeholder: "address",
            type: "text"
          },
          {
            name: "platformFee",
            placeholder: "basis points",
            type: "number",
            decimals: 0
          }
        ],
        values: []
      },
      {
        name: "Set recoverer for pair",
        signature: "setRecovererForPair(address,address)",
        args: [
          {
            name: "pair",
            placeholder: "address",
            type: "text"
          },
          {
            name: "recoverer",
            placeholder: "address",
            type: "text"
          }
        ],
        values: []
      }
    ]
  },
];

/**
 * Maps contract address to name
 * @param {String} contract address of CrowdProposal contract
 * @returns {String} contract name
 */
const collectNameByContract = (contract) => {
  let contractName = ""; // Initialize contract name

  // For each property in VEX_CONSTANTS
  for (const property of Object.keys(VEX_NETWORK)) {
    if (
      // If property is a contract type
      property !== "node_url" &&
      property !== "explorer_base_url" &&
      // And the address matches
      VEX_NETWORK[property].address.toLowerCase() === contract.toLowerCase()
    ) {
      // Update contract name
      contractName = VEX_NETWORK[property].name;
    }
  }

  return contractName; // Return contract name
};

/**
 * Parses hexstring based on function signature types for appropriate params
 * @param {String} contractAddress address of the contract
 * @param {String} signature function signature
 * @param {String} bytes HexString
 * @returns {Object[String[], String[]]} Two arrays, one for types and one for parsed params
 */
const generateActionBySignatureBytes = (contractAddress, signature, bytes) => {
  // Collect types array from signature
  const typesString = signature.split("(").pop().split(")")[0];
  const typesArray = typesString.split(",");

  // Use checksum address
  const contract = find(VEX_ACTIONS, { address: getAddress(contractAddress) });
  const func = find(contract.functions, { signature: signature });
  const args = func.args;

  // Setup bytes hexstring (removing 0x prefix)
  let tempBytes = bytes.substring(2);

  // Setup array to hold parsed params
  let parsedParams = [];

  let argsIndex = 0;

  // For each type of typesArray
  for (const type of typesArray) {
    // Loop and decode + parse from tempBytes hexstring partial
    switch (type) {
      // If type of param is address
      case "address":
        // Collect address from bytes and strip zeros
        const paddedAddress = `0x${tempBytes.substring(0, 64)}`;
        const strippedAddress = ethers.utils.hexDataSlice(paddedAddress, 12);

        // Remove address bytes from tempBytes
        tempBytes = tempBytes.substring(64, tempBytes.length);

        // Update parsedParams array
        parsedParams.push(strippedAddress);
        break;
      // If type of param is uint256
      case "uint256":
        // Collect uint256 from address and strip zeros
        const paddedUint256 = `0x${tempBytes.substring(0, 64)}`;
        const strippedUint256 = ethers.utils.hexDataSlice(paddedUint256, 12);

        // Parse hexstring as BigNumber and then string
        const parsedUint256 = ethers.BigNumber.from(strippedUint256).toString();

        // Remove uint256 bytes from tempBytes
        tempBytes = tempBytes.substring(64, tempBytes.length);

        // Parse uint256 as decimal value
        const decimalUint256 = ethers.utils.formatUnits(parsedUint256, args[argsIndex].decimals);

        // Updated parsedParams array
        parsedParams.push(decimalUint256);
        break;
    }
    ++argsIndex;
  }

  // Return array of function types and parsed params
  return { types: typesArray, parsed: parsedParams };
};

/**
 * Uses generateActionBySignatureBytes to return renderable HTML for actions
 * @param {String} contractName name of the contract
 * @param {String} signature function signature
 * @param {String} bytes HexString
 * @returns {HTMLElement[]} array of elements ot render
 */
const generateActionSignatureHTML = (contractName, signature, bytes) => {
  // Collect parsed params
  const { parsed } = generateActionBySignatureBytes(contractName, signature, bytes);
  // Generate signature name
  const signatureName = signature.split("(")[0];

  // Initialize elements array with signature name span
  let elements = [<span>{signatureName}(</span>];

  // For each parsed param
  for (let i = 0; i < parsed.length; i++) {
    const param = parsed[i];

    // Render param according to type
    if (ethers.utils.isAddress(param)) {
      // Link if type(param) === address
      elements.push(
        <a
          href={`${VEX_NETWORK.explorer_base_url}accounts/${param}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {param}
        </a>
      );
    }
    else {
      // Else, span
      elements.push(<span>{param}</span>);
    }

    // Add a comma span after all params unless last param
    if (i < parsed.length - 1) {
      elements.push(<span>, </span>);
    }
  }

  // Push closing function bracket and return
  elements.push(<span>)</span>);
  return elements;
};

const PROPOSAL_THRESHOLD = 100_000

// Export constants
export {
  collectNameByContract,
  generateActionSignatureHTML,
  MAINNET,
  VEX_NETWORK,
  VEX_NETWORK_NAME,
  VEX_CONSTANTS,
  VEX_ACTIONS,
  PROPOSAL_THRESHOLD,
  QUORUM_TOTAL_VEX
};
