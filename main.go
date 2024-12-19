package main

import (
        "encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

type Produto struct {
	NomeProduto        string `json:"nome_produto"`
	URLRepositorio     string `json:"url_repositorio"`
	GerarDocumentacao  string `json:"gerar_documentacao"`
}


// Função para remover acentuação e caracteres especiais
func sanitizeName(name string) string {
	ext := filepath.Ext(name)                 // Obtém a extensão, incluindo o ponto (ex: .md)
	baseName := strings.TrimSuffix(name, ext) // Remove a extensão do nome do arquivo
	re := regexp.MustCompile("[^a-zA-Z0-9]+")
	sanitizedBaseName := re.ReplaceAllString(strings.ToLower(baseName), "-")
	sanitizedExt := strings.ToLower(ext)
	return sanitizedBaseName + sanitizedExt
}

// Função para garantir que o diretório existe ou cria se necessário
func createDir(dir string) error {
	_, err := os.Stat(dir)
	if os.IsNotExist(err) {
		return os.MkdirAll(dir, os.ModePerm)
	}
	return nil
}

// Função para remover diretórios
func removeDir(dir string) error {
	err := os.RemoveAll(dir)
	if err != nil {
		return fmt.Errorf("erro ao remover diretório %s: %v", dir, err)
	}
	return nil
}

// Função para clonar repositório
func cloneRepo(url string, repoDir string) error {
	cmd := exec.Command("git", "clone", url, repoDir)
	return cmd.Run()
}

// Função para criar estrutura MkDocs
func createMkDocsStructure(repoName string, verbose bool) error {
	// Criação do diretório MkDocs
	mkdocsDir := fmt.Sprintf("%s-mkdocs", repoName)
	if err := removeDir(mkdocsDir); err != nil {
		return err
	}

	if err := createDir(mkdocsDir); err != nil {
		return err
	}

	if verbose {
		fmt.Printf("Criando estrutura MkDocs em %s...\n", mkdocsDir)
	}
	// Criar a estrutura mkdocs com a inicialização padrão
	cmd := exec.Command("mkdocs", "new", mkdocsDir, "-q")
	if err := cmd.Run(); err != nil {
		return err
	}

	// Criar o diretório img dentro de docs
	imgDir := filepath.Join(mkdocsDir, "docs", "img")
	if err := createDir(imgDir); err != nil {
		return err
	}

	if verbose {
		fmt.Printf("Diretório 'img' criado em %s/docs...\n", mkdocsDir)
	}

	indexMdPath := filepath.Join(mkdocsDir, "docs", "index.md")
	if err := os.Remove(indexMdPath); err != nil {
		return fmt.Errorf("erro ao remover o arquivo index.md: %v", err)
	}

	if verbose {
		fmt.Printf("Arquivo 'index.md' removido de %s/docs...\n", mkdocsDir)
	}

	return nil
}

// Função para ajustar as referências das imagens nos arquivos markdown
func adjustImagePaths(mdFilePath, imgDir string) error {
	// Leitura do conteúdo do arquivo markdown
	content, err := ioutil.ReadFile(mdFilePath)
	if err != nil {
		return fmt.Errorf("erro ao ler arquivo %s: %v", mdFilePath, err)
	}

	// Substitui as referências de imagem para o diretório correto
	re := regexp.MustCompile(`\!\[.*?\]\((.*?)\)`)
	contentStr := string(content)
	contentStr = re.ReplaceAllStringFunc(contentStr, func(s string) string {
		// Extrair o caminho da imagem
		parts := re.FindStringSubmatch(s)
		if len(parts) > 1 {
			imgPath := parts[1]
			// Sanitizar nome da imagem
			imgName := sanitizeName(filepath.Base(imgPath))
			return fmt.Sprintf("![%s](%s/%s)", imgName, imgDir, imgName)
		}
		return s
	})

	// Salva o arquivo atualizado
	return ioutil.WriteFile(mdFilePath, []byte(contentStr), 0644)
}

// Função para copiar arquivos de markdown e imagens
func copyFiles(srcDir, destDir, imgDir string, verbose bool) error {
	err := filepath.Walk(srcDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Se for um arquivo .md
		if strings.HasSuffix(info.Name(), ".md") {
			destPath := filepath.Join(destDir, "docs", sanitizeName(info.Name())) // Mantém a extensão no nome
			if err := copyFile(path, destPath); err != nil {
				return err
			}
			// Ajustar imagem
			if err := adjustImagePaths(destPath, imgDir); err != nil {
				return err
			}
			if verbose {
				fmt.Printf("Arquivo markdown copiado: %s\n", destPath)
			}
		}

		// Se for uma imagem
		if isImageFile(info.Name()) {
			destPath := filepath.Join(destDir, "docs", imgDir, sanitizeName(info.Name())) // Mantém a extensão no nome
			if err := copyFile(path, destPath); err != nil {
				return err
			}
			if verbose {
				fmt.Printf("Imagem copiada: %s\n", destPath)
			}
		}

		return nil
	})

	return err
}

