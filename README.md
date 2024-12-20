# wiki2mkdocs
Efetua a transformação de um repositório Wiki mantido pelo Product Manager, Owner e Equipe de Desenvolvimento.

## Objetivo
No cenário de desenvolvimento ágil e de constante inovação tecnológica, a relação entre o código e documentação para o usuário e desenvolvedores — é frequentemente considerada um ponto crítico. Em uma análise simples, podemos adotar boas práticas de desenvolvimento e da documentação, sendo possível evitar essa defasagem, mantendo a documentação sempre alinhada com as alterações.

As aplicações e documentações, quando mantidas de acordo com padrões e processos adequados, não apresentam defasagem em seu conteúdo e de suas alterações.

Este processo visa buiscar as atualizações realizadas em diversos projetos e unifica-las em um Portifólio único institucional.

## Visão da Documentação Contínua e Acompanhamento Ágil¶
A documentação de software deve ser tratada de forma contínua e DaC (Documentation as Code) e não como uma atividade pontual após o desenvolvimento do código.

Ao longo do ciclo de vida de um projeto, a documentação (tanto técnica quanto voltada para o usuário) deve ser constantemente atualizada, paralelamente ao progresso do desenvolvimento da aplicação.

A documentação "viva" é atualizada com a mesma frequência do código, garantindo que os engenheiros, gestores de qualidade e até mesmo os usuários, tenham acesso a informações precisas, em tempo real.

Em nossa abordagem, trateremos de uma documentação contínua, que inclui:

- [x] Documentação de Código (Javadoc, Docstrings, JSDOC, PLDoc, RDoc,PHPDoc + phpDocumentor, GoDoc, Rustdoc);
- [x] Commit Conventional (Comentários explicativos);
- [x] Testes e cobertura de testes;
- [x] Documentação de APIs (OAS, Swagger ou ReDoc);
- [x] Geradores de Dependencia e Vulnerabilidades;
- [x] Preenchimento de Templates durante o processo de Pull-Request e documentação de releases;
- [x] Wiki apenas o manual de operação da Aplicação.

### Origem das Informações

#### Wiki
- [x] Planejamento do Projeto;
- [x] Documentação do usuário final orientada a processos;
- [x] Manual de Utilização do Produto

#### Documentação técnica para manutenção;
- [x] Pull Request/Code Review efetuará a geração de chagelogs e republicação do Portifólio;
- [x] Geração do Report Book;
- [x] Geração de Catálogo de APIs por grupo;
   - [x] Documentação de APIs (OAS, Swagger ou ReDoc);

## Funcionalidades
- Clonagem de repositórios wiki.
- Conversão de nomes de arquivos para letras minúsculas.
- Garantia de codificação em UTF-8 para todos os arquivos.
- Organização de imagens em um diretório específico (`docs/img`).
- Geração automática do arquivo `mkdocs.yml` com a estrutura de navegação da Wiki.

## Responsabilidades

```mermaid
sequenceDiagram
    participant PM as Product Manager
    participant SI as Partes Interessadas
    participant PO as Product Owner
    participant SM as Scrum Master
    participant TS as Time Scrum

    PM->>PO: Define a visão do produto e prioridades (Wiki)
    PO->>TS: Define os requisitos e as histórias de usuário para o Sprint (Épicos e PBIs)
    PO->>SI: Coleta feedback das partes interessadas
    SI->>PO: Fornece feedback sobre o produto
    PO->>SM: Discute as prioridades e o backlog
    SM->>TS: Facilita o Sprint e remove impedimentos
    TS->>SM: Informa sobre obstáculos ou dificuldades
    TS->>PO: Trabalha nas histórias de usuário durante o Sprint
    TS->>PO: Solicita esclarecimentos sobre requisitos (Épicos e PBIs)
    PO->>TS: Fornece esclarecimentos sobre histórias de usuário (Épicos e PBIs)
    TS->>PO: Entrega incrementos de produto após o Sprint (Documentação de Código, Geradores de Dependencia, Vulnerabilidades, Templates e Report Book)
    PO->>SI: Apresenta o incremento para as partes interessadas
    SI->>PO: Avalia o produto e fornece mais feedback
    PO->>PM: Reporta o progresso e mudanças no produto
    PM->>PO: Ajusta a visão do produto com base em feedback(Wiki)
```

