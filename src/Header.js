
import React from 'react'
import { css } from 'glamor'



class Header extends React.Component {
    componentDidMount(){
        document.title = "Yum Yum Yum"
    }

    render() {
        return (
            <div {...css(styles.container)}>
                <h2 {...css(styles.title)}>The Bot of Eat!</h2>
            </div>
        )
    }


}

const styles = {
    title: {
        color: 'white',
        margin: 0,
        padding: '25px',
        textAlign: 'left'
    },
    container: {
        height: '80px',
        width: '100%',
        backgroundColor: '#4CAF50'
    },
}

export default Header