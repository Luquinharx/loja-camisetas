import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import '../styles/profile.css';
import Footer from '../components/footer'; // Importa o componente Footer

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (err) {
        setError('Erro ao carregar dados do usuário');
      }
      setLoading(false);
    };

    loadUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCepBlur = async () => {
    if (userData.cep.replace(/\D/g, '').length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${userData.cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setUserData(prev => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          }));
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(firestore, 'users', user.uid), userData);
      alert('Dados atualizados com sucesso!');
    } catch (err) {
      setError('Erro ao atualizar dados');
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Carregando...</p>
    </div>
  );

  return (
    <div className="profile-container full-height">
      <nav className="navigation-bar">
        <button onClick={() => navigate('/')} className="nav-button">
          <i className="fas fa-home"></i>
        </button>
        <button onClick={() => navigate('/cart')} className="nav-button">
          <i className="fas fa-shopping-cart"></i>
        </button>
      </nav>

      <div className="profile-content">
        <h1>Meu Perfil</h1>
        
        <div className="profile-card">
          <div className="readonly-info">
            <h2>Informações não editáveis</h2>
            <p>
              <strong>Email:</strong> {auth.currentUser?.email}
            </p>
            <p>
              <strong>CPF:</strong> {userData.cpf || 'Não cadastrado'}
            </p>
            <small className="help-text">
              Para alterar estas informações, entre em contato com o suporte.
            </small>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <h2>Informações Editáveis</h2>
            
            <div className="form-group">
              <label>Nome Completo</label>
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="form-group">
              <label>Telefone</label>
              <input
                type="tel"
                name="phone"
                value={userData.phone}
                onChange={handleInputChange}
                placeholder="Seu telefone"
              />
            </div>

            <h3>Endereço</h3>
            
            <div className="form-group">
              <label>CEP</label>
              <input
                type="text"
                name="cep"
                value={userData.cep}
                onChange={handleInputChange}
                onBlur={handleCepBlur}
                placeholder="00000-000"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Rua</label>
                <input
                  type="text"
                  name="street"
                  value={userData.street}
                  onChange={handleInputChange}
                  placeholder="Sua rua"
                />
              </div>

              <div className="form-group">
                <label>Número</label>
                <input
                  type="text"
                  name="number"
                  value={userData.number}
                  onChange={handleInputChange}
                  placeholder="Número"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Complemento</label>
              <input
                type="text"
                name="complement"
                value={userData.complement}
                onChange={handleInputChange}
                placeholder="Apartamento, bloco, etc."
              />
            </div>

            <div className="form-group">
              <label>Bairro</label>
              <input
                type="text"
                name="neighborhood"
                value={userData.neighborhood}
                onChange={handleInputChange}
                placeholder="Seu bairro"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cidade</label>
                <input
                  type="text"
                  name="city"
                  value={userData.city}
                  onChange={handleInputChange}
                  placeholder="Sua cidade"
                />
              </div>

              <div className="form-group">
                <label>Estado</label>
                <input
                  type="text"
                  name="state"
                  value={userData.state}
                  onChange={handleInputChange}
                  placeholder="UF"
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="save-button">
              Salvar Alterações
            </button>
          </form>
        </div>
      </div>

      {/* Adicione o footer aqui */}
      <Footer />
    </div>
  );
};

export default Profile;
