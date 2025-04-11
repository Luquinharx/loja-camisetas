import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../styles/catalogo.css'; // Importa o CSS específico do catálogo
import Footer from "../components/footer"; // Importa o componente Footer
import { auth } from '../firebase'; // Importe o auth do seu arquivo de configuração do Firebase
import { onAuthStateChanged, signOut } from "firebase/auth";

const Catalogo = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState("");

    // Lista de produtos
    const produtos = [
        { id: 1, nome: "Camiseta Relaxed", imagem: "/imagens/pretamasculina.png", imagemHover: "/imagens/pretamasculina2.png", preco: "R$ 89,90" },
        { id: 2, nome: "Camiseta Comfort", imagem: "/imagens/pretamasculina.png", imagemHover: "/imagens/pretamasculina2.png", preco: "R$ 79,90" },
        { id: 3, nome: "Camiseta Slim", imagem: "/imagens/pretamasculina.png", imagemHover: "/imagens/pretamasculina2.png", preco: "R$ 79,90" },
        { id: 4, nome: "Camiseta Regular", imagem: "/imagens/pretamasculina.png", imagemHover: "/imagens/pretamasculina2.png", preco: "R$ 59,90" },
        { id: 5, nome: "Camiseta Básica", imagem: "/imagens/pretamasculina.png", imagemHover: "/imagens/pretamasculina2.png", preco: "R$ 49,90" },
        { id: 6, nome: "Camiseta Estampada", imagem: "/imagens/pretamasculina.png", imagemHover: "/imagens/pretamasculina2.png", preco: "R$ 99,90" },
        { id: 7, nome: "Camiseta Vintage", imagem: "/imagens/pretamasculina.png", imagemHover: "/imagens/pretamasculina2.png", preco: "R$ 69,90" },
        { id: 8, nome: "Camiseta Slim Fit", imagem: "/imagens/pretamasculina.png", imagemHover: "/imagens/pretamasculina2.png", preco: "R$ 89,90" },
        { id: 9, nome: "Camiseta Estilo", imagem: "/imagens/pretamasculina.png", imagemHover: "/imagens/pretamasculina2.png", preco: "R$ 59,90" }
    ];

    const filteredProducts = produtos.filter((produto) =>
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const redirecionarProduto = (id) => {
        navigate(`/produto/${id}`); // Certifique-se de usar crases e interpolação corretamente
    };

    const handleLogout = async () => {
        await signOut(auth);
        setMenuOpen(false);
    };

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                setUserName(user.displayName || user.email);
            } else {
                console.log("Usuário não autenticado.");
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="catalogo">
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

            {/* Ícone do Carrinho restaurado */}
            <div className="icon-container">
                <Link to="/cart" className="icon-carrinho">
                    <i className="fas fa-shopping-cart"></i>
                </Link>
            </div>

            {/* Barra superior */}
            <header className="catalogo-header">
                {/* Remova a logo e a barra de pesquisa aqui */}
            </header>

            {/* Grade de Produtos */}
            <div className="produto-container">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((produto) => (
                        <div key={produto.id} className="produto" onClick={() => redirecionarProduto(produto.id)}>
                            <img className="imagem-principal" src={produto.imagem} alt={produto.nome} />
                            <img className="imagem-hover" src={produto.imagemHover} alt={`${produto.nome} Hover`} />
                            <p className="nome-produto">{produto.nome}</p>
                            <p className="preco">{produto.preco}</p>
                            <p className="parcelamento">Ou 3x de { (parseFloat(produto.preco.replace("R$ ", "").replace(",", ".")).toFixed(2) / 3).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                    ))
                ) : (
                    <p>Nenhum produto encontrado.</p>
                )}
            </div>

            {/* Rodapé */}
            <Footer />
        </div>
    );
};

export default Catalogo;
