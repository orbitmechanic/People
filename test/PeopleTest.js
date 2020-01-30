const People = artifacts.require("People");
const truffleAssert = require("truffle-assertions");

contract("People", async function(accounts){

  let instance;

  beforeEach(async function() {
    instance = await People.new();
  });

  it("shouldn't create a person older than 150 years.", async function(){
    await truffleAssert.fails(instance.createPerson("Methusela", 200, 190, {value: web3.utils.toWei("1", "ether")}), truffleAssert.ErrorType.REVERT);
  });
  it("shouldn't create a person for free.", async function(){
    await truffleAssert.fails(instance.createPerson("Nobody", 50, 190, {value: 1000}), truffleAssert.ErrorType.REVERT);
  });
  it("should set senior status correctly.", async function(){
    await instance.createPerson("Bernie", 92, 190, {value: web3.utils.toWei("1", "ether")});
    let result = await instance.getPerson();
    assert(result.senior === true, "Senior level not set");
  });
  it("should set age correctly.", async function(){
    await instance.createPerson("Bernie", 92, 190, {value: web3.utils.toWei("1", "ether")});
    let result = await instance.getPerson();
    assert(result.age.toNumber() === 92, "Age not set correctly");
  });


  it("should allow the contract owner to delete themselves.", async function(){
    await instance.createPerson("Kamakazi", 14, 160, {from: accounts[0], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.passes(instance.deletePerson(accounts[0], {from: accounts[0]}));
  });
  it("should allow the contract owner to delete somebody else.", async function(){
    await instance.createPerson("Hilliary", 76, 160, {from: accounts[0], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.passes(instance.deletePerson(accounts[1], {from: accounts[0]}));
  });
  it("should not allow the same non-contract owner to delete themselves.", async function() {
    await instance.createPerson("RobinWilliams", 29, 160, {from: accounts[2], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.fails(instance.deletePerson(accounts[2], {from: accounts[2]}), truffleAssert.ErrorType.REVERT);
  });
  it("should not allow a different non-contract owner to delete someone else.", async function() {
    await instance.createPerson("Hinkle", 29, 160, {from: accounts[2], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.fails(instance.deletePerson(accounts[3], {from: accounts[2]}), truffleAssert.ErrorType.REVERT);
  });


  it("should increase balance when a person is added by owner.", async function() {
    await instance.createPerson("Narcasist", 29, 160, {from: accounts[0], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.passes(web3.eth.getBalance(instance.address) >= web3.utils.toWei("0.5", "ether"));
  });
  it("should decrease owner's balance when a person is added by owner.", async function() {
    await instance.createPerson("Narcasist", 29, 160, {from: accounts[0], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.passes(web3.eth.getBalance(accounts[0]) < web3.utils.toWei("98", "ether"));
  });
  it("should increase balance when a person is added by a non-owner.", async function() {
    await instance.createPerson("Shawn", 29, 160, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.passes(web3.eth.getBalance(instance.address) >= web3.utils.toWei("1", "ether"));
  });
  it("should decrease originating balance when a person is added by a non-owner.", async function() {
    await instance.createPerson("Sheep", 29, 160, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.passes(web3.eth.getBalance(accounts[1]) <= web3.utils.toWei("98", "ether"));
  });
  it("internal balance variable should match on-chain contract balance.", async function() {
    await instance.createPerson("Smith", 29, 160, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
    let balance = await instance.balance();
    await truffleAssert.passes(web3.eth.getBalance(instance.address) == balance);
  });
  it("should increase balance by 1 Eth when a person is added.", async function() {
    await truffleAssert.passes(web3.eth.getBalance(instance.address) == web3.utils.toWei("0", "ether"));
    await instance.createPerson("Jones", 29, 160, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.passes(web3.eth.getBalance(instance.address) == web3.utils.toWei("1", "ether"));
  });
  it("should increase balance by 2 Eth when two people are added.", async function() {
    await truffleAssert.passes(web3.eth.getBalance(instance.address) == web3.utils.toWei("0", "ether"));
    await instance.createPerson("Jones", 29, 160, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.passes(web3.eth.getBalance(instance.address) == web3.utils.toWei("1", "ether"));
    await instance.createPerson("JonesToo", 29, 160, {from: accounts[2], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.passes(web3.eth.getBalance(instance.address) == web3.utils.toWei("2", "ether"));
  });
  it("should allow contract owner to withdraw all of its balance.", async function() {
    await instance.createPerson("Jones", 29, 160, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
    await instance.createPerson("JonesToo", 29, 160, {from: accounts[2], value: web3.utils.toWei("1", "ether")});
    await instance.createPerson("OtherJones", 29, 160, {from: accounts[3], value: web3.utils.toWei("1", "ether")});
    await instance.createPerson("JJonesAnon", 29, 160, {from: accounts[4], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.passes(instance.withdrawAll({from: accounts[0]}));
  });
  it("should increase contract owner's balance by same amount on full withdraw.", async function() {
    await instance.createPerson("Jones", 29, 160, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
    await instance.createPerson("JonesToo", 29, 160, {from: accounts[2], value: web3.utils.toWei("1", "ether")});
    await instance.createPerson("OtherJones", 29, 160, {from: accounts[3], value: web3.utils.toWei("1", "ether")});
    await instance.createPerson("JJonesAnon", 29, 160, {from: accounts[4], value: web3.utils.toWei("1", "ether")});
    await instance.withdrawAll({from: accounts[0]});
    await truffleAssert.passes(web3.eth.getBalance(accounts[0]) >= web3.utils.toWei("103", "ether"));
  });
  it("should not allow non-contract owners to withdraw all of its balance.", async function() {
    await instance.createPerson("Thief", 29, 160, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
    await instance.createPerson("Ericson", 29, 160, {from: accounts[2], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.fails(instance.withdrawAll({from: accounts[1]}));
    await truffleAssert.fails(instance.withdrawAll({from: accounts[2]}));
    await truffleAssert.fails(instance.withdrawAll({from: accounts[3]}));
  });
});