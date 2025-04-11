import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { default as Zoom } from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import '../styles/produto.css';
import { auth, firestore } from '../firebase'; // Importe as funções do Firebase
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Importações corretas do Firestore
import { signOut, onAuthStateChanged } from 'firebase/auth'; // Importações corretas do Auth
import { Link } from 'react-router-dom'; // Importação do Link
import Footer from '../components/footer'; // Importa o componente Footer

const sizes = ['P', 'M', 'G', 'GG']; // Tamanhos permitidos

const produtos = [
  { 
    id: 1, 
    nome: "Camiseta Tech", 
    preco: "R$ 89,90",
    imagens: [
      { original: '/imagens/pretamasculina.png', thumbnail: '/imagens/pretamasculina.png' }, 
      { original: '/imagens/pretamasculina2.png', thumbnail: '/imagens/pretamasculina2.png' },
      { original: '/imagens/pretamasculina.png', thumbnail: '/imagens/pretamasculina.png' },
      { original: '/imagens/pretamasculina2.png', thumbnail: '/imagens/pretamasculina2.png' }
    ]
  },
  { 
    id: 2, 
    nome: "Camiseta Comfort", 
    preco: "R$ 89,90",
    imagens: [
      { original: '/imagens/brancamasculina.png', thumbnail: '/imagens/brancamasculina.png' },
      { original: '/imagens/brancamasculina.png', thumbnail: '/imagens/brancamasculina.png' },
      { original: '/imagens/brancamasculina.png', thumbnail: '/imagens/brancamasculina.png' },
      { original: '/imagens/brancamasculina.png', thumbnail: '/imagens/brancamasculina.png' }
    ]
  },
];

function Produto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserName(currentUser.displayName || currentUser.email);
      }
    });

    return () => unsubscribe();
  }, []);

  const produto = produtos.find(produto => produto.id === parseInt(id));

  if (!produto) {
    return <p>Produto não encontrado.</p>;
  }

  const precoParcelado = (parseFloat(produto.preco.replace('R$', '').trim()) / 3).toFixed(2);

  const addToCart = async () => {
    if (!selectedSize) {
      alert("Por favor, selecione um tamanho para o produto antes de adicionar ao carrinho.");
      return; // Impede a adição ao carrinho se o tamanho não for selecionado
    }

    const newItem = {
      itemNumber: `#QUE-${Math.floor(Math.random() * 1000000)}`,
      name: produto.nome,
      price: parseFloat(produto.preco.replace('R$', '').trim()),
      quantity,
      size: selectedSize,
      imgUrl: produto.imagens[0].original,
    };

    if (user) {
      try {
        const cartDocRef = doc(firestore, 'carts', user.uid);
        const cartDoc = await getDoc(cartDocRef);

        let cartItems = [];
        if (cartDoc.exists()) {
          cartItems = cartDoc.data().items || [];
        }

        const existingItemIndex = cartItems.findIndex(item => item.itemNumber === newItem.itemNumber);

        if (existingItemIndex > -1) {
          cartItems[existingItemIndex].quantity += quantity;
        } else {
          cartItems.push(newItem);
        }

        await setDoc(cartDocRef, { items: cartItems });
        navigate('/cart'); // Redireciona para o carrinho após adicionar
      } catch (error) {
        console.error("Erro ao adicionar produto ao carrinho:", error);
      }
    } else {
      const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
      const updatedCart = [...currentCart, newItem];
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      navigate('/cart'); // Redireciona para o carrinho após adicionar
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
  };

  return (
    <div className="container">
      {/* Menu Toggle */}
      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <i className="fas fa-bars"></i>
      </div>

      {/* Menu Lateral */}
      {menuOpen && (
        <div className="menu-overlay">
          <div className="menu-box" onClick={(e) => e.stopPropagation()}>
            <span className="close-menu" onClick={() => setMenuOpen(false)}>
              &times;
            </span>
            <h2>Menu</h2>
            {user && (
              <>
                <div className="menu-item user-info">
                  <i className="fas fa-user"></i>
                  <span className="username">{user.displayName || "Logado"}</span>
                </div>
                {/* Botão de Perfil */}
                <Link to="/perfil" className="menu-item" onClick={() => setMenuOpen(false)}>
                  <i className="fas fa-user-circle"></i>
                  <span>Perfil</span>
                </Link>

                {/* Botão de Pedidos */}
                <Link to="/my-orders" className="menu-item" onClick={() => setMenuOpen(false)}>
                  <i className="fas fa-box"></i>
                  <span>Meus Pedidos</span>
                </Link>
              </>
            )}
            <Link to="/" className="menu-item" onClick={() => setMenuOpen(false)}>
              <i className="fas fa-home"></i>
              <span>Home</span>
            </Link>
            {user ? (
              <button className="menu-item" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Sair</span>
              </button>
            ) : (
              <Link to="/auth" className="menu-item" onClick={() => setMenuOpen(false)}>
                <i className="fas fa-user"></i>
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Ícone do Carrinho */}
      <div className="icon-container">
        <Link to="/cart" className="icon-carrinho">
          <i className="fas fa-shopping-cart"></i>
        </Link>
      </div>

      <main>
        <div className="product-grid">
          <div className="product-gallery">
            <div className="image-grid">
              {produto.imagens.map((image, index) => (
                <Zoom key={index}>
                  <img 
                    src={image.original} 
                    alt={`Imagem ${index + 1}`} 
                    className="product-image" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
                  />
                </Zoom>
              ))}
            </div>
          </div>

          <div className="product-info">
            <h1>{produto.nome}</h1>

            <div className="product-price">
              <p className="main-price">{produto.preco}</p>
              <p className="installment-price">
                ou em até <strong>3x de R$ {precoParcelado}</strong> sem juros
              </p>

              {/* Descrição do produto */}
              <p className="product-description">
                Camiseta Tech de alta qualidade, com tecido exclusivo e tecnologia avançada. Ideal para quem busca conforto e estilo. Disponível em várias cores e tamanhos.
              </p>
            </div>

            {/* Seleção de tamanhos */}
            <div className="size-selector">
              <h3>Tamanho</h3>
              <div className="size-options">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className={`size-button ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Controle de quantidade */}
            <div className="quantity-selector">
              <h3>Quantidade</h3>
              <div className="quantity-control">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>-</button>
                <span>{quantity}</span> {/* Exibindo a quantidade atual */}
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            {/* Botão Adicionar ao Carrinho */}
            <button className="add-to-cart" onClick={addToCart}>ADICIONAR AO CARRINHO</button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Produto;
