import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('sua_chave_publica_stripe');

export default stripePromise;