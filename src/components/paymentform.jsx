import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const PaymentForm = ({ amount, paymentMethod, onSuccess }) => {
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
          payment_method_data: {
            type: paymentMethod,
            billing_details: {
              address: {
                country: 'BR',
              },
            },
          },
          return_url: `${window.location.origin}/completion`,
        },
        redirect: 'if_required'
      });

      if (error) {
        setError(error.message);
      } else if (paymentIntent.status === 'succeeded' || 
                 paymentIntent.status === 'processing' ||
                 paymentIntent.next_action) {
        await onSuccess(paymentIntent);
      }
    } catch (err) {
      setError('Ocorreu um erro ao processar o pagamento.');
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <PaymentElement options={{
        paymentMethodOrder: [paymentMethod],
      }} />
      {error && <div className="error-message">{error}</div>}
      <button 
        type="submit" 
        disabled={!stripe || processing}
        className="payment-button"
      >
        {processing ? 'Processando...' : `Pagar R$ ${amount.toFixed(2)}`}
      </button>
    </form>
  );
};

export default PaymentForm;