import { expect } from "chai";
import * as hre from "hardhat";
import { type Contract, type Wallet } from "zksync-ethers";
import { getWallet, LOCAL_RICH_WALLETS, deployContract } from "../deploy/utils";

describe("AttributeToken", function () {
  const owner = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
  const player = getWallet(LOCAL_RICH_WALLETS[1].privateKey);

  let strengthToken: Contract;
  let intelligenceToken: Contract; 
  let vitalityToken: Contract;

  beforeEach(async function () {
    // Deploy the three attribute tokens
    strengthToken = await deployContract("AttributeToken", ["Strength Token", "Agent-STR", 1000], {
      wallet: owner,
      silent: true,
    });

    intelligenceToken = await deployContract("AttributeToken", ["Intelligence Token", "Agent-INT", 1000], {
      wallet: owner,
      silent: true,
    });

    vitalityToken = await deployContract("AttributeToken", ["Vitality Token", "Agent-VIT", 1000], {
      wallet: owner,
      silent: true,
    });
  });

  describe("Attribute Token Distribution", function () {
    it("Should initialize tokens with correct names and symbols", async function () {
      expect(await strengthToken.name()).to.equal("Strength Token");
      expect(await strengthToken.symbol()).to.equal("Agent-STR");
      
      expect(await intelligenceToken.name()).to.equal("Intelligence Token");
      expect(await intelligenceToken.symbol()).to.equal("Agent-INT");
      
      expect(await vitalityToken.name()).to.equal("Vitality Token");
      expect(await vitalityToken.symbol()).to.equal("Agent-VIT");
    });

    it("Should allow owner to distribute attribute tokens to player", async function () {
      // Transfer some tokens to the player
      await strengthToken.transfer(player.address, 100);
      await intelligenceToken.transfer(player.address, 50);
      await vitalityToken.transfer(player.address, 75);

      // Check player's balances
      expect(await strengthToken.balanceOf(player.address)).to.equal(100);
      expect(await intelligenceToken.balanceOf(player.address)).to.equal(50);
      expect(await vitalityToken.balanceOf(player.address)).to.equal(75);
    });

    it("Should emit Transfer events when distributing attributes", async function () {
      await expect(strengthToken.transfer(player.address, 100))
        .to.emit(strengthToken, "Transfer")
        .withArgs(owner.address, player.address, 100);

      await expect(intelligenceToken.transfer(player.address, 50))
        .to.emit(intelligenceToken, "Transfer")
        .withArgs(owner.address, player.address, 50);

      await expect(vitalityToken.transfer(player.address, 75))
        .to.emit(vitalityToken, "Transfer")
        .withArgs(owner.address, player.address, 75);
    });

    it("Should prevent transfers exceeding available balance", async function () {
      // Get player's token instance
      const playerStrengthToken = strengthToken.connect(player) as Contract;
      
      // Try to transfer more tokens than the player has
      await expect(playerStrengthToken.transfer(owner.address, 1))
        .to.be.revertedWith("Not enough tokens");
    });
  });
});
