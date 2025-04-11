import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import '../styles/payment-instructions.css';

const PaymentInstructions = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderDoc = await getDoc(doc(firestore, 'orders', orderId));
        if (orderDoc.exists()) {
          setOrder(orderDoc.data());
        } else {
          setError('Pedido não encontrado');
        }
      } catch (err) {
        setError('Erro ao carregar pedido');
      }
      setLoading(false);
    };

    loadOrder();
  }, [orderId]);

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!order) return <div className="error">Pedido não encontrado</div>;

  const { payment } = order;
  const isPix = payment.method === 'pix';

  return (
    <div className="payment-instructions-container">
      <h1>{isPix ? 'Pagamento via PIX' : 'Pagamento via Boleto'}</h1>
      
      <div className="instructions-card">
        <h2>Instruções de Pagamento</h2>
        
        {isPix ? (
          <>
            <div className="pix-key">
              <p>Chave PIX:</p>
              <code>{payment.details.pix_key}</code>
              <button onClick={() => navigator.clipboard.writeText(payment.details.pix_key)}>
                Copiar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="boleto-info">
              <p>Código do Boleto:</p>
              <code>{payment.details.boleto_barcode}</code>
              <button onClick={() => navigator.clipboard.writeText(payment.details.boleto_barcode)}>
                Copiar
              </button>
            </div>
            <div className="boleto-actions">
              <a 
                href={payment.details.boleto_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="button"
              >
                Visualizar Boleto
              </a>
            </div>
          </>
        )}

        <div className="payment-details">
          <p><strong>Valor:</strong> R$ {order.total.toFixed(2)}</p>
          <p><strong>Vencimento:</strong> {new Date(payment.details.expires_at).toLocaleDateString()}</p>
        </div>

        <div className="important-info">
          <h3>Importante</h3>
          <ul>
            <li>O pagamento pode levar até 1 hora útil para ser confirmado (PIX)</li>
            <li>O boleto pode levar até 3 dias úteis para ser compensado</li>
            <li>Você receberá um e-mail assim que o pagamento for confirmado</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentInstructions;
