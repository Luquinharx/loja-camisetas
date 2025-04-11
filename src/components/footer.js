import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <img src="/imagens/logo.png" alt="Logo da Empresa" className="logo" />
        </div>

        <div className="footer-info">
          <div className="quem-somos">
            <h2>Quem Somos</h2>
            <p>Texto explicativo sobre quem somos. Nossa empresa busca oferecer produtos de alta qualidade e serviços excepcionais.</p>
          </div>

          <div className="contato">
            <h2>Contato</h2>
            <div className="social-icons">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://wa.me/yourphonenumber" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp"></i>
              </a>
              <a href="mailto:example@email.com" target="_blank" rel="noopener noreferrer">
                <i className="far fa-envelope"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="info-final">
          <p>CNPJ: 00.000.000/0000-00</p>
          <p>Endereço: Rua Exemplo, 123 - Cidade, Estado</p>
          <p>&copy; 2025 Minha Loja. Todos os direitos reservados.</p>
        </div>

        <button className="support-btn">Suporte</button>
      </div>
    </footer>
  );
};

export default Footer;
