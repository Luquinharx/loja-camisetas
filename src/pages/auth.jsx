import React, { useState } from 'react';
import { auth, firestore, doc, getDoc, setDoc, sendPasswordResetEmail, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../firebase';
import '../styles/auth.css';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/footer';

const backgroundImages = [
  "/imagens/fundo3.png",
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    cpf: '',
    nome: '',
    sobrenome: '',
    cidade: '',
    estado: '',
    logradouro: '',
    telefone: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (isResetting) {
        await sendPasswordResetEmail(auth, formData.email);
        setSuccessMessage('Email de recuperação de senha enviado! Verifique sua caixa de entrada.');
      } else if (isLogin) {
        // Lógica de Login
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Buscar o documento do usuário na coleção "users" usando o UID
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('Login realizado com sucesso!');
          navigate('/'); // Redirecionar para a página inicial após o login
        } else {
          console.error("Documento do usuário não encontrado na coleção 'users'");
          setError("Usuário não encontrado. Por favor, cadastre-se.");
        }
      } else {
        // Lógica de Cadastro
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Criar o documento do usuário na coleção "users" usando o UID
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, {
          uid: user.uid,
          email: formData.email,
          cpf: formData.cpf,
          nome: formData.nome,
          sobrenome: formData.sobrenome,
          cidade: formData.cidade,
          estado: formData.estado,
          logradouro: formData.logradouro,
          telefone: formData.telefone,
        });

        console.log('Cadastro realizado com sucesso!');
        navigate('/'); // Redirecionar para a página inicial após o cadastro
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: `url(${backgroundImages[0]})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <button className="home-button" onClick={() => navigate('/')}>
                <i className="fas fa-arrow-left"></i> Voltar
              </button>
              <h2 className="auth-title">{isLogin ? 'Entrar' : 'Criar conta'}</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Seu email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {!isLogin && (
                <>
                  <div className="form-group">
                    <input
                      type="text"
                      name="cpf"
                      placeholder="Seu CPF"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      name="nome"
                      placeholder="Seu nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      name="sobrenome"
                      placeholder="Seu sobrenome"
                      value={formData.sobrenome}
                      onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      name="cidade"
                      placeholder="Sua cidade"
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      name="estado"
                      placeholder="Seu estado"
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      name="logradouro"
                      placeholder="Seu logradouro"
                      value={formData.logradouro}
                      onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      name="telefone"
                      placeholder="Seu telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}

              {isLogin && !isResetting && (
                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              )}
              {isLogin && !isResetting && (
                <div className="forgot-password">
                  <button type="button" onClick={() => setIsResetting(true)}>
                    Esqueceu sua senha?
                  </button>
                </div>
              )}

              <button type="submit" className="submit-button">
                {isResetting ? 'Enviar email de recuperação' : isLogin ? 'Entrar' : 'Criar conta'}
              </button>

              <div className="toggle-auth">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setSuccessMessage('');
                    setIsResetting(false);
                  }}
                >
                  {isLogin ? 'Não tem uma conta? Cadastre-se agora' : 'Já tem uma conta? Entre agora'}
                </button>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="success-message">
                  {successMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      <Footer style={{ height: '50px', padding: '10px' }} />
    </div>
  );
};

export default Auth;
