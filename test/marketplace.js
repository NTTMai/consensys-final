const Marketplace = artifacts.require("./Marketplace.sol");

contract("Marketplace", accounts => {
  var MarketplaceInstance;
  var articleName1 = "article 1";
  var articleDescription1 = "Description for article 1";
  var articlePrice1 = 10;

  // This tests if the owner can set an addres as admin and then disable the address again if needed.
  it("should add and disable admin addresses", function() {
    return Marketplace.deployed()
      .then(function(instance) {
        MarketplaceInstance = instance;
        MarketplaceInstance.addAdmin(accounts[1]);
        return MarketplaceInstance.admins(accounts[1]);
      })
      .then(function(isAdmin) {
        assert.isTrue(isAdmin, "The addres was not set as admin.");
      })
      .then(function() {
        MarketplaceInstance.disableAdmin(accounts[1]);
        return MarketplaceInstance.admins(accounts[1]);
      })
      .then(function(isAdmin) {
        assert.isFalse(isAdmin, "The admin addres was not disabled.");
      });
  });

  //Test the modifier onlyOwner.
  it("should revert when calling onlyOwner function from non owner address", async function() {
    try {
      await MarketplaceInstance.addAdmin(accounts[1], { from: accounts[2] });
      assert.fail("The transaction should have thrown an error");
    } catch (err) {
      assert.include(
        err.message,
        "revert",
        "The error message should contain 'revert'"
      );
    }
  });

  // Test adminOnly functions. First add address as admin, then call the fucntions from that account. Testing if it can add an address as storeOwner, and then change the status enrolled of that address. The function checkStoreOwner islo tested.
  it("should add and disable storeOwner addresses", function() {
    return Marketplace.deployed()
      .then(function(instance) {
        MarketplaceInstance = instance;
        MarketplaceInstance.addAdmin(accounts[1]);
        return MarketplaceInstance.admins(accounts[1]);
      })
      .then(function(isAdmin) {
        assert.isTrue(isAdmin, "The addres was not set as admin.");
      })
      .then(function() {
        MarketplaceInstance.addStoreOwner(accounts[2], { from: accounts[1] });
        return MarketplaceInstance.storeOwners(1);
      })
      .then(function(storeOwner) {
        assert.isTrue(
          storeOwner.enrolled,
          "The address was not set as storeOwner."
        );
      })
      .then(function() {
        return MarketplaceInstance.checkStoreOwner(accounts[2], {
          from: accounts[1]
        });
      })
      .then(function(isStoreOwner) {
        assert.isTrue(isStoreOwner, "The address did not check as storeOwner.");
      })
      .then(function() {
        MarketplaceInstance.changeStatusEnrolledStoreOwner(1, {
          from: accounts[1]
        });
        return MarketplaceInstance.storeOwners(1);
      })
      .then(function(storeOwner) {
        assert.isFalse(
          storeOwner.enrolled,
          "The address was not disabled as storeOwner"
        );
      });
  });

  // Testingthe modifier onlyAdmin.
  it("should revert when calling onlyAdmin function from non admin address", async function() {
    try {
      await MarketplaceInstance.addStoreOwner(accounts[2], {
        from: accounts[3]
      }).then(function() {});
      assert.fail("The transaction should have thrown an error");
    } catch (err) {
      assert.include(
        err.message,
        "revert",
        "The error message should contain 'revert'"
      );
    }
  });

  // Test if it adds an article to articles mapping.
  it("should let us sell a first article", function() {
    return Marketplace.deployed()
      .then(function(instance) {
        MarketplaceInstance = instance;
        MarketplaceInstance.changeStatusEnrolledStoreOwner(1, {
          from: accounts[1]
        });
        return MarketplaceInstance.storeOwners(1);
      })
      .then(function(storeOwner) {
        assert.isTrue(
          storeOwner.enrolled,
          "The address was not set as storeOwner."
        );
      })
      .then(function() {
        MarketplaceInstance.sellArticle(
          articleName1,
          articleDescription1,
          web3.utils.toWei(articlePrice1.toString(), "ether"),
          { from: accounts[2] }
        );
        return MarketplaceInstance.articles(1);
      })
      .then(function(data) {
        assert.equal(data[0].toNumber(), 1, "article id must be 1");
        assert.equal(
          data[1],
          articleName1,
          "article name must be " + articleName1
        );
        assert.equal(
          data[2],
          articleDescription1,
          "article description must be " + articleDescription1
        );
        assert.equal(
          data[3].toString(),
          web3.utils.toWei(articlePrice1.toString(), "ether"),
          "article price must be " +
            web3.utils.toWei(articlePrice1.toString(), "ether")
        );
        assert.equal(data[4], accounts[2], "seller must be " + accounts[2]);
        assert.equal(data[5], 0x0, "buyer must be empty");
      })
      .then(function() {
        return MarketplaceInstance.getArticleIds({ from: accounts[2] });
      })
      .then(function(articleIds) {
        assert.equal(
          articleIds[0],
          1,
          "article Id should be retrievable from mapping."
        );
      });
  });

  // Test the modifier onlyStoreOwner.
  it("should revert when calling onlyStoreOwner function from non storeOwner address", async function() {
    try {
      await MarketplaceInstance.getArticleIds({
        from: accounts[3]
      }).then(function() {});
      assert.fail("The transaction should have thrown an error");
    } catch (err) {
      assert.include(
        err.message,
        "revert",
        "The error message should contain 'revert'"
      );
    }
  });

  // Test if you can buy the first article and check storeOwner.balance.
  it("should buy the first article", function() {
    return Marketplace.deployed()
      .then(function(instance) {
        MarketplaceInstance.buyArticle(1, {
          from: accounts[3],
          value: web3.utils.toWei(articlePrice1.toString(), "ether")
        });
        return MarketplaceInstance.articles(1);
      })
      .then(function(data) {
        assert.equal(data[0].toNumber(), 1, "article id must be 1");
        assert.equal(
          data[1],
          articleName1,
          "article name must be " + articleName1
        );
        assert.equal(
          data[2],
          articleDescription1,
          "article description must be " + articleDescription1
        );
        assert.equal(
          data[3].toString(),
          web3.utils.toWei(articlePrice1.toString(), "ether"),
          "article price must be " +
            web3.utils.toWei(articlePrice1.toString(), "ether")
        );
        assert.equal(data[4], accounts[2], "seller must be " + accounts[2]);
        assert.equal(data[5], accounts[3], "buyer must be " + accounts[3]);
      })
      .then(function() {
        return MarketplaceInstance.storeOwners(1);
      })
      .then(function(storeOwner) {
        assert.equal(
          storeOwner.balance,
          web3.utils.toWei(articlePrice1.toString(), "ether"),
          "balance should be + " +
            web3.utils.toWei(articlePrice1.toString(), "ether")
        );
      });
  });

  // Test if you can withdraw storeOwnerBalance and transfer storeOwnerBalance to msg.sender
  it("should withdraw it's balance", function() {
    return Marketplace.deployed()
      .then(function(instance) {
        MarketplaceInstance.withdraw(accounts[2], { from: accounts[2] });
        return MarketplaceInstance.storeOwners(1);
      })
      .then(function(data) {
        assert.equal(data[2].toNumber(), 0, "balance must be empty");
        return web3.eth.getBalance(accounts[2]);
      })
      .then(balance => {
        let expectedBalance = articlePrice1 + Number(balance);
        assert.equal(
          balance,
          expectedBalance,
          "Balance incorrect. Should be " + expectedBalance
        );
      });
  });
});
