
import React, { Component } from 'react';
import './style.css'

import Header from './Header'
import Router from './Router'

class AppHome extends Component {
    render() {
        return (
            <div className="App">
                <Header/>
                <Router/>
            </div>
        );
    }
}

export default AppHome;