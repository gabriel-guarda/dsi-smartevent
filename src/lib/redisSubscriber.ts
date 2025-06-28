lib / redisSubscriber.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

redis.subscribe('movimentacoes', (err, count) => {
    if (err) {
        console.error('❌ Erro ao se inscrever no canal de movimentações:', err)
        return
    }
    console.log(`📡 Inscrito no canal "movimentacoes" com ${count} assinaturas.`)
})

redis.on('message', (channel, message) => {
    if (channel === 'movimentacoes') {
        const movimentacao = JSON.parse(message)
        console.log('📥 Nova movimentação recebida via Redis:', movimentacao)

        // Aqui você pode:
        // - Armazenar em cache
        // - Alimentar o dashboard
        // - Gravar em outra coleção
        // - Disparar webhook ou e-mail
    }
})
