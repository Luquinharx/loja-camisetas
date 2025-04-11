import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/userorders.css';
import Footer from '../components/footer';

function UserOrders() {
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const orders = [
    {
      id: 1,
      status: 'Concluído',
      timeline: [
        { step: 'Pedido efetuado', status: 'Concluído' },
        { step: 'Aguardando pagamento', status: 'Concluído' },
        { step: 'Pagamento efetuado', status: 'Concluído' },
        { step: 'Pedido em separação', status: 'Concluído' },
        { step: 'Pedido enviado', status: 'Concluído' },
        { step: 'Pedido concluído', status: 'Concluído' },
      ],
    },
    {
      id: 2,
      status: 'Em preparação',
      timeline: [
        { step: 'Pedido efetuado', status: 'Concluído' },
        { step: 'Aguardando pagamento', status: 'Concluído' },
        { step: 'Pagamento efetuado', status: 'Concluído' },
        { step: 'Pedido em separação', status: 'Em andamento' },
        { step: 'Pedido enviado', status: 'Pendente' },
        { step: 'Pedido concluído', status: 'Pendente' },
      ],
    },
  ];

  const handleOrderClick = (orderId) => {
    setSelectedOrderId(orderId === selectedOrderId ? null : orderId);
  };

  const selectedOrder = orders.find((order) => order.id === selectedOrderId);

  return (
    <div className="container">
      <header className="header">
        <Link to="/" className="header-icon">
          <i className="fa-solid fa-house"></i>
        </Link>
        <Link to="/cart" className="header-icon">
          <i className="fa-solid fa-cart-shopping"></i>
        </Link>
      </header>

      <div className="content">
        <div className="orders-box">
          <h2>Meus Pedidos</h2>
          <ul>
            {orders.map((order) => (
              <li
                key={order.id}
                className={selectedOrderId === order.id ? 'selected' : ''}
                onClick={() => handleOrderClick(order.id)}
              >
                <span><strong>Pedido {order.id} - {order.status}</strong></span>
              </li>
            ))}
          </ul>
        </div>

        <div className="timeline-container">
          {selectedOrder && (
            <div>
              <h3><strong>Pedido {selectedOrder.id}</strong></h3>
              <div className="timeline">
                {selectedOrder.timeline.map((step, index, arr) => (
                  <div key={index} className="timeline-step">
                    <div
                      className="timeline-circle"
                      style={{
                        backgroundColor: step.status === 'Concluído' ? '#4caf50' : '#ccc',
                      }}
                    >
                      {step.status === 'Concluído' ? <i className="fas fa-check"></i> : ''}
                    </div>
                    <div className="timeline-step-text">
                      <strong>{step.step.split(' ').slice(0, 2).join(' ')}</strong>
                      <br />
                      <strong>{step.step.split(' ').slice(2).join(' ')}</strong>
                    </div>
                  </div>
                ))}
              </div>
              <div className="timeline-line-container">
                <div className="timeline-line"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default UserOrders;
