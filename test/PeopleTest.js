const People = artifacts.require("People");
const truffleAssert = require("truffle-assertions");

contract("People", async function(accounts){

  it("shouldn't create a person older than 150 years.", async function(){
    let instance = await People.new();
    await truffleAssert.fails(instance.createPerson("Methusela", 200, 190, {value: web3.utils.toWei("1", "ether")}), truffleAssert.ErrorType.REVERT);
  });
  it("shouldn't create a person for free.", async function(){
    let instance = await People.deployed();
    await truffleAssert.fails(instance.createPerson("Nobody", 50, 190, {value: 1000}), truffleAssert.ErrorType.REVERT);
  });
  it("should set senior status correctly.", async function(){
    let instance = await People.deployed();
    await instance.createPerson("Bernie", 92, 190, {value: web3.utils.toWei("1", "ether")});
    let result = await instance.getPerson();
    assert(result.senior === true, "Senior level not set");
  });
  it("should set age correctly.", async function(){
    let instance = await People.deployed();
    let result = await instance.getPerson();
    assert(result.age.toNumber() === 92, "Age not set correctly");
  });
  it("should allow the contract owner to delete themselves.", async function(){
    let instance = await People.new();
    await instance.createPerson("Kamakazi", 14, 160, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.passes(instance.deletePerson(accounts[1], {from: accounts[0]}));
  });
  it("should allow the contract owner to delete somebody else.", async function(){
    let instance = await People.new();
    await instance.createPerson("Hilliary", 76, 160, {from: accounts[2], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.passes(instance.deletePerson(accounts[1], {from: accounts[0]}));
  });
  it("should not allow the same non-contract owner to delete themselves.", async function() {
    let instance = await People.new();
    await instance.createPerson("RobinWilliams", 29, 160, {from: accounts[2], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.fails(instance.deletePerson(accounts[2], {from: accounts[2]}), truffleAssert.ErrorType.REVERT);
  });
  it("should not allow a different non-contract owner to delete a person.", async function() {
    let instance = await People.new();
    await instance.createPerson("Hinkle", 29, 160, {from: accounts[2], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.fails(instance.deletePerson(accounts[3], {from: accounts[2]}), truffleAssert.ErrorType.REVERT);
  });
});