pragma solidity ^0.5.0;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./CircuitBreaker.sol";

contract Marketplace is Ownable, CircuitBreaker {
    // State Variables
    mapping (address => bool) public admins;

    uint256 private storeOwnersCounter;

    struct StoreOwner {
        uint id;
        address storeOwnerAddress;
        uint256 balance;
        bool enrolled;
    }

    mapping (uint => StoreOwner) public storeOwners;
    mapping (address => uint) public storeOwnersIds;

    uint256 private articleCounter;

    enum ArticleState {
        ForSale,
        Sold,
        NoSale
    }

    struct Article {
        uint id;
        string name;
        string description;
        uint256 price;
        address payable seller;
        address payable buyer;
        ArticleState articleState;
    }

    mapping (uint => Article) public articles;
    mapping (address => uint[]) public articleIds;

    // Modifiers
    modifier onlyAdmin() {
        require(admins[msg.sender], 'Not admin');
        _;
    }
    modifier onlyStoreOwner() {
        require(checkStoreOwner(msg.sender), 'Not store owner');
        _;
    }
    modifier paidEnough(uint _price) {
        require(msg.value >= _price, 'Not enough');
        _;
    }

    // Events
    event EditAdmin(address _admin, string _action);
    event EditStoreOwner(address _storeOwner, string _action);
    event LogSellArticle(uint indexed _id, address indexed _seller, string _name, uint _price);
    event LogBuyArticle(uint indexed _id, address indexed _buyer, string _name, uint _price);

    // Functions

    // Owner only function

    /**
    @dev Add an administrator address.
    @param newAdmin Address of new admin.
    @return True if address is an admin
     */
    function addAdmin(address newAdmin) public onlyOwner returns (bool) {
        admins[newAdmin] = true;
        emit EditAdmin(newAdmin, 'Added admin');
        return admins[newAdmin];
    }

    /**
    @dev Disable an administrator address
    @param adminAddress Address of admin
    @return False if address is no longer admin
     */
    function disableAdmin(address adminAddress) public onlyOwner returns(bool) {
        admins[adminAddress] = false;
        emit EditAdmin(adminAddress, 'Disable admin');
        return admins[adminAddress];
    }

    /**
    @dev self destruct contract
     */
    function kill() public onlyOwner {
        selfdestruct(msg.sender);
    }

    // Admin only functions

    /**
    @dev Add an storeOwner address.
    @param newStoreOwner Address of new storeOwner.
    @return True if address is a storeOwner.
     */
    function addStoreOwner(address newStoreOwner) public onlyAdmin stopIfEmergency returns(bool) {
        require(!checkStoreOwner(newStoreOwner), '');
        storeOwnersCounter++;
        storeOwners[storeOwnersCounter] = StoreOwner(storeOwnersCounter, newStoreOwner, 0, true);
        storeOwnersIds[newStoreOwner] = storeOwnersCounter;
        emit EditStoreOwner(newStoreOwner, 'Added new store owner.');
        return storeOwners[storeOwnersCounter].enrolled;
    }

    /**
    @dev change enrolled status of a storeOwner address
    @param id Id of storeOwner
    @return False if address is no longer storeOwner
     */
    function changeStatusEnrolledStoreOwner(uint id) public onlyAdmin stopIfEmergency returns (bool) {
        require(id > 0 && id <= storeOwnersCounter, '');

        storeOwners[id].enrolled = !storeOwners[id].enrolled;

        emit EditStoreOwner(storeOwners[id].storeOwnerAddress, 'Changed enrolled status store owner.');

        return storeOwners[id].enrolled;
    }

    /**
    @dev check if address is store owner
    @param storeOwnerAddress Address of store owner
    @return True if addresses is a store owner
     */
    function checkStoreOwner(address storeOwnerAddress) public view returns (bool) {
        uint _id = storeOwnersIds[storeOwnerAddress];
        return storeOwners[_id].enrolled;
    }

    /**
    @dev Get number of storeOwners
    @return storeOwnersCounter
     */
    function getNumberOfStoreOwners() public view returns (uint) {
        return storeOwnersCounter;
    }

    // StoreOwner only functions

    /**
    @dev Add an article for sale
    @param name Name of article
    @param description Description of article
    @param price Price of the aricle
     */
    function sellArticle(string memory name, string memory description, uint256 price) public onlyStoreOwner stopIfEmergency {
        // check inputs !!
        articleCounter++;

        articles[articleCounter] = Article (
            articleCounter,
            name,
            description,
            price,
            msg.sender,
            address(0),
            ArticleState.ForSale
        );

        articleIds[msg.sender].push(articleCounter);

        emit LogSellArticle(articleCounter, msg.sender, name, price);
    }

    /**
    @dev get articleIds from articles where seller is storeOwner
    @return uint[]
     */
    function getArticleIds() public view onlyStoreOwner returns(uint[] memory) {
        return articleIds[msg.sender];
    }

    /**
    @dev change articleState from article
    @param articleId id of article
    @return true if succeeded
     */
    function changeArticleState(uint256 articleId) public onlyStoreOwner stopIfEmergency returns (bool) {
        require(articleId <= articleCounter, '');

        if (articles[articleId].articleState == ArticleState.ForSale) {
            articles[articleId].articleState = ArticleState.NoSale;
        } else if (articles[articleId].articleState == ArticleState.NoSale) {
            articles[articleId].articleState = ArticleState.ForSale;
        }

        return true;
    }

    /**
    @dev Withdraw ammount stored in balance of the storeOwner
    @return true if succeeded
    */
    function withdraw(address storeOwnerAddress) public onlyStoreOwner stopIfEmergency returns(bool){
        require(storeOwnerAddress == msg.sender, '');

        uint id = storeOwnersIds[storeOwnerAddress];
        uint amount = storeOwners[id].balance;

        require(amount != 0, '');

        storeOwners[id].balance -= amount;
        msg.sender.transfer(amount);

        return true;
    }

    // Clients only functions

    /**
    @dev get articles for sale
     */
    function getArticlesForSale() public view returns (uint[] memory) {
        uint[] memory articleIdsForSale = new uint[] (articleCounter);

        uint numberOfArticlesForSale = 0;
        // iterate over articles
        for (uint i = 1; i <= articleCounter; i++) {
            // keep the ID if the article is still for sale
            if (articles[i].articleState == ArticleState.ForSale) {
                articleIdsForSale[numberOfArticlesForSale] = articles[i].id;
                numberOfArticlesForSale++;
            }
        }

        // copy the articles array into a smaller forSale array
        uint[] memory forSale = new uint[] (numberOfArticlesForSale);

        for (uint j = 0; j < numberOfArticlesForSale; j++) {
            forSale[j] = articleIdsForSale[j];
        }
        return forSale;
    }

    /**
    @dev Buy an article
     */
    function buyArticle(uint _id) public payable paidEnough(articles[_id].price) stopIfEmergency {
        // check whether there is an article for sale & article Exists
        require(articleCounter > 0, '');
        require(_id > 0 && _id <= articleCounter, '');

        Article storage article = articles[_id];

        require(article.buyer == address(0), '');
        require(msg.sender != article.seller, '');

        article.buyer = msg.sender;
        article.articleState = ArticleState.Sold;

        uint storeOwnerId = storeOwnersIds[article.seller];
        storeOwners[storeOwnerId].balance += msg.value;
    }
}