import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { calculateShipping } from '../services/shipping';
import { loadStripe } from '@stripe/stripe-js';
import '../styles/checkout.css';
import Footer from '../components/footer';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    cpf: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  useEffect(() => {
    const loadCart = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/auth', { 
          state: { 
            returnTo: '/checkout',
            message: 'Faça login para continuar com a compra' 
          } 
        });
        return;
      }

      try {
        const cartDoc = await getDoc(doc(firestore, 'carts', user.uid));
        if (cartDoc.exists()) {
          setCartItems(cartDoc.data().items || []);
          setCustomerData(prev => ({
            ...prev,
            email: user.email || ''
          }));
        }
      } catch (err) {
        setError('Erro ao carregar o carrinho');
      }
      setLoading(false);
    };

    loadCart();
  }, [navigate]);

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = selectedShipping ? parseFloat(selectedShipping.price) : 0;
    return subtotal + shipping;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCepBlur = async () => {
    if (customerData.cep.replace(/\D/g, '').length === 8) {
      setLoadingShipping(true);
      try {
        const viaCepResponse = await fetch(`https://viacep.com.br/ws/${customerData.cep}/json/`);
        const viaCepData = await viaCepResponse.json();
        
        if (!viaCepData.erro) {
          setCustomerData(prev => ({
            ...prev,
            street: viaCepData.logradouro,
            neighborhood: viaCepData.bairro,
            city: viaCepData.localidade,
            state: viaCepData.uf
          }));
        }

        const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const shippingOptions = await calculateShipping(
          customerData.cep.replace(/\D/g, ''),
          totalQuantity
        );

        setShippingOptions(shippingOptions);
      } catch (err) {
        console.error('Erro ao buscar CEP ou calcular frete:', err);
        setError('Erro ao calcular opções de frete');
      }
      setLoadingShipping(false);
    }
  };

  const handleShippingSelect = (option) => {
    setSelectedShipping(option);
  };

  const handlePayment = async () => {
    if (!selectedShipping) {
      setError('Por favor, selecione uma opção de frete');
      return;
    }

    const user = auth.currentUser;
    const total = calculateTotal();

    try {
      const stripe = await loadStripe('pk_test_51QqnxmHtnWLFftUJ7tBLwouhhsUKzvUY3FpqIJxqhrshzUHoda9On6cm4TMDFDHLccrTKKXcqYxvnZFC1Iv9USuH00k3KxZx6A'); // Chave pública de teste do Stripe

      const paymentIntent = await stripe.redirectToCheckout({
        lineItems: cartItems.map(item => ({
          price_data: {
            currency: 'brl',
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${window.location.href}/pedido/${user.uid}`,
        cancel_url: window.location.href,
      });

      if (paymentIntent.error) {
        setError('Erro ao processar pagamento');
      }
    } catch (err) {
      setError('Erro ao processar pagamento');
      console.error('Erro ao criar intent de pagamento:', err);
    }
  };

  const handleBack = () => {
    if (location.state?.from) {
      navigate(-1);
    } else {
      navigate('/cart');
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="checkout-container full-height">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <button className="back-button" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i>
          Voltar
        </button>
      </div>

      <h1>Finalizar Compra</h1>
      
      <div className="checkout-grid">
        <div className="customer-data">
          <h2>Dados do Cliente</h2>
          <div className="form-group">
            <input
              type="text"
              name="name"
              value={customerData.name}
              onChange={handleInputChange}
              placeholder="Nome completo"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                value={customerData.phone}
                onChange={handleInputChange}
                placeholder="Telefone"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="cpf"
                value={customerData.cpf}
                onChange={handleInputChange}
                placeholder="CPF"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={customerData.email}
              onChange={handleInputChange}
              placeholder="E-mail"
              required
            />
          </div>

          <h3>Endereço de Entrega</h3>
          <div className="form-group">
            <input
              type="text"
              name="cep"
              value={customerData.cep}
              onChange={handleInputChange}
              onBlur={handleCepBlur}
              placeholder="CEP"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="street"
              value={customerData.street}
              onChange={handleInputChange}
              placeholder="Rua"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="number"
                value={customerData.number}
                onChange={handleInputChange}
                placeholder="Número"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="complement"
                value={customerData.complement}
                onChange={handleInputChange}
                placeholder="Complemento"
              />
            </div>
          </div>
          <div className="form-group">
            <input
              type="text"
              name="neighborhood"
              value={customerData.neighborhood}
              onChange={handleInputChange}
              placeholder="Bairro"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="city"
                value={customerData.city}
                onChange={handleInputChange}
                placeholder="Cidade"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="state"
                value={customerData.state}
                onChange={handleInputChange}
                placeholder="Estado"
                required
              />
            </div>
          </div>
        </div>

        <div className="payment-section">
          <div className="order-summary">
            <h2>Resumo do Pedido</h2>
            {cartItems.map(item => (
              <div key={item.itemNumber} className="order-item">
                <span>{item.name} x {item.quantity}</span>
                <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="shipping-options">
            <h2>Opções de Frete</h2>
            {loadingShipping ? (
              <div className="loading-shipping">Calculando opções de frete...</div>
            ) : shippingOptions.length > 0 ? (
              shippingOptions.map(option => (
                <div
                  key={option.id}
                  className={`shipping-option ${selectedShipping?.id === option.id ? 'selected' : ''}`}
                  onClick={() => handleShippingSelect(option)}
                >
                  <div className="shipping-option-details">
                    <div className="shipping-company">{option.company}</div>
                    <div className="shipping-info">
                      {option.name} - Entrega em até {option.delivery_time} dias úteis
                    </div>
                  </div>
                  <div className="shipping-price">
                    R$ {parseFloat(option.price).toFixed(2)}
                  </div>
                </div>
              ))
            ) : customerData.cep ? (
              <div className="shipping-error">Nenhuma opção de frete disponível para este CEP</div>
            ) : (
              <div className="shipping-info">Digite seu CEP para calcular o frete</div>
            )}
          </div>

          <div className="order-total">
            <strong>Total</strong>
            <strong>R$ {calculateTotal().toFixed(2)}</strong>
          </div>

          <div className="payment-methods">
            <h2>Forma de Pagamento</h2>
            <div className="payment-options">
              <button
                className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                Cartão de Crédito
              </button>
              <button
                className={`payment-option ${paymentMethod === 'pix' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('pix')}
              >
                PIX
              </button>
              <button
                className={`payment-option ${paymentMethod === 'boleto' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('boleto')}
              >
                Boleto
              </button>
            </div>

            <button 
              onClick={handlePayment}
              className="payment-button"
              disabled={!selectedShipping}
            >
              Finalizar Compra
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