// Função para verificar se o arquivo é uma imagem
func isImageFile(filename string) bool {
	ext := filepath.Ext(filename)
	switch ext {
	case ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff":
		return true
	}
	return false
}

// Função para copiar um arquivo
func copyFile(src, dest string) error {
	input, err := ioutil.ReadFile(src)
	if err != nil {
		return err
	}
	err = ioutil.WriteFile(dest, input, 0644)
	if err != nil {
		return err
	}
	return nil
}

// Função para gerar o arquivo mkdocs.yml
func generateMkDocsYml(repoName, srcDir string, verbose bool) error {
	mkdocsYmlPath := fmt.Sprintf("%s-mkdocs/mkdocs.yml", repoName)
	// Abre o arquivo mkdocs.yml em modo write (criação ou sobrescrição)
	file, err := os.Create(mkdocsYmlPath)
	if err != nil {
		return fmt.Errorf("erro ao criar mkdocs.yml: %v", err)
	}
	defer file.Close()

	// Escreve as informações principais do projeto no arquivo mkdocs.yml
	_, err = file.WriteString(fmt.Sprintf(`# Project information
site_name: Migracao
site_description: Documentação %s
site_author: %s

docs_dir: docs
copyright:  >
   Copyright &copy; %d Documentação
   <a href="#__consent">Change cookie settings</a>
extra_css:
  - https://unpkg.com/mermaid@8.5.1/dist/mermaid.css
validation:
  omitted_files: ignore
  absolute_links: ignore
  unrecognized_links: ignore
  anchors: ignore
theme:
  highlightjs: true
  features:
    - announce.dismiss
    - commit
    - content.code.annotation
    - content.code.copy
    - search.highlight
    - search.share
    - search.suggest
    - version
    - content.footnote.tooltips
  name: material
  palette:
   # Palette toggle for light mode
   - media: "(prefers-color-scheme: light)"
     scheme: default
     primary: deep purple  # light blue
     accent: purple        # indigo
     toggle:
       icon: material/weather-night
       name: Azul da cor do mar
   # Palette toggle for dark mode
   - media: "(prefers-color-scheme: dark)"
     scheme: default 
     primary: red        # indigo
     accent: deep purple # light blue
     toggle:
       icon: material/weather-sunny
       name: Rock and Roll 
plugins:
  - tags:
      enabled: true
  - search
  - autorefs
  - include-markdown:
      preserve_includer_indent: false
      dedent: false
      trailing_newlines: true
      comments: true
      rewrite_relative_urls: true
      heading_offset: 0
      start: <!--start-->
      end: <!--end-->
  - table-reader
  - glightbox:
      touchNavigation: true
      loop: true
      height: auto
      width: 80%
  - swagger-ui-tag:
       background: White
  - render_swagger
  - mike
  - mermaid2:
      version: 10.0.2
  - minify:
      minify_html: true
markdown_extensions:
  - markdown_include.include:
      base_path: .
  - admonition
  - attr_list
  - pymdownx.extra:
      pymdownx.superfences:
        custom_fences:
          - name: mermaid
            class: mermaid
            format: !!python/name:pymdownx.superfences.fence_code_format
  - pymdownx.emoji:
      emoji_index: !!python/name:material.extensions.emoji.twemoji
      emoji_generator: !!python/name:material.extensions.emoji.to_svg
  - md_in_html
  - admonition
  - abbr
  - def_list
  - footnotes
  - meta
  - md_in_html
  - toc:
      permalink: true
  - pymdownx.arithmatex:
      generic: true
  - pymdownx.betterem:
      smart_enable: all
  - pymdownx.caret
  - pymdownx.critic
  - pymdownx.details
  - pymdownx.highlight
  - pymdownx.inlinehilite
  - pymdownx.keys
  - pymdownx.magiclink:
      repo_url_shorthand: true
      user: squidfunk
      repo: mkdocs-material
  - pymdownx.mark
  - pymdownx.smartsymbols
  - pymdownx.tabbed:
      alternate_style: true
      combine_header_slug: true
      slugify: !!python/object/apply:pymdownx.slugs.slugify
        kwds:
          case: lower
  - pymdownx.tabbed
  - pymdownx.tasklist:
      custom_checkbox: true
  - pymdownx.tilde
extra:
  consent:
    title: Consentimento
    description: >- 
       Utilizamos cookies para reconhecer as suas repetidas visitas e preferências, bem como
       para medir a eficácia da nossa documentação e se os usuários
       encontre o que eles estão procurando. Com o seu consentimento, você está nos ajudando a
       melhorar nossa documentação.
  version:
    provider: mike
    default: latest
#not_in_nav: |
`, repoName, repoName, time.Now().Year()))

	if err != nil {
		return fmt.Errorf("erro ao escrever as configurações iniciais no mkdocs.yml: %v", err)
	}
	// Escreve o campo 'nav:' no arquivo
	_, err = file.WriteString("\nnav:\n")
	if err != nil {
		return fmt.Errorf("erro ao escrever nav: no mkdocs.yml: %v", err)
	}

	// Caminha pelo diretório srcDir e encontra todos os arquivos .md
	err = filepath.Walk(srcDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Se for um arquivo .md
		if !info.IsDir() && strings.HasSuffix(info.Name(), ".md") {
			ext := filepath.Ext(info.Name()) // Obtém a extensão, incluindo o ponto (ex: .md)
			baseName := strings.TrimSuffix(info.Name(), ext)
			fileName := baseName // Sanitiza o nome do arquivo
			sanitizedExt := strings.ToLower(info.Name())
			// Formata o nome do arquivo com a primeira letra maiúscula
			formattedFileName := strings.Title(fileName)

			// Se verbose estiver ativo, imprime o arquivo encontrado
			if verbose {
				fmt.Printf("Arquivo encontrado: %s\n", formattedFileName)
			}

			// Escreve o arquivo no formato requerido no arquivo mkdocs.yml
			_, err := file.WriteString(fmt.Sprintf("  - '%s' : '%s'\n", formattedFileName, sanitizedExt))
			if err != nil {
				return fmt.Errorf("erro ao escrever arquivo '%s' no mkdocs.yml: %v", info.Name(), err)
			}
		}
		return nil
	})

	if err != nil {
		return fmt.Errorf("erro ao caminhar pelos diretórios: %v", err)
	}

	return nil
}

