import logo from "./logo.svg";
import "./App.css";
import React from "react";
import web3 from './web3';
import lottery from './lottery';

class App extends React.Component {
  state={
    manager:'',
    players:[],
    balance:'',
    value:'',
    message:'',
    lastWinner: ''
  };  //This is equivalent to the below constructor function.
  
  // constructor(props){
  //   super(props);
  //   this.state={manager:''};
  // }
  async componentDidMount() {
    const manager=await lottery.methods.manager().call();
    const players=await lottery.methods.getPlayers().call();
    const balance=await web3.eth.getBalance(lottery.options.address);
    const lastWinner = await lottery.methods.lastWinner().call();
    
    //this balance is given in wei, so we will need to adjust to ether below.
    this.setState({manager:manager,players:players, balance:balance, lastWinner: lastWinner});
  }
    onSubmit=async (event)=>{
      event.preventDefault();

      const accounts=await web3.eth.getAccounts();

      this.setState({message:'Waiting for transaction to complete...'});

      await lottery.methods.enter().send({
        from:accounts[0],
        value: web3.utils.toWei(this.state.value,'ether')
      });

      this.setState({message:'You have been entered!'});
    }

    onClick=async ()=>{
      const accounts=await web3.eth.getAccounts();

      this.setState({message:'Picking winner. Please wait...'});

      await lottery.methods.pickWinner().send({
        from:accounts[0]        
      });
      const lastWinner = lottery.methods.pickWinner.call();
      const winner = await lottery.methods.lastWinner().call();
      this.setState({message:`A winner has been picked! Congratulations ${winner}`});
    };
  
  
  render() {
    
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p> This contract is managed by {this.state.manager}.
        There are currently {this.state.players.length} people currently entered, competing to win {web3.utils.fromWei(this.state.balance,'ether')} ether.
        </p>
        <p>Last winner was { this.state.lastWinner } </p>
        <hr />

        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter: </label>
            <input 
              value={this.state.value}
              onChange={event=>this.setState({value:event.target.value})}
            />
          </div>
          <p>(The amount needs to be greater than 0.01 ether to run.) </p>
          <p> Please only use test network ether, not real ether to use the lotto. </p>
          <button>Enter</button>
        </form>
        <hr />
        <h4>Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick Winner now</button>
        <hr />
        <h1>{this.state.message}</h1>
      </div>
    );
  }
}
export default App;
