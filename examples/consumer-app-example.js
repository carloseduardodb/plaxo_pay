const Redis = require('ioredis');

// Configuração do KeyDB/Redis
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  // password: 'sua-senha-se-houver',
  db: 0,
});

// ID da sua aplicação (obtido ao cadastrar no Plaxo Pay)
const APPLICATION_ID = '550e8400-e29b-41d4-a716-446655440000';

// Canais que sua aplicação vai escutar
const PAYMENT_CHANNEL = `payments.${APPLICATION_ID}`;
const SUBSCRIPTION_CHANNEL = `subscriptions.${APPLICATION_ID}`;

console.log(`🚀 Listening to channels: ${PAYMENT_CHANNEL}, ${SUBSCRIPTION_CHANNEL}`);

// Escutar eventos de pagamento
redis.subscribe(PAYMENT_CHANNEL, (err, count) => {
  if (err) {
    console.error('❌ Failed to subscribe to payment channel:', err);
  } else {
    console.log(`✅ Subscribed to ${count} payment channel(s)`);
  }
});

// Escutar eventos de assinatura
redis.subscribe(SUBSCRIPTION_CHANNEL, (err, count) => {
  if (err) {
    console.error('❌ Failed to subscribe to subscription channel:', err);
  } else {
    console.log(`✅ Subscribed to ${count} subscription channel(s)`);
  }
});

// Processar mensagens recebidas
redis.on('message', (channel, message) => {
  try {
    const event = JSON.parse(message);
    console.log(`📨 Received event from ${channel}:`, event);

    // Processar eventos de pagamento
    if (channel === PAYMENT_CHANNEL) {
      handlePaymentEvent(event);
    }
    
    // Processar eventos de assinatura
    if (channel === SUBSCRIPTION_CHANNEL) {
      handleSubscriptionEvent(event);
    }
  } catch (error) {
    console.error('❌ Error processing message:', error);
  }
});

// Handlers para eventos de pagamento
function handlePaymentEvent(event) {
  switch (event.type) {
    case 'payment.created':
      console.log(`💳 Payment created: ${event.paymentId} for customer ${event.customerId}`);
      // Aqui você pode atualizar o status no seu sistema
      break;
      
    case 'payment.approved':
      console.log(`✅ Payment approved: ${event.paymentId} for customer ${event.customerId}`);
      // Liberar acesso/produto para o cliente
      liberarAcessoParaCliente(event.customerId, event.paymentId);
      break;
      
    case 'payment.rejected':
      console.log(`❌ Payment rejected: ${event.paymentId} for customer ${event.customerId}`);
      // Notificar cliente sobre falha no pagamento
      notificarFalhaPagamento(event.customerId, event.paymentId);
      break;
  }
}

// Handlers para eventos de assinatura
function handleSubscriptionEvent(event) {
  switch (event.type) {
    case 'subscription.created':
      console.log(`📅 Subscription created: ${event.subscriptionId} for customer ${event.customerId}`);
      // Ativar plano para o cliente
      ativarPlanoParaCliente(event.customerId, event.subscriptionId);
      break;
      
    case 'subscription.cancelled':
      console.log(`🚫 Subscription cancelled: ${event.subscriptionId} for customer ${event.customerId}`);
      // Desativar plano do cliente
      desativarPlanoDoCliente(event.customerId, event.subscriptionId);
      break;
      
    case 'subscription.renewal.due':
      console.log(`⏰ Subscription renewal due: ${event.subscriptionId} for customer ${event.customerId}`);
      // Notificar cliente sobre renovação
      notificarRenovacao(event.customerId, event.subscriptionId);
      break;
  }
}

// Funções de exemplo para integração com seu sistema
function liberarAcessoParaCliente(customerId, paymentId) {
  console.log(`🔓 Liberando acesso para cliente ${customerId} (pagamento: ${paymentId})`);
  // Implementar sua lógica aqui
  // Ex: atualizar banco de dados, enviar email, etc.
}

function notificarFalhaPagamento(customerId, paymentId) {
  console.log(`📧 Notificando falha no pagamento para cliente ${customerId}`);
  // Implementar notificação
}

function ativarPlanoParaCliente(customerId, subscriptionId) {
  console.log(`🎯 Ativando plano para cliente ${customerId} (assinatura: ${subscriptionId})`);
  // Implementar ativação do plano
}

function desativarPlanoDoCliente(customerId, subscriptionId) {
  console.log(`⏹️ Desativando plano do cliente ${customerId}`);
  // Implementar desativação do plano
}

function notificarRenovacao(customerId, subscriptionId) {
  console.log(`🔔 Notificando renovação para cliente ${customerId}`);
  // Implementar notificação de renovação
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('👋 Disconnecting from KeyDB...');
  redis.disconnect();
  process.exit(0);
});

// Error handling
redis.on('error', (error) => {
  console.error('❌ KeyDB connection error:', error);
});

redis.on('connect', () => {
  console.log('🔗 Connected to KeyDB');
});

redis.on('ready', () => {
  console.log('✅ KeyDB connection ready');
});