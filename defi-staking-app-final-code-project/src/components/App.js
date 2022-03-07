import React, { Component } from 'react'
import Navbar from './Navbar'
import Web3 from 'web3'
import './App.css'
import Main from './Main'
import Tether from '../truffle_abis/TetherToken.json'
import Reward from '../truffle_abis/RewardToken.json'
import DecentralBank from '../truffle_abis/DecentralBank.json'
import ParticleSettings from './ParticleSettings'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }


  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    console.log(accounts)
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()

    //LOAD Tether TOKEN
    const tetherTokenData = Tether.networks[networkId]
    console.log(tetherTokenData)
    if (tetherTokenData) {
      const tether = new web3.eth.Contract(Tether.abi, tetherTokenData.address)
      this.setState({ tether })
      let tetherTokenBalance = await tether.methods.balanceOf(this.state.account).call()
      this.setState({ tetherTokenBalance: tetherTokenBalance.toString() })
    } else {
      window.alert("Tether Token contract not deployed to detected network")
    }

    //LOAD Reward TOKEN
    const rewardTokenData = Reward.networks[networkId]
    console.log(rewardTokenData)
    if (rewardTokenData) {
      const reward = new web3.eth.Contract(Reward.abi, rewardTokenData.address)
      this.setState({ reward })
      let rewardTokenBalance = await reward.methods.balanceOf(this.state.account).call()
      this.setState({ rewardTokenBalance: rewardTokenBalance.toString() })
    } else {
      window.alert("Reward Token contract not deployed to detected network")
    }

    //Load DecentralBank
    const decentralBankData = DecentralBank.networks[networkId]
    console.log(decentralBankData)
    if (decentralBankData) {
      const decentralBank = new web3.eth.Contract(DecentralBank.abi, decentralBankData.address)
      this.setState({ decentralBank })
      let stakingBalance = await decentralBank.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
    } else {
      window.alert([decentralBankData, networkId, "Bank contract not deployed to detected network"])
    }

    this.setState({ loading: false })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non ethereum browser detected. You should consider Metamask!')
    }
  }

  issueRewardTokens = async () => {
    this.setState({ loading: true });

    await this.state.decentralBank.methods
      .issueTokens()
      .send({ from: this.state.account });

    this.setState({ loading: false });

    window.location.reload(false);
  };

  stakeTokens = async (amount) => {
    this.setState({ loading: true });

    await this.state.tether.methods
      .approve(this.state.decentralBank._address, amount)
      .send({ from: this.state.account });

    await this.state.decentralBank.methods
      .depositTokens(amount)
      .send({ from: this.state.account });

    this.setState({ loading: false });

    window.location.reload(false);

  };

  //https://stackoverflow.com/questions/70405024/metamask-rpc-error-cannot-set-properties-of-undefined-setting-loadingdefaul
  //https://github.com/MetaMask/metamask-extension/issues/13197

  /*stakeTokens = (amount) => {
    this.setState({loading: true })

    this.state.tether.methods.approve(this.state.decentralBank._address, amount).send({from: this.state.account}).on('confirmation', (confirmation) => {
       this.state.decentralBank.methods.depositTokens(amount).send({from: this.state.account}).on('transactionHash', (hash) => {
         this.setState({loading:false})
      })
    }) 
  }*/

  unstakeTokens = async () => {
    this.setState({ loading: true })
    await this.state.decentralBank.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
      window.location.reload(false);
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      tether: {},
      reward: {},
      decentralBank: {},
      tetherTokenBalance: '0',
      rewardTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  render() {
    let content

    {
      this.state.loading ? content = <p id="loader" className='text-center' style={{ color: 'white', margin: '30px' }}>LOADING PLEASE...</p> : content =


        <Main
          tetherTokenBalance={this.state.tetherTokenBalance}
          rewardTokenBalance={this.state.rewardTokenBalance}
          stakingBalance={this.state.stakingBalance}
          stakeTokens={this.stakeTokens}
          unstakeTokens={this.unstakeTokens}
          issueRewardTokens={this.issueRewardTokens}
          decentralBankContract={this.decentralBank}
        />
    }

    return (

      <div className="App" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute' }}>
          <ParticleSettings />
        </div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }} style={{ minHeight: '100vm' }}>
              <div>
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
