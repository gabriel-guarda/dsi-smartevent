import Redis from 'ioredis'

// Instância única de Redis com suporte a rediss:// (SSL)
const redis = new Redis(process.env.REDIS_URL!, {
    tls: process.env.REDIS_URL?.startsWith('rediss://') ? {} : undefined,
})

/**
 * Publica dados da movimentação no canal 'movimentacoes'
 * @param data - Objeto contendo os dados da movimentação
 */
export async function publishMovimentacao(data: any) {
    try {
        const payload = JSON.stringify(data)
        await redis.publish('movimentacoes', payload)
        console.log('📢 Publicado no Redis:', payload)
    } catch (error) {
        console.error('❌ Erro ao publicar no Redis:', error)
    }
}
