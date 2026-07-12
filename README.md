# 🌿 NortistaIA Chat - Guia de Configuração PWA e Ícones

Este projeto foi totalmente transformado em um **Progressive Web App (PWA)** de alta performance! Agora você pode instalar a **NortistaIA Chat** diretamente no seu celular (Android/iOS) ou computador (Windows/macOS), rodar offline (com cache inteligente de recursos estáticos) e desfrutar de uma experiência nativa fluida.

---

## 📂 Onde estão localizados os arquivos do PWA?

Todas as configurações e ativos do PWA ficam localizados na pasta `/public`, que é servida de forma estática diretamente na raiz do projeto:

*   **`public/manifest.json`**: O manifesto da aplicação que define o nome, cores de fundo, modo de exibição e os ícones do aplicativo para instalação.
*   **`public/sw.js`**: O *Service Worker* encarregado de fazer o cache inteligente dos arquivos estáticos para permitir o funcionamento offline e garantir o cumprimento dos critérios de instalação PWA.
*   **`public/favicon.ico`**: O ícone clássico exibido nas abas dos navegadores.
*   **`public/icon-192.png`**: Ícone de alta resolução (192x192 pixels) usado por celulares na tela inicial e notificações.
*   **`public/icon-512.png`**: Ícone de altíssima resolução (512x512 pixels) usado em telas de carregamento (*splash screens*) e lojas de aplicativos.

---

## 🎨 Como alterar os ícones do aplicativo?

Se você quiser personalizar a identidade visual do aplicativo e usar seus próprios ícones, siga estes passos simples:

### Passo 1: Preparar os novos arquivos de imagem
Você precisará de três versões do seu logotipo nos seguintes formatos e dimensões:
1.  **Favorito (Favicon)**: Uma imagem com nome `favicon.ico` (tamanhos comuns: 16x16, 32x32 ou 48x48 pixels).
2.  **Ícone Médio (192px)**: Uma imagem PNG quadrada de **192x192 pixels** chamada `icon-192.png`.
3.  **Ícone Grande (512px)**: Uma imagem PNG quadrada de **512x512 pixels** chamada `icon-512.png`.

> 💡 **Dica de Design:** Certifique-se de que os ícones tenham uma margem de segurança ao redor da arte principal (cerca de 10% a 15%) porque alguns sistemas operacionais cortam os ícones em formato circular ou quadrado arredondado (*maskable icons*).

### Passo 2: Substituir os arquivos existentes
Basta arrastar seus novos ícones para dentro da pasta `/public` no editor de código do AI Studio ou através de um cliente Git, substituindo os arquivos atuais:
*   Substitua o arquivo `/public/favicon.ico`
*   Substitua o arquivo `/public/icon-192.png`
*   Substitua o arquivo `/public/icon-512.png`

### Passo 3: Ajustar o arquivo `manifest.json` (Opcional)
Se você mantiver os mesmos nomes de arquivo (`icon-192.png` e `icon-512.png`), não precisará alterar nada no manifesto! 

Mas se decidir usar outros nomes ou formatos (por exemplo, `.jpg` ou `.webp`), abra o arquivo `/public/manifest.json` e ajuste os campos dentro de `"icons"`:

```json
"icons": [
  {
    "src": "seu-novo-favicon.ico",
    "sizes": "64x64 32x32",
    "type": "image/x-icon"
  },
  {
    "src": "seu-novo-icone-192.png",
    "type": "image/png",
    "sizes": "192x192",
    "purpose": "any maskable"
  },
  {
    "src": "seu-novo-icone-512.png",
    "type": "image/png",
    "sizes": "512x512",
    "purpose": "any maskable"
  }
]
```

### Passo 4: Atualizar as referências no `index.html` (Opcional)
Caso tenha alterado os nomes do favicon ou do ícone da Apple, atualize estas linhas dentro da tag `<head>` no arquivo `/index.html`:

```html
<link rel="apple-touch-icon" href="/seu-novo-icone-192.png" />
<link rel="icon" type="image/x-icon" href="/seu-novo-favicon.ico" />
```

---

## ⚡ Como testar e instalar o PWA?

1.  **No Computador (Chrome/Edge/Brave):** 
    Ao abrir a aplicação na URL de visualização, você verá um ícone de "computador com seta para baixo" ou um botão **"Instalar"** na barra de endereços (lado direito). Clique nele para instalar como aplicativo de desktop!
2.  **No Celular Android (Chrome):**
    Abra a URL do aplicativo no navegador. Um banner inferior perguntando *"Adicionar NortistaIA à tela inicial"* deverá aparecer. Se não aparecer, clique nos três pontinhos no canto superior direito e selecione **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.
3.  **No Celular iOS (Safari):**
    Abra a URL do aplicativo no Safari, clique no botão de **"Compartilhar"** (ícone de quadrado com uma seta para cima) e deslize até encontrar a opção **"Adicionar à Tela Inicial"**.

---

## 🍃 Personalização Regional da NortistaIA
As cores de exibição do PWA (`theme_color` e `background_color`) estão configuradas com o clássico **Verde Esmeralda da Floresta Amazônica** (`#022c22` e `#064e3b`). Se desejar mudar as cores do cabeçalho do app nativo, basta alterar os campos `"theme_color"` e `"background_color"` no arquivo `manifest.json`, bem como a meta tag correspondente no `index.html`:

```html
<meta name="theme-color" content="#NOVA_COR_HEX" />
```
