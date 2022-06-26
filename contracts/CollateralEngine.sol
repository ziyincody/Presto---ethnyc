// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract CollateralEngine is Ownable {
  using SafeMath for uint256;

  uint256 public total_balance;
  uint256 public collateral_factor = 30;

  mapping(uint256 => address) public nft_owners;
  mapping(address => uint256) internal total_nft_values;
  mapping(address => uint256) public lend_balance;
  mapping(address => mapping(uint256 => uint256)) internal borrow_balance;
  mapping(address => mapping(uint256 => uint256)) internal borrow_limit;
  mapping(uint256 => uint256) internal nft_estimated_values;
  mapping(uint256 => uint256) public down_payments;

  ERC721 nft_collection;

  event DepositNFT(address indexed from, uint256 indexed tokenId);
  event WithdrawNFT(address indexed from, uint256 indexed tokenId);
  event LendEth(address indexed from, uint256 indexed value);
  event WithdrawEth(address indexed from, uint256 indexed value);
  event BorrowEth(address indexed from, uint256 indexed value);
  event RepayEthDebt(address indexed from, uint256 indexed value);
  event UpdatedEstimatedValues(
    address indexed from,
    uint256 indexed tokenId,
    uint256 indexed value
  );

  event DownPaymentExecuted(
    address indexed to,
    uint256 nft_listed_price,
    uint256 indexed tokenId,
    uint256 debt_amount
  );

  constructor(address _nft_collection_address) payable {
    collateral_factor = 30;
    nft_collection = ERC721(_nft_collection_address);
    nft_estimated_values[2] = 100000000000000000000;
    nft_estimated_values[4] = 300000000000000000000;
  }

  // === Getters === //
  function get_deposit_nft_value() public view returns (uint256) {
    return total_nft_values[msg.sender];
  }

  function get_address_borrow_limit_per_nft(uint256 _token_id) public view returns (uint256) {
    return borrow_limit[msg.sender][_token_id];
  }

  function get_address_borrow_balance_per_nft(uint256 _token_id) public view returns (uint256) {
    return borrow_balance[msg.sender][_token_id];
  }

  function get_token_estimated_value(uint256 _token_id)
    public
    view
    returns (uint256)
  {
    return nft_estimated_values[_token_id];
  }

  // === Borrowers === //
  function deposit_nft(uint256 _token_id) external {
    nft_collection.transferFrom(msg.sender, address(this), _token_id);
    nft_owners[_token_id] = msg.sender;
    uint256 estimated_values = nft_estimated_values[_token_id];
    borrow_limit[msg.sender][_token_id] += _get_collateral_amount(estimated_values);
    total_nft_values[msg.sender] += estimated_values;
    emit DepositNFT(msg.sender, _token_id);
  }

  function withdraw_nft(uint256 _token_id) external {
    require(nft_owners[_token_id] == msg.sender, "NFT never deposited");
    require(
      borrow_limit[msg.sender][_token_id] -
        _get_collateral_amount(nft_estimated_values[_token_id]) >=
        borrow_balance[msg.sender][_token_id],
      "Borrow limit lower than borrowed amount"
    );
    nft_collection.transferFrom(address(this), msg.sender, _token_id);
    nft_owners[_token_id] = address(0);
    borrow_limit[msg.sender][_token_id] -= _get_collateral_amount(
      nft_estimated_values[_token_id]
    );
    emit WithdrawNFT(msg.sender, _token_id);
  }

  function borrow_eth(uint256 _amount, uint256 _token_id) external payable {
    require(
      _amount <= borrow_limit[msg.sender][_token_id],
      "borrowing more than borrow limit"
    );
    require(
      _amount <= total_balance,
      "borrowing more than total balance in the contract"
    );
    payable(msg.sender).transfer(_amount);
    borrow_limit[msg.sender][_token_id] -= _amount;
    borrow_balance[msg.sender][_token_id] += _amount;
    total_balance -= _amount;
    emit BorrowEth(msg.sender, _amount);
  }

  function repay_eth_debt(uint256 _token_id) external payable {
    require(
      msg.value <= borrow_balance[msg.sender][_token_id],
      "paying more than borrowed"
    );
    borrow_limit[msg.sender][_token_id] += msg.value;
    borrow_balance[msg.sender][_token_id] -= msg.value;
    total_balance += msg.value;
    emit RepayEthDebt(msg.sender, msg.value);
  }

  function _get_collateral_amount(uint256 _amount)
    internal
    view
    returns (uint256)
  {
    require(_amount > 0, "collateral has no estimated value");
    return (_amount * collateral_factor) / 100;
  }

  function down_payment(uint256 _nft_listed_price, uint256 _debt_amount, uint256 _token_id) external payable{
    borrow_limit[msg.sender][_token_id] += _get_collateral_amount(_nft_listed_price); 
    borrow_limit[msg.sender][_token_id] -= _debt_amount;
    borrow_balance[msg.sender][_token_id] += _debt_amount;
    nft_owners[_token_id] = msg.sender;
    down_payments[_token_id] = _nft_listed_price - _debt_amount;
    total_balance -= _debt_amount;
    emit DownPaymentExecuted(msg.sender, _nft_listed_price, _debt_amount, _token_id);
  }

  function reset_down_payment(uint256 _token_id) external {
    total_balance += borrow_balance[msg.sender][_token_id];
    borrow_limit[msg.sender][_token_id] = 0;
    borrow_balance[msg.sender][_token_id] = 0;
    payable(msg.sender).transfer(down_payments[_token_id]);
    down_payments[_token_id] = 0;
    
    nft_owners[_token_id] = address(0);
  }

  // ==================== Lender ========================
  function lend_eth() external payable {
    lend_balance[msg.sender] += msg.value;
    total_balance += msg.value;
    emit LendEth(msg.sender, msg.value);
  }

  function withdraw_eth(uint256 _amount) external payable {
    require(
      _amount <= lend_balance[msg.sender],
      "withdrawing more than lended"
    );
    payable(msg.sender).transfer(_amount);
    lend_balance[msg.sender] -= _amount;
    total_balance -= _amount;
    emit WithdrawEth(msg.sender, msg.value);
  }

  // ==================== Appraisal ========================
  function update_estimated_values(uint256 _token_id, uint256 _floor)
    external
    onlyOwner
  {
    nft_estimated_values[_token_id] = _floor;
    emit UpdatedEstimatedValues(msg.sender, _token_id, _floor);
  }

  function fetch_price(uint _token_id) external {
      // make an API call to update the appraisal price for the token
      string memory url = string(
                              abi.encodePacked(
                                  "http://3.91.48.214:5000/?token_id=",
                                  Strings.toString(_token_id)
                              )
                          );
      chainlink.requestData(url, _token_id);
  }

  receive() external payable {
    console.log("Received");
  }
}
