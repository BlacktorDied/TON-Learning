// import {
//     Address,
//     beginCell,
//     Cell,
//     Contract,
//     ContractAddress,
//     ContractProvider,
//     Sender,
//     SendMode,
// } from "ton-core";

// export type MainContract = {
//     number: number;
//     address: Address;
//     owner_address: Address;
// };

// export function mainContractConfigToCell(config: MainContractConfig): Cell {
//     return beginCell()
//         .storeUnit(config.number, 32)
//         .storeAddress(config.address)
//         .storeAddress(config.owner_address)
//         .endCell();
// }
