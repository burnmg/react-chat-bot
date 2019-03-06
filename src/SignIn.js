import React from 'react'
import { css } from 'glamor'
import { Auth } from 'aws-amplify'

import { withRouter } from 'react-router-dom'

class SignIn extends React.Component {
    state = {
        username: '',
        password: '',
        authCode: ''
    };
    onChange = (key, value) => {
        this.setState({
            [key]: value
        })
    };
    signIn = () => {
        Auth.signIn(this.state.username, this.state.password)
            .then(user => {
                this.props.history.push('/')
            })
            .catch(err => {
                console.log('error signing in...: ', err);
                alert("Check your username or password")

            })
    };
    render() {
        return (
            <div {...css(styles.container)}>
                <div {...css(styles.container)}>
                    <input
                        onChange={evt => this.onChange('username', evt.target.value)}
                        {...css(styles.input)}
                        placeholder='username'
                    />
                    <input
                        type='password'
                        onChange={evt => this.onChange('password', evt.target.value)}
                        {...css(styles.input)}
                        placeholder='password'
                    />
                    <div {...css(styles.button)} onClick={this.signIn}>
                        <p {...css(styles.buttonText)}>Sign In</p>
                    </div>
                </div>
            </div>
        )
    }
}

const styles = {
    button: {
        padding: '10px 60px',
        backgroundColor: '#ddd',
        cursor: 'pointer',
        borderRadius: '3px',
        ':hover': {
            backgroundColor: '#ededed'
        }
    },
    buttonText: {
        margin: 0
    },
    input: {
        height: 40,
        marginBottom: '10px',
        border: 'none',
        outline: 'none',
        borderBottom: '2px solid #4CAF50',
        fontSize: '16px',
        '::placeholder': {
            color: 'rgba(0, 0, 0, .3)'
        }
    },
    container: {
        flex: 1,
        paddingTop: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    }
};

export default withRouter(SignIn)