func wiki2mkdocs( repoUrl string, verbose bool) {
	// Definir os parâmetros da linha de comando
	//repoUrl := flag.String("url", "", "URL do repositório da Wiki (deve terminar com .wiki.git)")
	//verbose := flag.Bool("verbose", false, "Ativar modo verbose")
	//flag.Parse()

	// Validar os parâmetros obrigatórios
	if repoUrl == "" {
		log.Fatal("A URL do repositório é obrigatória.")
	}

	// Obter o nome sanitizado do repositório
	repoName := sanitizeName(filepath.Base(repoUrl))
	if err := removeDir(repoName); err != nil {
		log.Fatalf("Erro ao remover diretório existente: %v", err)
	}

	// Clonar o repositório
	if err := cloneRepo(repoUrl, repoName); err != nil {
		log.Fatalf("Erro ao clonar repositório: %v", err)
	}

	// Criar a estrutura MkDocs
	if err := createMkDocsStructure(repoName, verbose); err != nil {
		log.Fatalf("Erro ao criar estrutura MkDocs: %v", err)
	}

	// Copiar arquivos .md e imagens
	srcDir := repoName // Diretório do repositório clonado
	imgDir := "img"
	if err := copyFiles(srcDir, repoName+"-mkdocs", imgDir, verbose); err != nil {
		log.Fatalf("Erro ao copiar arquivos: %v", err)
	}

	// Gerar o arquivo mkdocs.yml
	if err := generateMkDocsYml(repoName, srcDir, verbose); err != nil {
		log.Fatalf("Erro ao gerar mkdocs.yml: %v", err)
	}

	log.Println("Processo concluído com sucesso!")
}


func main() {
	caminhoArquivo := "portifolio.json"
	data, err := ioutil.ReadFile(caminhoArquivo)
	if err != nil {
		log.Fatalf("Erro ao ler o arquivo: %v", err)
	}
	
	// Slice de produtos para armazenar os dados deserializados
	var produtos []Produto
	
	// Desserializar o JSON para a variável produtos
	err = json.Unmarshal(data, &produtos)
	if err != nil {
		log.Fatalf("Erro ao deserializar o JSON: %v", err)
	}
	
	// Exibir os dados dos produtos
	fmt.Println("Informações dos Produtos:")
	for _, produto := range produtos {
		fmt.Printf("Nome do Produto: %s\n", produto.NomeProduto)
		fmt.Printf("URL do Repositório: %s\n", produto.URLRepositorio)
		if produto.GerarDocumentacao == "Y" {
                wiki2mkdocs( produto.URLRepositorio, true)
			fmt.Println("A documentação será gerada.")
		} else {
			fmt.Println("A documentação já é definitiva.")
		}
		fmt.Println("---------------")
	}
}

