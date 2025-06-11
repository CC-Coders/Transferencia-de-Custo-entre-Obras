<h1 align="center">Nome Projeto</h1>
<br>

# 1. Sumário
- [2. Identificação de escopo](#2-identificação-de-escopo)
- [3. Levantamento de escopo](#3-levantamento-de-escopo)
- [4. Detalhamento do Projeto](#4-detalhamento-do-projeto)
  - [4.1 Problema](#41-problema)
  - [4.2 Objetivo do Projeto](#42-objetivo-do-projeto)
- [5. Produto](#5-produto)
  - [5.1 Funcionalidades](#51-funcionalidades)
  - [5.2 Funcionalidades não incluídas no projeto](#52-funcionalidades-não-incluídas-no-projeto)
  - [5.3 Integrações](#53-integrações)
  - [5.4 Validações e Controles](#54-validações-e-controles)
  - [5.5 Relatórios](#55-relatórios)
  - [5.6 Artefatos](#56-artefatos)
- [6. Fluxo do Processo](#6-fluxo-do-processo)
- [7. Premissas](#7-premissas)
- [8. Restrições](#8-restrições)
- [9. Recursos adicionais](#9-recursos-adicionais)


# 2. Identificação de escopo
 - Área da empresa: Controladoria
 - Gestor da área: Glaucio Moraes
 - Projeto/Desenvolvimento: Gabriel Persike
<br>

# 3. Levantamento de escopo
 - Autor do escopo: Gabriel Persike
 - Desenvolvedor responsável: Gabriel Persike
 - Usuário-chave: André
 - Responsável pelos testes: 
<br>

# 4. Detalhamento do Projeto
## 4.1 Problema
A <strong>Transferencia de Custo entre as Obras</strong>, ocorre <strong>hoje via e-mail</strong> e o lançamento no Sistema é agrupado por Valor Total <strong>sem a descrição real do Produto Transferido</strong>, esse processo gera um retrabalho em algumas áreas como a Controladoria que <strong>fazem o Input manual desse lançamento no Sistema</strong>, támbem gera uma <strong>falta de acompanhamento dessas transferencias</strong> de forma que a Gestão possa acompanhar
## 4.2 Objetivo do Projeto
Como esse Projeto, é esperado uma <strong>maior agilidade no Processo</strong>, garantido por integrações e automatizações realizadas no Fluxo. Também esperamos coletar <strong>mais dados dessas Transferencias</strong> para permitir apresentar via <strong>Dashboards e Painel de Transferencias</strong>. E também preparar o processo para futuramente amarrar as Entradas desses Produtos nas Obras (Compras, Contratos...) com a Transferencia, não permitindo transfencia de um Produto não mapeada no Estoque da Obra. E por fim a definição clara do Processo e suas constraints para que todos os envolvidos tenham ciencia do caminho do Processo.
<br><br>


# 5. Produto

## 5.1	Funcionalidades
  1. Fluxo de Processo
  1. Formulário do Processo
  1. Regra de Aprovações, garantindo inclusive que um usuário não precise aprovar duas solicitações simultaneamente
  1. Automatização da Etapa da Controladoria, gerando os Movimentos via integração
  1. Painel de Transferência
  1. Painel de Aprovação
  1. Permitir aprovação em Lote e agrupada de Solicitações entre Obras
  1. Consultas de Descrições dos Custos transferidos (Produtos e equipamentos cadastrados no SISMA)
  1. Janelas de Lançamento (Dia 20 para Lançamentos e Dia 30 para Aprovação) (Caso a Data Limite caia em Final de Semana, prorroga o prazo pra o final do Próximo dia Util)
   
 

## 5.2	Funcionalidades não incluídas no projeto
1. Processo de Notas de Trânsferencia<br>
1. Consulta de Serviços e Mão de Obra Disponíveis na Obra<br>

## 5.3 Integrações
 - Fluig x RM
   1. Gerar Movimento de Transferencia de Custo (Aumento na Obra Destino e Redução na Obra Origem)
   2. Consultar Produtos disponíveis para Transferencia
 - Fluig x SISMA
   1. Consultar dados dos Equipamentos por Obra
 - Fluig x Fluig
   1. Aprovação no Painel de Transferencia movimentar o Fluxo do Processo
    
## 5.4 Validações e Controles
TODO

## 5.5 Relatórios
TODO

## 5.6 Artefatos
Abaixo os Artefatos gerados pelo projeto
| Artefato             | Responsabilidade             |
| ---                  | ---                          |
| TODO                 | TODO                         |


# 6.	Fluxo do Processo
![image](https://github.com/user-attachments/assets/dc16f00b-69e9-4b67-80b3-73a24c14455e)
![image](https://github.com/user-attachments/assets/b6096b58-f9d9-451b-90d8-be6104c309ad)
<br>

# 7.	Premissas
TODO
<br>
# 8.	Restrições
TODO
<br>
# 9.	Recursos adicionais:
TODO
<br>