# Procedimento de Instalação
Este processo esta em desenvolvimento o que acarreta em um processo muito manual e em breve estaremos automatizando.
## Instalação do Compilador GOLANG
As instruções oficiais de instalação do Go estão disponíveis [Site Oficial](http://www.golangbr.org/doc/instalacao).
### Mac OSX
O processo de instalação é bem simples. Primeiro, o que você precisa fazer é executar o comando abaixo pra instalar o homebrew (brew). O Brew depende do Xcode, então você deve se certificar de instalá-lo primeiro.

```xcode-select --install```

Depois, execute o comando a seguir para instalar o homebrew:

```/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"```

Agora você consegue instalar o Go:
```brew install go```

Siga todas as instruções recomendadas pelo seu gerenciador de pacotes. Nota cada grupo de instruções varia de sistema operacional para sistema operacional. Agora verifique a instalação:
```
$ go version
go version go1.23.2 darwin/arm64
```

### Windows
Faça download da versão que você deseja instalar, no [Site](https://go.dev/dl/),. Recomendo a instalação sempre a versão mais atual.

Abra o arquivo MSI e siga os passos da instalação. Por padrão o instalador adiciona o Go na pasta C:\Go.

O instalador adiciona o caminho C:\Go\bin na variável de ambiente "Path" e cria a variável de usuário "GOPATH" com o caminho C:\Users\%USER%\go.

## Instalação do Produto
Como estamos em fase de desenvolvimento, todo o processo por enquanto é manual, bastando você seguir os passos.

```
git clone https://github.dev/60pportunities/wiki2mkdocs
cd wiki2mkdocs
go env GOOS GOARCH (Lista a Arquitetura e o Sistema Operacional)
go tool dist list  (Lista as Arquiteturas e os Sistemas Operacionais que o go tem disponível)

Criação da Rotina em Mac OSX
Caso não haja a necessidade em criar um executável em uma arquitetura diferente efetue:\
go build .
Será gerado um : wiki-to-mkdocs

Caso haja a necessidade em um Sistema Mac OSX para Windows, execute:
GOOS=windows go build .
Será gerado um : wiki-to-mkdocs.exe
```
## Geração da Documentação
Dentro do repositório há um arquivo de `portifolio.json` onde teremos o portifólio de documentação dos sistemas.

```
[
  {
    "nome_produto": "01-Exemplo",
    "url_repositorio": "https://github.com/horaciovasconcellos/01-exemplo.wiki.git",
    "gerar_documentacao": "Y"
  },
  {
    "nome_produto": "02-Exemplo2",
    "url_repositorio": "https://github.com/horaciovasconcellos/02-exemplo.wiki.gitB",
    "gerar_documentacao": "N"
  }
]
```
## Modelo

![alt text](image.png)

## Branches
```mermaid
%% https://mermaid.js.org/syntax/gitgraph.html#gitgraph-specific-configuration-options
%% https://htmlcolorcodes.com/
%%{ init: {
        "logLevel": "debug",
        "theme": "dark",
        "gitGraph": {
            "mainBranchName": "main"
        },
        "themeVariables": {
            "git0": "#839192",
            "git1": "#C0392B ",
            "git2": "#2E86C1",
            "gitInv0": "#FFFFFF",
            "gitBranchLabel0": "#FFFFFF",
            "commitLabelColor": "#FFFFFF"
        }
    }
}%%
gitGraph
    commit id: "checkout"
    branch wip/nome_developer-nome_feat-num_wit
    checkout wip/nome_developer-nome_feat-num_wit
    checkout wip/nome_developer-nome_feat-num_wit
    commit id: "Developer Feature Toggle"
    commit id: "Developer Feature"
    checkout wip/nome_developer-nome_feat-num_wit
    checkout main
    checkout wip/nome_developer-nome_feat-num_wit
    commit id: "PR para Qualidade" type: HIGHLIGHT
    checkout main
    checkout wip/nome_developer-nome_feat-num_wit
    branch sprint
    branch documentation
    checkout sprint
    commit id: "Testes TDD, BDD e ATDD"
    checkout wip/nome_developer-nome_feat-num_wit
    checkout documentation
    commit id: "Unifica Portifólio"
    checkout main
    merge sprint id: "Libera para PR"
    merge documentation id: "Publica Documentacao"
```

## Portal de Contribuições
O portal ainda é uma ideia.. Mas segue o jogo..

O botão "+" no canto inferior direito explica como listar novos projetos e como criar o arquivo de metadados InnerSource que contém informações adicionais sobre o projeto.
Requisitos

- [x] Instale o nodejs.
- [x] npm install
- [x] Executar o portal do projeto em um servidor web local (npm start)

### Listando Projetos
Adicionar seu projeto a este portal é tão fácil quanto adicionar o inner-source tópico ao seu repositório. 

Para personalizar as informações sobre seu projeto que são exibidas no portal, você pode, opcionalmente, adicionar um innersource.json arquivo. 

Para ver todas as opções disponíveis, verifique a Listing Documentation.

### Limitações
O portal foca em projetos InnerSource localizados no GitHub. 

Projetos que usam outros sistemas de gerenciamento de código-fonte podem ser exibidos no portal usando APIs semelhantes ou adicionando-os manualmente ao arquivo repos.json.

### Atualização
Os metadados do repositório mostrados neste portal são lidos de um arquivo estático `repos.json`.

Em um ambiente produtivo, você provavelmente precisará executar seu próprio rastreador para preencher repos.json com os projetos do InnerSource que deseja mostrar no seu portal.

A figura abaixo mostra o relacionamento entre rastreador, portal e repositórios. 

Assumimos que os repositórios estão localizados em uma ou mais instâncias do GitHub e usam a API do GitHub para buscar metadados do repositório. 

Se estiver usando um sistema de gerenciamento de código-fonte diferente, você pode preencher a estrutura descrita abaixo com os dados disponíveis desse sistema.
```mermaid
flowchart LR
    A(Contribuição) -- Projetos ----> B@{ shape: docs, label: "Repositórios</br>Contribuição"}
    B <-- Rastreador</br>Innersource ----> C@{ shape: procs, label: "Actions Schedulle"}
    C <-- Projetos ----> D@{ shape: lin-cyl, label: "Repositório" }
    C <-- Projetos ----> FD@{ shape: lin-cyl, label: "Repositório" }
```
A pontuação de atividade do repositório é um valor numérico que representa a atividade  de um projeto InnerSource. 

Ela é derivada automaticamente de estatísticas de repositório como GitHub stars, watches e forks e pode ser enriquecida com KPIs de outras ferramentas ou avaliações manuais.

Além disso, ele considera parâmetros de atividade como última atualização e data de criação do repositório para dar um impulso a projetos jovens com muita tração. Projetos com diretrizes de contribuição, estatísticas de participação ativa e problemas (backlog público) também recebem uma classificação mais alta.

Tudo isso pode ser buscado e calculado automaticamente usando o conjunto de resultados da API de pesquisa do GitHub e da API de estatísticas do GitHub. 

Outros sistemas de controle de versão de código como Bitbucket, GitLab, Gerrit, Azure também podem ser integrados se uma API semelhante estiver disponível.

Acesso as [APIs GitHub](https://docs.github.com/en/rest/metrics/statistics?apiVersion=2022-11-28)

https://docs.github.com/en/rest/meta/meta?apiVersion=2022-11-28#get-all-api-versions
curl -u <username>:<oauth_token> https://api.github.com/search/repositories?q=org:<org>+topic:inner-source | jq '.items' > repos.json

