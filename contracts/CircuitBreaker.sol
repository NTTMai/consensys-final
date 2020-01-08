pragma solidity ^0.5.0;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
@title CircuitBreaker
@dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract CircuitBreaker is Ownable {
    bool private stopped = false;

    function toggle_active() public onlyOwner {
        stopped = !stopped;
    }

    modifier stopIfEmergency() {
        require(!stopped, '');
        _;
    }
}