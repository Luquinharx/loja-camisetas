import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const CheckoutForm = ({ onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/completion`,
        },
        redirect: 'if_required'
      });

      if (error) {
        setError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        await onPaymentSuccess(paymentIntent);
      }
    } catch (err) {
      setError('Ocorreu um erro ao processar o pagamento.');
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <PaymentElement />
      {error && <div className="error-message">{error}</div>}
      <button 
        type="submit" 
        disabled={!stripe || processing}
        className="payment-button"
      >
        {processing ? 'Processando...' : 'Pagar Agora'}
      </button>
    </form>
  );
};

export default CheckoutForm;