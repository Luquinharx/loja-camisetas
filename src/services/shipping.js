import axios from 'axios';

// Configurações padrão para camisetas
const DEFAULT_PRODUCT_SIZE = {
  width: 30, // cm
  height: 5,  // cm
  length: 20, // cm
  weight: 0.3 // kg
};

// Token de teste - substitua pelo seu token real em produção
const TEST_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMzJlNjBmNTcyNjJkZTZiODdhMmFlOGM3NDhkN2Y1YzlhZDgwYWUxZDg3ZGVmMjI1NjMzZWFiODgxN2Y1ZGRjZDQ4MjY1YWNkZWJiMmQ3M2QiLCJpYXQiOjE3NDMxNDQ2ODQuMDYwMzExLCJuYmYiOjE3NDMxNDQ2ODQuMDYwMzEyLCJleHAiOjE3NzQ2ODA2ODQuMDUwMjY3LCJzdWIiOiI5ZTg5YmVjZS02ZWE5LTQ4ODctODQ2MS1kMDkyZmFhN2RlMTciLCJzY29wZXMiOlsiY2FydC1yZWFkIiwiY2FydC13cml0ZSIsImNvbXBhbmllcy1yZWFkIiwiY29tcGFuaWVzLXdyaXRlIiwiY291cG9ucy1yZWFkIiwiY291cG9ucy13cml0ZSIsIm5vdGlmaWNhdGlvbnMtcmVhZCIsIm9yZGVycy1yZWFkIiwicHJvZHVjdHMtcmVhZCIsInByb2R1Y3RzLWRlc3Ryb3kiLCJwcm9kdWN0cy13cml0ZSIsInB1cmNoYXNlcy1yZWFkIiwic2hpcHBpbmctY2FsY3VsYXRlIiwic2hpcHBpbmctY2FuY2VsIiwic2hpcHBpbmctY2hlY2tvdXQiLCJzaGlwcGluZy1jb21wYW5pZXMiLCJzaGlwcGluZy1nZW5lcmF0ZSIsInNoaXBwaW5nLXByZXZpZXciLCJzaGlwcGluZy1wcmludCIsInNoaXBwaW5nLXNoYXJlIiwic2hpcHBpbmctdHJhY2tpbmciLCJlY29tbWVyY2Utc2hpcHBpbmciLCJ0cmFuc2FjdGlvbnMtcmVhZCIsInVzZXJzLXJlYWQiLCJ1c2Vycy13cml0ZSIsIndlYmhvb2tzLXJlYWQiLCJ3ZWJob29rcy13cml0ZSIsIndlYmhvb2tzLWRlbGV0ZSIsInRkZWFsZXItd2ViaG9vayJdfQ.NpXyVHVQvq2Dt84a2HDOM1EZaA-N7i4mM_c-gokAhQer53DZ-_MkTZg3SVtmCAsglZXIyCd3XA4oeKhDMk2vAN-88QYAzKQksMPEWzNW5oBAvzVshTaoY7uGoL6sFvofpAL40HOzFim2CkOUoGsMdPdpbZeqqTL-06_9o4-cOzy03okgwYN_ODSt5NLZLMJfhJGKCdzHR7mTPjVJwZzsi7i0ZXn9GGa5X_jzqRtnOtHs_eYaP_GU0R_tQQv1X5i7M7AtOPHwaExvMNCE7u7d4-z_b7UZq9vhCXQCASgDm7IwQJYmDMBcIvC05ojRZYQFnGY6Dbd5KQZrCkecKHIZeQrD1pLGu9oOXrcPElnrqhvedgds3Ogdft4Cv335h_2a17Uqs458FgZC2M6Ej9c6PZA8XMBUPkc0wPSab3I9altY5w9_l0J--U6ApSADGAxI-vgu58v2Rkry17a2yrQM2giqb6ThmRv-YirPGdiQe4e9nJ0FWo_Sbo_SXnHG6J3vomHBo35p0qV8NpmgSaK1eaZV14Z-2fN7ucm4tmqcXK9B5tBYhpCZZsOQ4zVtTkqo2wUD78321UZgFDm9Eb-huoQn_IJyXsZqNwZKcNkxi8vKjaZcVu4msBz31Y2tmI9ptEfID_QoS5M9lXNEiVnzJYko4vPGJv0ttva5OwFxlVQ'; // Substitua com seu token

const api = axios.create({
  baseURL: '/api', // Caminho relativo
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TEST_TOKEN}`
  }
});

/**
 * Calcula as opções de frete para um determinado CEP.
 * 
 * @param {string} cep - CEP de destino sem caracteres especiais.
 * @param {number} quantity - Quantidade de itens.
 * @returns {Promise} - Promessa que resolve com as opções de frete.
 */
export const calculateShipping = async (cep, quantity = 1) => {
  try {
    const payload = {
      from: {
        postal_code: "38402152" // CEP de origem (Seu CEP)
      },
      to: {
        postal_code: cep.replace(/\D/g, '')
      },
      products: [{
        ...DEFAULT_PRODUCT_SIZE,
        quantity
      }],
      services: "1,2,3,4,17" // Códigos dos serviços (Correios, Jadlog, Loggi)
    };

    console.log('Payload:', payload); // Verifique o payload

    const response = await api.post('/api/v2/me/shipment/calculate', payload);
    
    return response.data.map(option => ({
      id: option.id,
      name: option.name,
      price: option.price,
      company: option.company.name,
      delivery_time: option.delivery_time,
      custom_delivery_time: option.custom_delivery_time
    }));
  } catch (error) {
    console.error('Erro ao calcular frete:', error.response.data); // Verifique a resposta do servidor
    throw new Error('Erro ao calcular frete. Por favor, tente novamente.');
  }
};
