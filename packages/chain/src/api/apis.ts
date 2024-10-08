import { type AssetArtifact, getCAIPAssetType } from "../resolver";
import { OiApi } from "./api";
import { OiErc20Api } from "./erc20";

const contractAPIRegister: { [namespace: string]: { [connectorName: string]: typeof OiApi } } = {
  eip1155: {}
};

/**
 * Register a contract connector for later use with the factory.
 * 
 * @param name Name of the ABI
 * @param api API implementation class
 * @param namespace Namespace for the connector, defaults to 'eip155'
 */
export async function useContractAPI(name: string, api: typeof OiApi, namespace: string = 'eip155') {

  if (!contractAPIRegister[namespace]) {
    contractAPIRegister[namespace] = {};
  }
  contractAPIRegister[namespace][name] = api;
}


export async function initAPIs(): Promise<void> {
  // Add build in APIs
  // FIXME this needs to be somewhere else!!
  await useContractAPI("erc20", OiErc20Api)
}


/**
 * Initializes and returns a contract api.
 * 
 * @param assetArtifact 
 * @returns 
 */
export async function getContractAPI(assetArtifact: AssetArtifact, walletName?: string): Promise<OiApi> {

  const assetType = getCAIPAssetType(assetArtifact);
  const namespace = assetType.chainId.namespace;
  
  if (namespace !== 'eip155') {
    throw new Error(`Unsupported namespace: ${namespace}`);
  }  

  const api = contractAPIRegister[namespace][assetType.assetName.namespace];
  
  if (!api) {
    throw new Error(`Connector not found for name: ${assetType.assetName.reference} in namespace: ${namespace}`);
  }
  
  return new api(assetArtifact, walletName);
}
