import React from 'react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="cart-item">
      <img src={item.imgUrl} alt={item.name} className="item-image" />
      <div className="item-details">
        <div className="item-number">{item.itemNumber}</div>
        <h3 className="item-name">{item.name}</h3>
        <div className="item-price">R$ {item.price.toFixed(2)}</div>
        <div className="quantity-controls">
          <button 
            className="quantity-btn"
            onClick={() => onUpdateQuantity(item.itemNumber, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <span className="quantity-display">{item.quantity}</span>
          <button 
            className="quantity-btn"
            onClick={() => onUpdateQuantity(item.itemNumber, item.quantity + 1)}
          >
            +
          </button>
        </div>
        <div className={`stock-status ${item.stockStatus === 'In Stock' ? 'in-stock' : 'out-of-stock'}`}>
          {item.stockStatus}
        </div>
      </div>
      <button 
        className="remove-btn"
        onClick={() => onRemove(item.itemNumber)}
      >
        Remover
      </button>
    </div>
  );
};

export default CartItem;