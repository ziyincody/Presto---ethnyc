/* eslint-disable no-empty-function */
// Metamask doc https://docs.metamask.io/guide/ethereum-provider.html

import React, { useState } from "react";
import { ethers } from "ethers";
import { config } from "../../config";
import CollateralContract from "../../../artifacts/contracts/CollateralEngine.sol/CollateralEngine.json";
import CustomNFT from "../../../artifacts/contracts/CustomNFT.sol/CustomNFT.json";

export const CollateralContext = React.createContext({
  loading: false,
  error: null,
  toggleLoading: () => {},
  setError: () => {},
  toApprove: () => {},
  toCollateral: () => {},
  toBorrow: () => {},
  toLend: () => {},
  getEstimatedValue: () => {},
  checkIsApproved: () => {},
  checkIsCollaterized: () => {},
  toWithDraw: () => {},
  toMint: () => {},
  getAddressBorrowLimitPerNft: () => {},
  getAddressBorrowAmountPerNft: () => {},
  downPayment: () => {},
  getCurrentBalance: () => {},
  getTotalBalance: () => {},
  toRepay: () => {},
  toWithdrawEth: () => {},
});

export const useCollateralContext = () => React.useContext(CollateralContext);

export const CollateralContextProvider = ({ children }) => {
  const [loading, toggleLoading] = useState(false);
  const [error, setError] = useState(null);
  let collateralContract;
  const [collateralState, setCollateralState] = React.useState({
    contract: null,
    loading: false,
    error: null,
    transaction: null,
    borrowedAmount: 0,
    borrowLimit: 0,
    depositedNFTValue: 0,
    totalBalance: 0,
  });
  const [collectionState, setCollectionState] = React.useState({
    contract: null,
    loading: false,
    error: null,
    transaction: null,
    mintedNFTIds: [],
  });

  React.useEffect(() => {
    const provider = new ethers.providers.WebSocketProvider(config.alchemy);
    collateralContract = new ethers.Contract(
      config.collateralContractAddress,
      CollateralContract.abi,
      provider
    );
    const collectionContract = new ethers.Contract(
      config.collectionContractAddress,
      CustomNFT.abi,
      provider
    );
    console.log(collateralContract.address);

    setCollateralState((prev) => ({
      ...prev,
      contract: collateralContract,
    }));
    setCollectionState((prev) => ({
      ...prev,
      contract: collectionContract,
    }));

    const listenToNFTDeposit = async (from, to, tokenId, event) => {
      console.log(`${from} sent ${tokenId} to ${to}`);
      console.log(event);
      const metamaskProvider = new ethers.providers.Web3Provider(
        window.ethereum
      );
      const signer = metamaskProvider.getSigner();
      completeTransaction();
    };

    collectionContract.on("Approval", listenToNFTDeposit);
    collateralContract.on("DepositNFT", listenToNFTDeposit);
    collateralContract.on("WithdrawNFT", listenToNFTDeposit);
    collateralContract.on("LendEth", completeTransaction);
    collateralContract.on("WithdrawEth", completeTransaction);
    collateralContract.on("BorrowEth", completeTransaction);
    collateralContract.on("RepayEthDebt", completeTransaction);
    collateralContract.on("DownPaymentExecuted", completeTransaction);
    collectionContract.on("Transfer", completeTransaction);

    getMintedNFTs(collectionContract);

    return function cleanup() {
      collectionContract.removeListener("Approval", listenToNFTDeposit);
      collateralContract.removeListener("DepositNFT", listenToNFTDeposit);
    };
  }, []);

  const initTransaction = () => {
    setCollateralState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      transaction: null,
    }));
  };

  const completeTransaction = (e) => {
    console.log(e);
    setCollateralState((prev) => ({
      ...prev,
      loading: false,
      error: e ? e.message : "",
    }));
  };

  const getCollateralContract = () => {
    const provider = new ethers.providers.WebSocketProvider(config.alchemy);
    console.log(collateralState.contract);
    if (collateralState.contract === null) {
      return new ethers.Contract(
        config.collateralContractAddress,
        CollateralContract.abi,
        provider
      );
    } else {
      return collateralState.contract;
    }
  };

  const getCollectionContract = () => {
    const provider = new ethers.providers.WebSocketProvider(config.alchemy);
    if (collectionState.contract === null) {
      return new ethers.Contract(
        config.collectionContractAddress,
        CustomNFT.abi,
        provider
      );
    } else {
      return collectionState.contract;
    }
  };

  // Getters

  const getAddressBorrowLimitPerNft = async (token_id) => {
    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    const limit = await collateralState.contract
      .connect(signer)
      .get_address_borrow_limit_per_nft(token_id)
      .catch((e) => {
        completeTransaction(e);
      });
    return ethers.BigNumber.from(limit) / 10 ** 18;
  };

  const getAddressBorrowAmountPerNft = async (token_id) => {
    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    const amount = await getCollateralContract()
      .connect(signer)
      .get_address_borrow_balance_per_nft(token_id)
      .catch((e) => {
        completeTransaction(e);
      });
    return ethers.BigNumber.from(amount) / 10 ** 18;
  };

  const checkIsApproved = async (nftId) => {
    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    const approver = await collectionState.contract
      .connect(signer)
      .getApproved(nftId);
    return approver == config.collateralContractAddress;
  };

  const checkIsCollaterized = async (nftId) => {
    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    const owner = await getCollectionContract().connect(signer).ownerOf(nftId);
    return owner == config.collateralContractAddress;
  };

  const getTotalBalance = async () => {
    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    const totalBalance = await getCollateralContract()
      .connect(signer)
      .total_balance();
    return ethers.BigNumber.from(totalBalance) / 10 ** 18;
  };

  const getCurrentBalance = async () => {
    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    let balance = await signer.getBalance();
    return ethers.BigNumber.from(balance) / 10 ** 18;
  };

  const getEstimatedValue = async (token_id) => {
    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    const estimatedValue = await collateralState.contract
      .connect(signer)
      .get_token_estimated_value(token_id);
    return ethers.BigNumber.from(estimatedValue) / 10 ** 18;
  };

  const getMintedNFTs = async (collectionContract) => {
    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    const signerAddress = await signer.getAddress();
    const totalCount = await collectionContract.mintedSupply();

    let nftIds = [];
    for (var i = 0; i < totalCount; i++) {
      let owner = await collectionContract.connect(signer).nftToOwner(i);
      if (owner == signerAddress) {
        nftIds.push(i);
      }
    }
    setCollectionState((prev) => ({
      ...prev,
      mintedNFTIds: nftIds,
    }));
    console.log(nftIds);
    console.log(collectionState.mintedNFTIds);
  };

  // Calls that modify states

  const toApprove = async (nftId) => {
    initTransaction();
    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    await collectionState.contract
      .connect(signer)
      .approve(collateralState.contract.address, nftId)
      .catch((e) => {
        console.log(e);
        completeTransaction(e);
      });
  };

  const toCollateral = async (nftId) => {
    initTransaction();
    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    await collateralState.contract
      .connect(signer)
      .deposit_nft(nftId)
      .catch((e) => {
        completeTransaction(e);
      });
  };

  const toWithDraw = async (nftId) => {
    initTransaction();
    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    await collateralState.contract
      .connect(signer)
      .withdraw_nft(nftId)
      .catch((e) => {
        completeTransaction(e);
      });
  };

  const toLend = async (lendAmount) => {
    initTransaction();
    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    await collateralState.contract
      .connect(signer)
      .lend_eth({
        value: ethers.BigNumber.from(`${lendAmount * 10 ** 18}`),
      })
      .catch((e) => {
        completeTransaction(e);
      });
  };

  const toWithdrawEth = async (withdrawAmount) => {
    initTransaction();
    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    await collateralState.contract
      .connect(signer)
      .withdraw_eth(ethers.BigNumber.from(`${withdrawAmount * 10 ** 18}`))
      .catch((e) => {
        completeTransaction(e);
      });
  };

  const toBorrow = async (borrowAmount, tokenId) => {
    initTransaction();
    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    await collateralState.contract
      .connect(signer)
      .borrow_eth(ethers.BigNumber.from(`${borrowAmount * 10 ** 18}`), tokenId)
      .catch((e) => {
        completeTransaction(e);
      });
  };

  const toRepay = async (repayAmount, tokenId) => {
    initTransaction();
    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    await collateralState.contract
      .connect(signer)
      .repay_eth_debt(tokenId, {
        value: ethers.BigNumber.from(`${repayAmount * 10 ** 18}`),
      })
      .catch((e) => {
        completeTransaction(e);
      });
  };

  const toMint = async () => {
    initTransaction();
    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    await collectionState.contract
      .connect(signer)
      .mint()
      .catch((e) => {
        completeTransaction(e);
      });
  };

  const downPayment = async (
    nftListPrice,
    debtAmount,
    amountToPay,
    tokenId
  ) => {
    initTransaction();
    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    await collateralState.contract
      .connect(signer)
      .down_payment(nftListPrice, debtAmount, tokenId, {
        value: ethers.BigNumber.from(amountToPay),
      })
      .catch((e) => {
        console.log(e);
        completeTransaction(e);
      });
  };

  return (
    <CollateralContext.Provider
      value={{
        loading,
        toggleLoading,
        error,
        setError,
        toApprove,
        toCollateral,
        toBorrow,
        toLend,
        collectionState,
        collateralState,
        getEstimatedValue,
        checkIsApproved,
        checkIsCollaterized,
        toWithDraw,
        toMint,
        getAddressBorrowLimitPerNft,
        getAddressBorrowAmountPerNft,
        downPayment,
        getCurrentBalance,
        getTotalBalance,
        toRepay,
        toWithdrawEth,
      }}
    >
      {children}
    </CollateralContext.Provider>
  );
};

export const CollateralContextProviderWrapper = ({ children }) => {
  return <CollateralContextProvider>{children}</CollateralContextProvider>;
};
