import React, { Component } from 'react';

class Popup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }
  openPopup() {
    this.setState({
      isOpen: true,
    });
  }
  closePopup() {
    this.setState({
      isOpen: false,
    });
  }
  render() {
    let popupStyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: '9999',
      background: '#fff',
    };
    let backdropStyle = {
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: '0px',
      left: '0px',
      zIndex: '9998',
      background: 'rgba(0, 0, 0, 0.3)'
    }
    return (
      <div>
        
      </div>
    );
  }
}

export default Popup;