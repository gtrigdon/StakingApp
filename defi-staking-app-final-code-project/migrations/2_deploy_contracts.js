const RewardToken = artifacts.require('RewardToken')
const TetherToken = artifacts.require('TetherToken')
const DecentralBank = artifacts.require('DecentralBank')

module.exports = async function (deployer, network, accounts) {

  // Deploy Mock Tether Token
  await deployer.deploy(TetherToken)
  const tether = await TetherToken.deployed()

  // Deploy Reward Token
  await deployer.deploy(RewardToken)
  const reward = await RewardToken.deployed()

  // Deploy DecentralBank
  await deployer.deploy(DecentralBank, reward.address, tether.address)
  const decentralBank = await DecentralBank.deployed()

  // Transfer all tokens to DecentralBank (1 million)
  await reward.transfer(decentralBank.address, '1000000000000000000000000')

  // Transfer 100 Mock Tether tokens to investor
  await tether.transfer(accounts[1], '100000000000000000000')
}
