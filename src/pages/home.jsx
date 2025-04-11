import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, firestore } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/home.css';
import Footer from "../components/footer";

const Home = () => {
    const [bannerImage, setBannerImage] = useState("");
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState("");
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [currentImageIndexes, setCurrentImageIndexes] = useState([0, 0, 0]); // Estado para controlar as imagens

    const productImages = [
        ["/imagens/pretafeminina.png", "/imagens/pretafeminina2.png"],
        ["/imagens/pretamasculina.png", "/imagens/pretamasculina2.png"],
        ["/imagens/brancamasculina.png", "/imagens/brancamasculina2.png"],
    ];

    useEffect(() => {
        const updateBanner = () => {
            const isMobile = window.innerWidth <= 768;
            setBannerImage(
                `${process.env.PUBLIC_URL}/imagens/${isMobile ? "banner-mobile.png" : "banner-web.png"}`
            );
        };

        updateBanner();
        window.addEventListener("resize", updateBanner);
        return () => {
            window.removeEventListener("resize", updateBanner);
        };
    }, []);

    const fetchUserName = async (userId) => {
        try {
            const userDocRef = doc(firestore, "users", userId);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                setUserName(userDocSnap.data().nome);
            } else {
                console.log("Nenhum documento encontrado para este usuário.");
            }
        } catch (error) {
            console.error("Erro ao buscar nome do usuário:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                fetchUserName(user.uid);
            } else {
                console.log("Usuário não autenticado.");
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/auth");
    };

    // Função para avançar para a próxima imagem
    const nextImage = (productIndex) => {
        setCurrentImageIndexes(prevIndexes => {
            const newIndexes = [...prevIndexes];
            newIndexes[productIndex] = (newIndexes[productIndex] + 1) % productImages[productIndex].length;
            return newIndexes;
        });
    };

    // Função para voltar para a imagem anterior
    const prevImage = (productIndex) => {
        setCurrentImageIndexes(prevIndexes => {
            const newIndexes = [...prevIndexes];
            newIndexes[productIndex] = (newIndexes[productIndex] - 1 + productImages[productIndex].length) % productImages[productIndex].length;
            return newIndexes;
        });
    };

    return (
        <div className="home">
            <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                <i className="fas fa-bars"></i>
            </div>

            {menuOpen && (
                <div className="menu-overlay active" onClick={() => setMenuOpen(false)}>
                    <div className="menu-box" onClick={(e) => e.stopPropagation()}>
                        <span className="close-menu" onClick={() => setMenuOpen(false)}>
                            &times;
                        </span>
                        <h2>Menu</h2>
                        {user && (
                            <>
                                <div className="menu-item user-info">
                                    <i className="fas fa-user"></i>
                                    <span className="username">{userName || "Logado"}</span>
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
<div className="icon-container" style={{ zIndex: 1003 }}>
    <Link to="/cart" className="icon-carrinho">
        <i className="fas fa-shopping-cart"></i>
    </Link>
</div>

            {/* Seção Hero */}
            <section
                className="home-hero"
                style={{
                    backgroundImage: `url(${bannerImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    width: "100vw",
                    minHeight: "80vh",
                }}
            >
                <div className="hero-overlay">
                    <Link to="/catalogo" className="btn">
                        <strong>Catálogo</strong>
                    </Link>
                </div>
            </section>

            {/* Carrossel de Promoções */}
            <div className="promocoes-carousel">
                <div className="carousel-wrapper">
                    <div className="slide">Promoção 1</div>
                    <div className="slide">Promoção 2</div>
                    <div className="slide">Promoção 3</div>
                </div>
            </div>

            {/* Nova Seção de Favoritos */}
            <section className="home-favoritos">
                <div className="container-favoritos">
                    <div className="title-favoritos">
                        <h2 className="title-favoritos-highlight">Favoritos</h2>
                    </div>
                    <div className="produtos-favoritos">
                        {productImages.map((images, index) => (
                            <div key={index} className="produto-favorito">
                                <div className="imagem-produto">
                                    <img src={images[currentImageIndexes[index]]} alt="Tech T-Shirt" />
                                    <div className="tags">
                                        <div className="tag-desconto">15% OFF</div>
                                        <div className="tag-best-seller">BEST SELLER</div>
                                    </div>
                                    <div className="image-buttons">
                                        <button className="prev-button" onClick={() => prevImage(index)}>&#8249;</button>
                                        <button className="next-button" onClick={() => nextImage(index)}>&#8250;</button>
                                    </div>
                                    <Link to={`/produto/${index + 1}`} className="ver-produto-link-full">
                                        Ver Produto
                                    </Link>
                                </div>
                                <div className="info-produto">
                                    <h3>Tech T-Shirt®</h3>
                                    <div className="precos">
                                        <span className="preco-antigo">R$ 104,90</span>
                                        <span className="preco-atual">R$ 89,90</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>



    );
};

export default Home;
