import { ethers } from "ethers";

// Declare constants by network
const VEX_CONSTANTS = {
  mainnet: {
    governor_alpha: {
      name: "Governor",
      address: "",
    },
    vex_governance_token: {
      name: "VEX",
      address: "",
    },
    timelock: {
      name: "Timelock",
      address: "",
    },
  },

  // Effective contract addresses on the Vechain testnet
  testnet: {
    governor_alpha: {
      name: "Governor",
      address: "0xc32e9418c019B87B691115Cc1acDf0c5318F5ea8",
    },
    vex_governance_token: {
      name: "VEX",
      address: "0x94338d10D0f71d3E6c177F7bA8483119fD320506",
    },
    timelock: {
      name: "Timelock",
      address: "0x383716B0b9bE14d326F83903864963Ea7833E813",
    },
  }
}

// Collect current network
const MAINNET = process.env.NEXT_PUBLIC_VECHAIN_MAINNET === "true";

// Return network array based on network
const VEX_NETWORK = VEX_CONSTANTS[MAINNET ? "mainnet" : "testnet"]

// Declare possible governance actions
const VEX_ACTIONS = [
  {
    contract: "VEX Token",
    address: VEX_NETWORK.vex_governance_token.address,
    functions: [
      {
        name: "transfer",
        signature: "transfer(address,uint256)",
        targets: [
          {
            name: "recipient",
            placeholder: "address",
            type: "text",
          },
        ],
        values: [
          {
            name: "amount",
            placeholder: "value",
            type: "number",
          },
        ],
      },
    ],
  },
  {
    contract: "Timelock",
    address: VEX_NETWORK.timelock.address,
    functions: [
      {
        name: "Set Pending Admin",
        signature: "setPendingAdmin(address)",
        targets: [
          {
            name: "admin",
            placeholder: "address",
            type: "text",
          },
        ],
        values: [],
      },
    ],
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
      property !== "minimum_vex" &&
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
 * @param {String} signature function signature
 * @param {String} bytes HexString
 * @returns {Object[String[], String[]]} Two arrays, one for types and one for parsed params
 */
const generateActionBySignatureBytes = (signature, bytes) => {
  // Collect types array from signature
  const typesString = signature.split("(").pop().split(")")[0];
  const typesArray = typesString.split(",");

  // Setup bytes hexstring (removing 0x prefix)
  let tempBytes = bytes.substring(2);

  // Setup array to hold parsed params
  let parsedParams = [];

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
        const decimalUint256 = ethers.utils.formatUnits(parsedUint256, 18);

        // Updated parsedParams array
        parsedParams.push(decimalUint256);
        break;
    }
  }

  // Return array of function types and parsed params
  return { types: typesArray, parsed: parsedParams };
};

/**
 * Uses generateActionBySignatureBytes to return renderable HTML for actions
 * @param {String} signature function signature
 * @param {String} bytes HexString
 * @returns {HTMLElement[]} array of elements ot render
 */
const generateActionSignatureHTML = (signature, bytes) => {
  // Collect parsed params
  const { parsed } = generateActionBySignatureBytes(signature, bytes);
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
          href={`https://etherscan.io/address/${param}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {param}
        </a>
      );
    } else {
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

// Export constants
export {
  collectNameByContract,
  generateActionSignatureHTML,
  VEX_NETWORK,
  VEX_CONSTANTS,
  VEX_ACTIONS,
};
