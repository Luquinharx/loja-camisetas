import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { collection, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import CartItem from '../components/cartitem';
import '../styles/cart.css';

const Cart = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Busca o documento do usuário na coleção "users" pelo UID
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            // Usa o UID como ID do documento na coleção "carts"
            const unsubscribeCart = onSnapshot(
              doc(firestore, 'carts', user.uid),
              (doc) => {
                if (doc.exists()) {
                  setItems(doc.data().items || []);
                } else {
                  // Se não existir um carrinho, cria um vazio
                  setItems([]);
                  setDoc(doc(firestore, 'carts', user.uid), { items: [] });
                }
                setLoading(false);
              }
            );
            return () => unsubscribeCart();
          } else {
            console.error("Usuário não encontrado na coleção 'users'");
            setLoading(false);
          }
        } catch (error) {
          console.error("Erro ao buscar usuário:", error);
          setLoading(false);
        }
      } else {
        // Se não estiver logado, usa o localStorage
        const storedItems = JSON.parse(localStorage.getItem('cart')) || [];
        setItems(storedItems);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const updateCart = async (newItems) => {
    const user = auth.currentUser;

    if (user) {
      try {
        // Atualiza no Firestore usando o UID
        await setDoc(doc(firestore, 'carts', user.uid), {
          items: newItems,
          updatedAt: new Date(),
          userId: user.uid
        });
      } catch (error) {
        console.error("Erro ao atualizar carrinho:", error);
      }
    } else {
      // Atualiza no localStorage
      localStorage.setItem('cart', JSON.stringify(newItems));
    }
    setItems(newItems);
  };

  const handleUpdateQuantity = async (itemNumber, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedItems = items.map(item => 
      item.itemNumber === itemNumber ? { ...item, quantity: newQuantity } : item
    );
    await updateCart(updatedItems);
  };

  const handleRemoveItem = async (itemNumber) => {
    const updatedItems = items.filter(item => item.itemNumber !== itemNumber);
    await updateCart(updatedItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
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
    navigate('/checkout');
  };

  const subtotal = calculateSubtotal();
  const shipping = 15.00;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading">Carregando carrinho...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <h2>Seu carrinho está vazio</h2>
          <p>Adicione alguns produtos para começar suas compras!</p>
          <Link to="/" className="continue-shopping">
            Continuar Comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Meu Carrinho</h1>
        <button 
          className="checkout-btn"
          onClick={() => navigate('/')}
        >
          Voltar para a Loja
        </button>
      </div>

      <div className="cart-items">
        {items.map(item => (
          <CartItem
            key={item.itemNumber}
            item={item}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveItem}
          />
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>R$ {subtotal.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Frete</span>
          <span>R$ {shipping.toFixed(2)}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>
        <button 
          className="checkout-btn"
          onClick={handleCheckout}
        >
          Finalizar Compra
        </button>
      </div>
    </div>
  );
};

export default Cart;
