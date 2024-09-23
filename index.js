require("dotenv").config();
const Web3 = require("web3").default;

const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL;
const INFURA_RPC_URL = process.env.INFURA_RPC_URL;

const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_RPC_URL)); // Usando HttpProvider

// Endereços dos contratos de DEX
const UNISWAP_ROUTER_ADDRESS = "0xedf6066a2b290C185783862C7F4776A2C8077AD1"; // Endereço do Uniswap V2 Router
const SUSHISWAP_ROUTER_ADDRESS = "0xd9e1cE17f2641f24aE83637ab66A2c1D50D92E88"; // Endereço do Sushiswap Router

// ABI mínimo para obter preços
const ROUTER_ABI = [
  {
    constant: true,
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "path", type: "address[]" },
    ],
    name: "getAmountsOut",
    outputs: [{ name: "", type: "uint256[]" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

async function getPrice(routerAddress, tokenIn, tokenOut, amountIn) {
  const routerContract = new web3.eth.Contract(ROUTER_ABI, routerAddress);
  const path = [tokenIn, tokenOut];

  const amounts = await routerContract.methods
    .getAmountsOut(amountIn, path)
    .call();
  return web3.utils.fromWei(amounts[1], "ether"); // Ajustar a precisão conforme necessário
}

async function main() {
  const TOKEN_CHAINLINK_ADDRESS = "0xb0897686c545045aFc77CF20eC7A532E3120E0F1"; // Endereço do Chainlink
  const TOKEN_DAI_ADDRESS = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"; // Endereço do DAI
  const amountIn = web3.utils.toWei("1.0", "ether"); // Quantidade de Token A para converter

  try {
    const priceUniswap = await getPrice(
      UNISWAP_ROUTER_ADDRESS,
      TOKEN_CHAINLINK_ADDRESS,
      TOKEN_DAI_ADDRESS,
      amountIn
    );
    const priceSushiswap = await getPrice(
      SUSHISWAP_ROUTER_ADDRESS,
      TOKEN_CHAINLINK_ADDRESS,
      TOKEN_DAI_ADDRESS,
      amountIn
    );

    console.log(`Price on Uniswap: ${priceUniswap} Token B`);
    console.log(`Price on Sushiswap: ${priceSushiswap} Token B`);
  } catch (error) {
    console.error("Error fetching prices:", error);
  }
}

main();
