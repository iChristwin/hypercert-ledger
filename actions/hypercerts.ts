import {
  HypercertClient,
  TransferRestrictions,
  formatHypercertData,
  AllowlistEntry,
  HypercertMinterAbi,
} from "@hypercerts-org/sdk";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { myChains } from "@/providers/Walletprovider";
import { parseEventLogs, toHex } from "viem";
import { Eip1193Provider, TransactionReceipt } from "ethers";
import { BrowserProvider, Interface } from "ethers";

interface MyMetadata {
  name: string;
  description: string;
  external_url?: string | undefined;
  image: string;
  version: string;
  properties?:
    | {
        trait_type: string;
        value: string;
      }[]
    | undefined;
  impactScope: string[];
  excludedImpactScope: string[];
  workScope: string[];
  excludedWorkScope: string[];
  workTimeframeStart: number;
  workTimeframeEnd: number;
  impactTimeframeStart: number;
  impactTimeframeEnd: number;
  contributors: string[];
  rights: string[];
  excludedRights: string[];
}

/**
 * Keeps running an async method till you get a truthy value.
 * @param method - Async method to call.
 * @returns truthy value.
 */
const getTillTruthy = async (
  method: () => Promise<TransactionReceipt | null>,
  interval = 1000
) => {
  while (true) {
    const result = await method();
    if (result) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
};
async function mintHypercert(
  props: MyMetadata,
  client: HypercertClient,
  allowList: AllowlistEntry[],
  totalUnits: bigint,
  chainId: number,
  walletProvider: Eip1193Provider
) {
  const { data, errors, valid } = formatHypercertData(props);

  let res: {
    claimsTxHash: `0x${string}` | undefined;
    allowlistTxHash: `0x${string}` | undefined;
  } = {
    claimsTxHash: undefined,
    allowlistTxHash: undefined,
  };

  try {
    if (client === undefined) {
      throw new Error("Client is undefined");
    }
    if (!data) {
      throw errors;
    }

    res.allowlistTxHash = await client.createAllowlist(
      allowList,
      data,
      totalUnits,
      TransferRestrictions.FromCreatorOnly
    );
    // let provider = new BrowserProvider(walletProvider);
    // const getReceipt = async () => {
    //   let receipt: TransactionReceipt | null;
    //   try {
    //     if (res.allowlistTxHash) {
    //       receipt = await provider.getTransactionReceipt(res.allowlistTxHash);
    //     } else {
    //       throw new Error("Response is undefined");
    //     }
    //     return receipt;
    //   } catch (err) {
    //     throw err;
    //   }
    // };
    // const receipt = await getTillTruthy(getReceipt);
    // const { storage, indexer } = client;
    // let logs = parseLog(receipt);
    // console.log(String(logs[0].topics[1]));
    // let address = (await provider.getSigner()).address;
    // let hyperInterface = new Interface(HypercertMinterAbi);
    // let details = hyperInterface.parseLog(logs[0]);
    // if (details) {
    //   let claim_Id = details.args[0].valueOf();
    //   console.log(String(claim_Id));

    //   const getPr = async () => {
    //     let claimById;
    //     try {
    //       return claimById;
    //     } catch (err) {
    //       console.error("Failed method");
    //       throw err; // Rethrow the error
    //     }
    //   };

    //   const claimById = await indexer.claimById(String(logs[0].topics[1]));
    //   console.log("claimById:", claimById);
    //   const { uri, tokenID: _id } = claimById.claim;
    //   const metadata = await storage.getMetadata(uri || "");
    //   console.log("metadata:", metadata);
    //   const treeResponse = await storage.getData(metadata.allowList as string);
    //   const tree = StandardMerkleTree.load(JSON.parse(treeResponse as string));
    //   console.log("tree:", tree);
    //   let defArgs;
    //   for (const [leaf, value] of tree.entries()) {
    //     if (value[0] === address) {
    //       defArgs = {
    //         proofs: tree.getProof(leaf),
    //         units: BigInt(value[1]),
    //         claimId: _id,
    //       };
    //       break;
    //     }
    //   }
    //   if (!defArgs) {
    //     throw new Error("Arguments are undefined");
    //   }
    //   console.log("defArgs:", defArgs);
    //   const { proofs, units, claimId } = defArgs;
    //   const tx = await client.mintClaimFractionFromAllowlist(
    //     claimId,
    //     units,
    //     proofs as `0x${string}`[] | Uint8Array[]
    //   );
    //   if (!tx) {
    //     throw new Error("Mint claim fraction failed");
    //   }
    //   res.claimsTxHash = tx;
    // }
  } catch (err) {
    console.error("Mint process faild", { cause: err });
    throw err;
  }
  return res;
}

export { mintHypercert, type MyMetadata };

/**
 * Gets the chain object for the given chain id.
 * @param chainId - Chain id of the target EVM chain.
 * @returns Viem's chain object.
 */
export function getChain(chainId: number) {
  for (const chain of Object.values(myChains)) {
    if (chain.id === chainId) {
      return chain;
    }
  }

  throw new Error(`Chain with id ${chainId} not found`);
}

export const ISOToUNIX = (date: Date) => {
  const isoDateString = date.toISOString();
  const unixTimeInSeconds = Math.floor(
    new Date(isoDateString).getTime() / 1000
  );
  return unixTimeInSeconds;
};

export const isValid = (formValue: MyMetadata) => {
  try {
    let genco = [
      formValue.name,
      formValue.description,
      formValue.workScope,
      formValue.contributors,
      formValue.rights,
      formValue.workTimeframeEnd,
      formValue.workTimeframeStart,
      formValue.impactScope.length,
      formValue.impactTimeframeEnd,
      formValue.impactTimeframeStart,
      formValue.version,
    ];

    const isValid = genco.every((item) => item);

    if (!isValid) {
      const invalidProperty =
        Object.keys(formValue)[genco.findIndex((item) => !item)];
      throw new Error(`${invalidProperty} is invalid`);
    } else return isValid;
    // If no errors were thrown, all values in genco are truthy
  } catch (err) {
    console.error("Validation Error", err);
  }
};

function parseLog(receipt: TransactionReceipt) {
  const logs = parseEventLogs({
    abi: HypercertMinterAbi,
    eventName: "ClaimStored",
    logs: receipt.logs as any,
  });

  return logs;
}

function serializeBigint(obj: any) {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "bigint") {
      return String(value);
    } else {
      return value;
    }
  });
}

async function tryTillTruthy(method: () => Promise<any>, interval = 1000) {
  while (true) {
    const result = await method();
    if (result.claim) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}
