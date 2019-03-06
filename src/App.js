import React, { Component } from 'react';
import './style.css';
import axios from 'axios'
import {withRouter} from "react-router-dom";
import { Auth } from 'aws-amplify'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [
          {
          user:"Bot",
          text:"Say \"Eat\"!"
        }
      ]
    };
    this.sendMessage = this.sendMessage.bind(this)
    this.receiveMessage = this.receiveMessage.bind(this)
    this.signOut = this.signOut.bind(this)
  }

  sendMessage(message_text){


    const message = {
      user: 'You',
      text: message_text
    };


    if( message_text && message_text.length > 0 && message_text !== ""){
      this.setState({
        messages:[...this.state.messages, message]
      });

      axios.post('https://dhcygmkjfa.execute-api.us-east-1.amazonaws.com/prod/chatbot',
          {
            messages:[
              {
                type:"string",
                unstructured:{
                  id:"user1",
                  text: message_text,
                  timestamp: Date.now()

                }
              }
            ]
          })
          .then(response => {this.receiveMessage(response); console.log(response)});
    }

  }

  receiveMessage(response){


    console.log(response)
    if("body" in response.data){
      var message_text = response.data.body.messages[0].unstructured.text;
      console.log(message_text);

      if("recommendations" in response.data.body.messages[0].unstructured){
        const rec = JSON.parse(response.data.body.messages[0].unstructured.recommendations);
        console.log(rec);
        this.setState({
          messages:[...this.state.messages,
            {user:"Bot",
              text:"Here is a list of recommended restaurants"
            }]
        })
        rec.data.search.business.map((x) =>
        {
          console.log(x.name + "Address:" + x.location.address1+", "+x.location.city+", "+x.location.state+", "+x.location.country)

          this.setState({
          messages:[...this.state.messages,
            {
              user:"Bot",
              text: "["+ x.name+"] Address:" + x.location.address1+", "+x.location.city+", "+x.location.state+", "+x.location.country
            }
            ]
          })
        })


      }

      const message = {
        user: 'Bot',
        text: message_text
      };

      this.setState({
        messages:[...this.state.messages, message]
      });



    }



  }

  signOut(){
    Auth.signOut()
        .then(() => {
          this.props.history.push('/auth')
        })
        .catch((err) => {
          console.log(err);
          alert('Sign out Error.')
        })
  }


  render() {
    return (
        <div className="app">

          <MessageList
          messages={this.state.messages} />

          <SendMessageForm
              sendMessage={this.sendMessage} />
          <button onClick={this.signOut} style={{ height: 50, width: 200 }}>
            Sign Out
          </button>
        </div>

    );
  }
}

class MessageList extends React.Component {
  render() {
    return (
        <ul className="message-list">
          {this.props.messages.map((message, index) => {
            if(message.user === 'You'){
              return (

                  <li  key={index} className="message_human">
                    <div>{message.user}</div>
                    <div>{message.text}</div>
                  </li>
              )
            }
            else {
              return (
                  <li key={index} className="message_bot">
                    <div>{message.user}</div>
                    <div>{message.text}</div>
                  </li>
              )
            }

          })}
        </ul>
    )
  }
}

class SendMessageForm extends React.Component {
  constructor() {
    super()
    this.state = {
      message: ''
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(e) {
    this.setState({
      message: e.target.value
    })
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.sendMessage(this.state.message);
    // this.props.sendMessage(e.target.value)
    this.setState({
      message: ''
    })
  }

  render() {
    return (
        <form
            onSubmit={this.handleSubmit}
            className="send-message-form">
          <input
              onChange={this.handleChange}
              value={this.state.message}
              placeholder="Type your message and hit ENTER"
              type="text" />
        </form>
    )
  }
}


export default withRouter(App);
