# Simux

## Introdução

O Simux é um software simulador de controle automático PID desenvolvido como parte de um projeto de Trabalho de Conclusão de Curso (TCC) em automação industrial no IFBA Salvador. Este projeto nasceu da necessidade de se utilizar um bom, simuladore, visto que os atuais usados são legados e difíceis de serem utilizados

Durante o desenvolvimento do TCC, buscou-se criar uma ferramenta que pudesse proporcionar uma boa simulação de controle, resultando no Simux. Este simulador oferece uma experiência intuitiva e poderosa para estudantes e profissionais interessados em explorar e compreender os princípios do controle automático utilizando o método PID.

Esperamos que o Simux seja uma ferramenta valiosa para a comunidade de automação industrial, auxiliando no aprendizado e na experimentação prática desses conceitos complexos.

## Requisitos para Rodar o Software

- Sistema Operacional: Windows 10 ou 11;
- Microsoft Edge instalado;

- <b>**Nota importante**</b>:
  
  O Edge já vem instalado no Windows 11 e no Windows 10. Nesse último caso, após a atualização de 15 de janeiro de 2020.
  
  Caso o Edge não esteja disponível, o programa não irá iniciar.
  

## Como Baixar

Para baixar o Simux, vá até a aba "Release" à direita da tela e selecione a versão mais recente.

## Quais os recursos que esse simulador fornece?

- Simulação em ação direita ou reversa;
  
- Ação proporcional;
  
- Ação integral;
  
- Ação derivativa;
  
- Ruído aleatório na VP;
  
- Bias escolhido pelo usuário;
  
- Capacidade de aumentar a velocidade de simulação;
  
- Capacidade de adiantar simulações futuras;
  
- Capacidade de pausar a simulação à vontade
  

## Requisitos para Executar em Desenvolvimento

Se você deseja executar o código-fonte localmente, você precisará:

- [Python 3](https://www.python.org/) (Versão 3.11 recomendada)
  
- Instalar os pacotes necessários usando o seguinte comando na pasta raiz do código:
  
  ```bash
  pip install -r requirements.txt