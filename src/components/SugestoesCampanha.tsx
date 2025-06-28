const salvarCampanha = async (campanha: Sugestao) => {
    const produtosSelecionados = campanha.produtos.filter(p => p.selecionado)

    if (produtosSelecionados.length === 0) {
        alert('Selecione ao menos um produto para salvar a campanha.')
        return
    }

    const payload = {
        tipo: campanha.tipo,
        titulo: campanha.titulo,
        descricao: campanha.descricao,
        produtos: produtosSelecionados
    }

    try {
        const res = await fetch('/api/campanhas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        if (!res.ok) throw new Error('Erro na resposta da API')

        alert('✅ Campanha salva com sucesso!')
    } catch (err) {
        console.error('Erro ao salvar campanha:', err)
        alert('Erro ao salvar campanha. Veja o console para mais detalhes.')
    }
}
