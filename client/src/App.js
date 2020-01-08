import React, { Component } from "react";
import MarketplaceContract from "./contracts/Marketplace.json";
import getWeb3 from "./utils/getWeb3";

import "./App.css";
import $ from "jquery";
import HeaderBar from "./components/HeaderBar.js";
import { Row, Col } from "reactstrap";
import OwnerOnly from "./components/OwnerOnly.js";
import AdminOnly from "./components/AdminOnly.js";
import StoreOwnerOnly from "./components/StoreOwnerOnly.js";
import ClientOnly from "./components/ClientOnly.js";

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
    network: null,
    userType: null,
    storeOwners: [],
    articles: [],
    balance: null
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = MarketplaceContract.networks[networkId];
      const instance = new web3.eth.Contract(
        MarketplaceContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.getUserType);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  getUserType = async () => {
    const { accounts, contract } = this.state;

    var isOwner = false;
    const owner = await contract.methods.owner().call();
    if (owner === accounts[0]) {
      isOwner = true;
    }
    const isAdmin = await contract.methods.admins(accounts[0]).call();
    const isStoreOwner = await contract.methods
      .checkStoreOwner(accounts[0])
      .call();

    if (isOwner) {
      this.setState({ userType: "owner" });
    } else if (isAdmin) {
      this.setState({ userType: "admin" });
      this.reloadStoreOwners();
    } else if (isStoreOwner) {
      this.setState({ userType: "storeOwner" });
      this.reloadStoreOwnerArticles();
      this.loadBalance();
    } else {
      this.setState({ userType: "client" });
      this.reloadArticles();
    }
  };

  /////////////////////////////////////////////////////
  // Owner only functions
  /////////////////////////////////////////////////////
  /** @dev add admin address from input field. */
  async setAdmin() {
    const { accounts, contract } = this.state;
    const _input = $("#newAdminAddress").val();
    // check if input is valid address
    if (this.state.web3.utils.isAddress(_input)) {
      await contract.methods
        .addAdmin(_input)
        .send({ from: accounts[0] })
        .then(function() {
          $("#newAdminFormText").text("address added as admin.");
        });
    } else {
      $("#newAdminFormText").text("Invalid input.");
    }
  }

  /** @dev disable admin address from input field. */
  async disableAdmin() {
    const { accounts, contract } = this.state;
    const _input = $("#disableAdminAddress").val();
    if (this.state.web3.utils.isAddress(_input)) {
      await contract.methods
        .disableAdmin(_input)
        .send({ from: accounts[0] })
        .then(function() {
          $("#disableAdminFormText").text("Address is no longer admin.");
        });
    } else {
      $("#disableAdminFormText").text("Invalid input.");
    }
  }

  /** @dev check if address from input field is admin. */
  async checkAdmin() {
    const { contract } = this.state;
    const _input = $("#checkAdminAddress").val();
    if (this.state.web3.utils.isAddress(_input)) {
      const resp = await contract.methods.admins(_input).call();
      $("#checkAdminFormText").text("admins() returned " + resp);
    } else {
      $("#checkAdminFormText").text("Ivalid input.");
    }
  }

  /////////////////////////////////////////////////////
  // Admin only functions
  /////////////////////////////////////////////////////
  /** @dev add storeOwner address from input field. */
  async setStoreOwner() {
    const { accounts, contract } = this.state;
    const _input = $("#newStoreOwnerAddress")
      .val()
      .trim();
    if (this.state.web3.utils.isAddress(_input)) {
      await contract.methods
        .addStoreOwner(_input)
        .send({ from: accounts[0] })
        .then(function() {
          $("#newStoreOwnerFormText").text("address added as storeOwner.");
        })
        .then(() => {
          this.reloadStoreOwners();
        });
    } else {
      $("#newStoreOwnerFormText").text("Invalid input.");
    }
  }

  /** @dev disable storeOwner address from input field. */
  async changeStatusEnrolledStoreOwner(_id) {
    const { accounts, contract } = this.state;
    var _this = this;

    await contract.methods
      .changeStatusEnrolledStoreOwner(_id)
      .send({ from: accounts[0] })
      .then(() => {
        _this.reloadStoreOwners();
      });
  }

  async reloadStoreOwners() {
    const { contract } = this.state;
    var _this = this;
    this.setState({ storeOwners: [] });

    await contract.methods
      .getNumberOfStoreOwners()
      .call()
      .then(storeOwnerIds => {
        for (var i = 1; i <= storeOwnerIds; i++) {
          contract.methods
            .storeOwners(i)
            .call()
            .then(result => {
              _this.setState({
                storeOwners: [
                  ...this.state.storeOwners,
                  {
                    id: result[0],
                    address: result[1],
                    enrolled: result[3].toString()
                  }
                ]
              });
            });
        }
      });
  }

  /////////////////////////////////////////////////////
  // StoreOwner only functions
  /////////////////////////////////////////////////////
  /** @dev add article from input fields.
   */
  async addArticle() {
    const { web3, accounts, contract } = this.state;
    const _name = $("#articleName").val();
    const _description = $("#articleDescription").val();
    const _price = web3.utils.toWei($("#articlePrice").val() || 0, "ether");
    var _this = this;

    if (_name.trim() === "" || _price === 0) {
      $("#articleReturn").text("False inputs.");
      this.reloadArticles();
      return false;
    }

    await contract.methods
      .sellArticle(_name, _description, _price)
      .send({ from: accounts[0] })
      .then(function() {
        _this.reloadStoreOwnerArticles();
      });
  }

  /** @dev get articles from storeOwner and put in react state variable
   */
  async reloadStoreOwnerArticles() {
    const { web3, accounts, contract } = this.state;
    var _this = this;
    const articleStates = ["ForSale", "Sold", "NoSale"];
    this.setState({ articles: [] });

    await contract.methods
      .getArticleIds()
      .call({ from: accounts[0] })
      .then(articleIds => {
        articleIds.forEach(id => {
          contract.methods
            .articles(id)
            .call()
            .then(article => {
              _this.setState({
                articles: [
                  ...this.state.articles,
                  {
                    id: article[0],
                    name: article[1].toString(),
                    description: article[2].toString(),
                    price: web3.utils.fromWei(article[3], "ether"),
                    buyer: article[5],
                    articleState: articleStates[article[6]]
                  }
                ]
              });
            });
        });
      });
  }

  /** @dev change ArticleState of article */
  async changeArticleState(_id) {
    const { accounts, contract } = this.state;
    var _this = this;

    await contract.methods
      .changeArticleState(_id)
      .send({ from: accounts[0] })
      .then(() => {
        _this.reloadStoreOwnerArticles();
      });
  }

  /** @dev load balance from storeOwner */
  async loadBalance() {
    const { web3, accounts, contract } = this.state;

    await contract.methods
      .storeOwnersIds(accounts[0])
      .call()
      .then(id => {
        contract.methods
          .storeOwners(id)
          .call()
          .then(storeOwner => {
            this.setState({ balance: web3.utils.fromWei(storeOwner.balance) });
          });
      });
  }

  /** @dev withdraw the StoreOwner balance */
  async withdrawBalance() {
    const { accounts, contract } = this.state;

    await contract.methods
      .withdraw(accounts[0])
      .send({ from: accounts[0] })
      .then(() => {
        this.loadBalance();
      });
  }

  /////////////////////////////////////////////////////
  // Client only functions
  /////////////////////////////////////////////////////
  /** @dev get articles Forsale and place in react state variable
   */
  async reloadArticles() {
    const { web3, accounts, contract } = this.state;
    var _this = this;
    this.setState({ articles: [] });

    await contract.methods
      .getArticlesForSale()
      .call({ from: accounts[0] })
      .then(articleIds => {
        if (articleIds != null) {
          articleIds.forEach(id => {
            contract.methods
              .articles(id)
              .call()
              .then(article => {
                _this.setState({
                  articles: [
                    ...this.state.articles,
                    {
                      id: article[0],
                      name: article[1].toString(),
                      description: article[2].toString(),
                      price: web3.utils.fromWei(article[3])
                    }
                  ]
                });
              });
          });
        }
      });
  }

  //* @dev buy article
  async buyArticle(_id) {
    const { accounts, contract } = this.state;
    var _this = this;

    await contract.methods
      .articles(_id)
      .call()
      .then(article => {
        contract.methods
          .buyArticle(_id)
          .send({ from: accounts[0], value: article.price })
          .then(() => {
            _this.reloadArticles();
          });
      });
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <HeaderBar
          title={"Marketplace-dapp"}
          address={this.state.accounts[0]}
          userType={this.state.userType}
        />
        <div>
          <Row>
            <Col>
              <OwnerOnly
                isOwner={this.state.userType}
                onClickAdd={() => this.setAdmin()}
                onClickCheck={() => this.checkAdmin()}
                onClickDisable={() => this.disableAdmin()}
              />
              <AdminOnly
                isOwner={this.state.userType}
                onClickAdd={() => this.setStoreOwner()}
                onClickChange={id => this.changeStatusEnrolledStoreOwner(id)}
                storeOwnerArray={this.state.storeOwners}
              />
              <StoreOwnerOnly
                isOwner={this.state.userType}
                onClickAdd={() => this.addArticle()}
                articlesArray={this.state.articles}
                onClickChange={id => this.changeArticleState(id)}
                balance={this.state.balance}
                onClickWithdraw={() => this.withdrawBalance()}
              />
              <ClientOnly
                isOwner={this.state.userType}
                articlesArray={this.state.articles}
                onClickBuy={id => this.buyArticle(id)}
              />
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default App;
