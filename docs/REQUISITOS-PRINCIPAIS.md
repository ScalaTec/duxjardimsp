# Requisitos Principais

## 1. Fidelidade ao Figma

A aplicacao deve funcionar igual ao prototipo aprovado no Figma. O Figma e criterio de aceite para layout, navegacao, estados ativos, ampliacoes, comportamento touch e identidade visual.

## 2. Operacao offline

Sem internet, devem continuar funcionando normalmente: Inicio, Localizacao, Ficha Tecnica, Fachada, Lazer, Plantas, imagens, ampliacoes, navegacao, logos e textos.

## 3. Maquete Virtual sempre pronta quando possivel

URL atual: https://dux.allustudio.com/

Apos a Home estar pronta, o sistema deve verificar conectividade sem bloquear a interface. Se houver internet, deve preparar a Maquete em segundo plano.

Ao tocar em Maquete:
- se ja estiver carregada, exibir imediatamente;
- se ainda estiver carregando, mostrar um loader visual DUX;
- se estiver offline, mostrar uma mensagem amigavel;
- se houver falha, mostrar mensagem DUX com Tentar novamente e Voltar a apresentacao.

## 4. Falhas nunca podem travar o totem

A Maquete e um modulo externo e deve ser isolada do restante da aplicacao. Falhas de conexao, DNS, timeout, certificado, HTTP, renderer ou indisponibilidade do site nunca podem:
- travar a aplicacao;
- fechar o executavel;
- congelar a interface;
- mostrar erro tecnico do Chromium;
- mostrar pagina do navegador;
- mostrar tela branca indefinidamente;
- impedir o usuario de voltar para a apresentacao.

## 5. Fallback visual

Mensagem sugerida:

MAQUETE VIRTUAL INDISPONIVEL

Nao foi possivel carregar a maquete neste momento.
Verifique a conexao com a internet e tente novamente.

TENTAR NOVAMENTE
VOLTAR A APRESENTACAO

## 6. Timeout e reconexao

O carregamento remoto deve possuir timeout. Em caso de falha, registrar o erro tecnicamente, mostrar fallback visual e manter o restante da apresentacao utilizavel.

Se a internet retornar, o sistema deve atualizar o estado de conexao e permitir nova tentativa sem reiniciar o aplicativo.

## 7. Performance

Hardware minimo oficial: Intel Core i5 de 6a geracao.

A preparacao antecipada da Maquete nao pode comprometer resposta ao toque, navegacao, memoria ou estabilidade do Electron. A homologacao deve ser feita no equipamento real.

## 8. Criterios de aceite da Maquete

Online: clicar Maquete, abrir sem erro, navegar e voltar.
Offline: clicar Maquete, mostrar mensagem controlada e voltar normalmente.
Internet cai durante o uso: a aplicacao nao trava e o usuario consegue voltar.
Servidor fora do ar: falha controlada, mensagem DUX, tentar novamente ou voltar.
Internet retorna: nova tentativa carrega a Maquete sem reiniciar o app.

## 9. Ordem de prioridade

1. Fidelidade ao Figma
2. Estabilidade
3. Disponibilidade offline
4. Disponibilidade da Maquete
5. Fluidez
6. Efeitos visuais