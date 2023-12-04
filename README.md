# Simux

## Introdução

O Simux é um software simulador de controle automático PID desenvolvido como parte de um projeto de Trabalho de Conclusão de Curso (TCC) em automação industrial no IFBA Salvador. Este projeto nasceu da necessidade de se utilizar um bom, simuladore, visto que os atuais usados são legados e difíceis de serem utilizados

Durante o desenvolvimento do TCC, buscou-se criar uma ferramenta que pudesse proporcionar uma boa simulação de controle, resultando no Simux. Este simulador oferece uma experiência intuitiva e poderosa para estudantes e profissionais interessados em explorar e compreender os princípios do controle automático utilizando o método PID.

Esperamos que o Simux seja uma ferramenta valiosa para a comunidade de automação industrial, auxiliando no aprendizado e na experimentação prática desses conceitos complexos.

## Requisitos para Rodar o Software

- Sistema Operacional: Windows 10 ou 11;
- Microsoft Edge (o novo, baseado no Chromium) instalado;
- A porta 3345 deve estar disponível

- <b>**Nota importante**</b>:
  
  O novo Edge já vem instalado no Windows 11 e no Windows 10. Nesse último caso, após a atualização de 15 de janeiro de 2020.
  
  Caso o Edge não esteja disponível, o programa não irá iniciar.
  

## Como Baixar

Para baxar o Simux, vá até a aba "Release" à direita da tela e selecione a versão mais recente.

## Quais os recursos que esse simulador fornece?

- Simulação em ação direita ou reversa;
  
- Ação proporcional;
  
- Ação integral;
  
- Ação derivativa;
  
- Ruído aleatório na VP;
  
- Bias escolhido pelo usuário;
  
- Capacidade de aumentar a velocidade de simulação;
  
- Capacidade de adiantar simulações futuras;
  
- Capacidade de pausar a simulação à vontade

- Capacidade de gerar uma foto do gráfico

## Nota sobre falsos-positivos

Esse software é compilado em C utilizando o Nuitka. Por causa disso, alguns antivíruis podem identificar fragmentos de código Nuitka como malwares. Trata-se de falsos positivos, o programa é seguro e seu código-fonte é totalmente auditável e recompilável.

## Requisitos para Executar em Desenvolvimento

Esse trecho é reservado para quem queira modificar o código, se isso não te interessa, ignore esse tópico e o abaixo

Se você deseja executar o código-fonte localmente, você precisará:

- [Python 3](https://www.python.org/) (Versão 3.11 recomendada)
  
- Instalar os pacotes necessários usando o seguinte comando na pasta raiz do código:
  
  ```bash
  pip install -r requirements.txt

Depois, execute o arquivo "run.cmd" na mesma pasta.
  
## Requisitos para compilar

Em resumo, é necessário o ambiente de desenvolvimento citado acima e de um compilador C, seja o Visual Studio ou o GCC. Todos as releases disponíveis foram geradas com o Visual Studio 2022.

E, por fim, execute o comando "build.cmd" na pasta raíz.

Verifique a repositório oficial do Nuitka para mais informações.

## Dúvidas

Caso tenha algum questionamento, entre em contato através do Github.