import "dotenv/config";
import Web3 from "web3";
import fetch from "node-fetch";

const INFURA_RPC_URL = process.env.INFURA_RPC_URL;

const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_RPC_URL));

const QUICKSWAP_ROUTER_ADDRESS = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"; // Quickswap Router

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

async function getPrice(amountIn) {
  const routerContract = new web3.eth.Contract(
    ROUTER_ABI,
    QUICKSWAP_ROUTER_ADDRESS
  );

  const path = [
    "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WBTC
    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", // DAI
  ];

  const amountsOut = await routerContract.methods
    .getAmountsOut(amountIn, path)
    .call();
  return amountsOut[1]; // DAI
}

async function main() {
  const amountIn = web3.utils.toWei("1.0", "ether");

  try {
    const price = await getPrice(amountIn);
    console.log(
      `QuickSwap Price for 1 WMATIC: ${web3.utils.fromWei(price, "ether")} DAI`
    );
  } catch (error) {
    console.error("Error fetching price:", error);
  }
}

main();
