pragma solidity 0.5.12;

contract Ownable{
    address public owner;

    modifier onlyOwner(){
        require(msg.sender == owner, "Must be Owner to execute function.");
        _; //Continue execution
    }

    constructor() public{
        owner = msg.sender;
    }
}