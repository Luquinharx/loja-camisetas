// src/components/ProdutoCard.js
import React from "react";

const ProdutoCard = ({ produto }) => {
  return (
    <div className="produto-card">
      <img src={produto.imagemUrl} alt={produto.nome} />
      <h3>{produto.nome}</h3>
      <p>{produto.descricao}</p>
      <strong>R$ {produto.preco}</strong>
    </div>
  );
};

export default ProdutoCard;
