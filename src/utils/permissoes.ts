export function temPermissao(
    permissoes: any,
    modulo: string,
    acao: 'visualizar' | 'incluir' | 'alterar' | 'excluir'
): boolean {
    return !!permissoes?.[modulo]?.[acao]
}
