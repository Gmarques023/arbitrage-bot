require("dotenv").config();
const Web3 = require("web3").default;

const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL;
const INFURA_RPC_URL = process.env.INFURA_RPC_URL;

const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_RPC_URL)); // Usar HttpProvider

// Endereços dos contratos de DEX
const QUICKSWAP_ROUTER_ADDRESS = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"; // Endereço do Quickswap Router na Polygon
const SUSHISWAP_ROUTER_ADDRESS = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"; // Endereço do Sushiswap Router na Polygon

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
  try {
    const routerContract = new web3.eth.Contract(ROUTER_ABI, routerAddress);
    const path = [tokenIn, tokenOut];

    // Logs de depuração
    console.log("Calling getAmountsOut...");
    console.log("Router Address:", routerAddress);
    console.log("Amount In (in wei):", amountIn);
    console.log("Token Path:", path);

    const amounts = await routerContract.methods
      .getAmountsOut(amountIn, path)
      .call();

    console.log("Amounts returned:", amounts);

    // Converte o valor retornado em formato legível
    return web3.utils.fromWei(amounts[1], "ether");
  } catch (error) {
    console.error("Error calling getAmountsOut:", error);
    throw error; // Re-lançar o erro para capturar na função principal
  }
}

async function main() {
  const TOKEN_WETH_ADDRESS = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"; // WETH na Polygon
  const TOKEN_DAI_ADDRESS = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"; // DAI na Polygon
  const amountIn = web3.utils.toWei("1.0", "ether"); // 1 WETH para converter

  try {
    console.log("Fetching price from Uniswap...");
    const priceQuickSwap = await getPrice(
      QUICKSWAP_ROUTER_ADDRESS,
      TOKEN_WETH_ADDRESS,
      TOKEN_DAI_ADDRESS,
      amountIn
    );

    console.log("Fetching price from Sushiswap...");
    const priceSushiswap = await getPrice(
      SUSHISWAP_ROUTER_ADDRESS,
      TOKEN_WETH_ADDRESS,
      TOKEN_DAI_ADDRESS,
      amountIn
    );

    const tableData = [
      {
        Pair: "WETH",
        Quickswap: `${parseFloat(priceQuickSwap).toFixed(4)} DAI`,
        Sushiswap: `${parseFloat(priceSushiswap).toFixed(4)} DAI`,
      },
    ];

    console.table(tableData, ["Pair", "Quickswap", "Sushiswap"]);
  } catch (error) {
    console.error("Error fetching prices:", error);
  }
}

main();
