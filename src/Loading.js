import React from 'react';
import loading30 from './Resources/Rolling-1s-30px.gif';
import loading150 from './Resources/Rolling-1s-100px.gif';

const Loading = ({ size }) => {
  let style = {
    width: '100%',
    height: '100%',
  };
  const style2 = {
    margin: 'auto',
    display: 'block',
  };
  let gif = null;
  if (size === 'small') {
    gif = loading30;
  } else {
    gif = loading150;
    style = {
      ...style,
    };
  }
  return (
    <div style={style}>
      <img style={style2} src={gif} alt="Ładuję" />
    </div>);
};

export default Loading;
