const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    constants,
} = require('@openzeppelin/test-helpers');

describe("CollateralEngine contract", function () {

    let nftCollection;
    let collateralEngine;
    let owner;
    let addr1;

    beforeEach(async function () {
        // mint NFT for the address and approves for the collateral engine
        const [o, addr] = await ethers.getSigners();
        addr1 = addr
        owner = o

        const nftCollectionFactory = await ethers.getContractFactory("CustomNFT");
        nftCollection = await nftCollectionFactory.deploy(1000);

        const colleteralEngineFactory = await ethers.getContractFactory("CollateralEngine");
        collateralEngine = await colleteralEngineFactory.connect(addr1).deploy(nftCollection.address)
        
        await nftCollection.connect(addr1).mint()
        await nftCollection.connect(addr1).approve(collateralEngine.address, 1)

    })

    it('deposit and withdraw NFT function', async function() {
        await collateralEngine.connect(addr1).update_estimated_values(0, ethers.utils.parseEther("100"))
        await collateralEngine.connect(addr1).deposit_nft(0)
        expect(await nftCollection.ownerOf(0)).to.equal(collateralEngine.address);
        expect(await collateralEngine.connect(addr1).get_address_borrow_limit_per_nft(0)).to.equal(ethers.utils.parseEther("30"))

        await collateralEngine.connect(addr1).withdraw_nft(0)
        expect(await nftCollection.ownerOf(0)).to.equal(addr1.address);
        expect(await collateralEngine.connect(addr1).get_address_borrow_limit_per_nft(0)).to.equal(0)
    });

    it('eth lend and borrow', async function() {
        await collateralEngine.connect(addr1).lend_eth({
            value: ethers.utils.parseEther("1.0")
        });
        expect(await collateralEngine.provider.getBalance(collateralEngine.address)).to.equal(ethers.utils.parseEther("1.0"))
        expect(await collateralEngine.total_balance()).to.equal(ethers.utils.parseEther("1.0"))

        await collateralEngine.connect(addr1).withdraw_eth(ethers.utils.parseEther("0.5"));
        expect(await collateralEngine.provider.getBalance(collateralEngine.address)).to.equal(ethers.utils.parseEther("0.5"))
        expect(await collateralEngine.total_balance()).to.equal(ethers.utils.parseEther("0.5"))
    });

    it('eth debt functions', async function() {
        await collateralEngine.connect(owner).lend_eth({
            value: ethers.utils.parseEther("1.0")
        });
        await collateralEngine.connect(addr1).update_estimated_values(0, ethers.utils.parseEther("100"))
        await collateralEngine.connect(addr1).deposit_nft(0);
        await collateralEngine.connect(addr1).borrow_eth(ethers.utils.parseEther("1.0"), 0);
        expect(await collateralEngine.total_balance()).to.equal(ethers.utils.parseEther("0"))
        expect(await collateralEngine.connect(addr1).get_address_borrow_limit_per_nft(0)).to.equal(ethers.utils.parseEther("29"));

        await collateralEngine.connect(addr1).repay_eth_debt(0, {
            value: ethers.utils.parseEther("1.0")
        });
        expect(await collateralEngine.total_balance()).to.equal(ethers.utils.parseEther("1.0"))
        expect(await collateralEngine.connect(addr1).get_address_borrow_limit_per_nft(0)).to.equal(ethers.utils.parseEther("30"));
    });

    it('down payment', async function() {
        await collateralEngine.connect(owner).lend_eth({
            value: ethers.utils.parseEther("1.0")
        });
        await collateralEngine.connect(addr1).down_payment(ethers.utils.parseEther("3"), ethers.utils.parseEther("0.8"), 0, {
            value: ethers.utils.parseEther("2.2")
        })
        expect(await collateralEngine.total_balance()).to.equal(ethers.utils.parseEther("0.2"))
        expect(await collateralEngine.connect(addr1).get_address_borrow_balance_per_nft(0)).to.equal(ethers.utils.parseEther("0.8"));
        expect(await collateralEngine.connect(addr1).get_address_borrow_limit_per_nft(0)).to.equal(ethers.utils.parseEther("0.1"));
        expect(await collateralEngine.connect(addr1).nft_owners(0)).to.equal(addr1.address);
        expect(await collateralEngine.connect(addr1).down_payments(0)).to.equal(ethers.utils.parseEther("2.2"));
       

        await collateralEngine.connect(addr1).reset_down_payment(0)
        expect(await collateralEngine.connect(addr1).get_address_borrow_balance_per_nft(0)).to.equal(0);
        expect(await collateralEngine.connect(addr1).get_address_borrow_limit_per_nft(0)).to.equal(0);
        expect(await collateralEngine.connect(addr1).nft_owners(0)).to.equal(constants.ZERO_ADDRESS);
        expect(await collateralEngine.connect(addr1).down_payments(0)).to.equal(0);
        expect(await collateralEngine.total_balance()).to.equal(ethers.utils.parseEther("1.0"))
    });
});