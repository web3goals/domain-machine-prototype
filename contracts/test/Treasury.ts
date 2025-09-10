import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { parseEther } from "viem";

describe("Treasury", async function () {
  const { viem } = await network.connect();
  const [wallet1, wallet2] = await viem.getWalletClients();

  it("Should deposit and withdraw tokens", async function () {
    // Deploy a test token contract
    const token = await viem.deployContract("Token", [
      "Test Token",
      "TT",
      parseEther("1000"),
      wallet1.account.address,
    ]);

    // Deploy the treasury contract
    const treasury = await viem.deployContract("Treasury", [
      wallet1.account.address,
    ]);

    // Fund the wallet 2 with some tokens
    token.write.mint([parseEther("1"), wallet2.account.address], {
      account: wallet2.account,
    });

    // Deposit tokens into the treasury
    await token.write.approve([treasury.address, parseEther("1")], {
      account: wallet2.account,
    });
    await treasury.write.depositToken([token.address, parseEther("0.01")], {
      account: wallet2.account,
    });
    assert.equal(
      await token.read.balanceOf([wallet2.account.address]),
      parseEther("0.99")
    );
    assert.equal(
      await token.read.balanceOf([treasury.address]),
      parseEther("0.01")
    );

    // Withdraw tokens from the treasury
    await treasury.write.withdrawToken([
      token.address,
      wallet1.account.address,
      parseEther("0.01"),
    ]);
    assert.equal(
      await token.read.balanceOf([wallet1.account.address]),
      parseEther("1000.01")
    );
    assert.equal(
      await token.read.balanceOf([treasury.address]),
      parseEther("0")
    );
  });
});
