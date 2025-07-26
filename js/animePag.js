document.addEventListener('DOMContentLoaded', () => {
    // Esta é a função principal que encapsula todo o código.
    // Ela garante que o script só seja executado depois que todo o HTML da página for completamente carregado e analisado.
    // Isso é crucial para que o script possa acessar e manipular os elementos da página sem que eles ainda não existam.

    // Pega o parâmetro id da URL
    const params = new URLSearchParams(window.location.search);
    const animeId = parseInt(params.get('id'));
    const anime = animes.find(a => a.id === animeId);

    /*
     * Lógica de Carregamento e Exibição do Anime:
     * Este bloco verifica se um anime foi encontrado com o ID especificado.
     * Se não for encontrado, exibe uma mensagem de erro na página.
     * Caso contrário, preenche todos os detalhes do anime nos elementos HTML correspondentes.
     */
    if (!anime) {
        // Melhorar a mensagem de "Anime não encontrado" para não remover tudo
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.innerHTML = '<p style="text-align: center; padding: 50px; font-size: 1.5em;">Anime não encontrado.</p><p style="text-align: center;"><a href="index.html">Voltar para a Página Inicial</a></p>';
        } else {
            document.body.innerHTML = '<h1>Anime não encontrado</h1>'; // Fallback
        }
    } else {
        // Preenche dados básicos do anime
        document.getElementById('anime-titulo').textContent = anime.titulo;
        document.getElementById('anime-imagem').src = anime.imagem;
        document.getElementById('anime-imagem').alt = anime.titulo;
        document.getElementById('anime-lancamento').textContent = anime.lancamento || 'N/A';
        document.getElementById('anime-genero').textContent = anime.genero || 'N/A';
        document.getElementById('anime-episodios-total').textContent = anime.episodiosTotal || 'N/A';
        document.getElementById('anime-status-detail').textContent = anime.status || 'N/A';
        document.getElementById('anime-sinopse').textContent = anime.sinopse || 'Sinopse não disponível.';
        document.getElementById('anime-adicionado-em').textContent = 'Adicionado em: ' + (anime.adicionadoEm || 'N/A');
        document.getElementById('anime-estudio').textContent = anime.estudio || 'N/A';
        document.getElementById('anime-site-oficial').href = anime.siteOficial || '#';
        document.getElementById('anime-video').textContent = anime.video || 'N/A';
        document.getElementById('anime-audio').textContent = anime.audio || 'N/A';
        document.getElementById('anime-resolucao').textContent = anime.resolucao || 'N/A';
        document.getElementById('anime-script-original').textContent = anime.scriptOriginal || 'N/A';


        // Nome no topo navagador
        document.title = `${anime.titulo} - Absolute Fansub`;

        /*
         * Funcionalidade de Screenshots:
         * Esta seção gerencia a exibição de screenshots do anime.
         * A função 'showNextScreenshot' troca a imagem atual com um efeito de fade-out e fade-in.
         * 'setInterval' é usado para automatizar a troca das imagens a cada 9 segundos, criando um carrossel.
         */
        const screenshots = anime.screenshots; // do JSON
        let currentScreenshot = 0;
        const screenshotImg = document.getElementById('screenshot-image');

        function showNextScreenshot() {
            if (screenshots.length === 0) return;

            // Apaga a imagem atual (fade-out)
            screenshotImg.style.opacity = 0;

            // Espera o fade-out terminar antes de trocar a imagem e fazer o fade-in
            setTimeout(() => {
                screenshotImg.src = screenshots[currentScreenshot];
                currentScreenshot = (currentScreenshot + 1) % screenshots.length;

                // Aplica o fade-in
                screenshotImg.style.opacity = 1;
            }, 600); // espera 200ms antes de trocar (ajustável)
        }

        showNextScreenshot(); // inicializa
        setInterval(showNextScreenshot, 9000); // troca a cada 4s

        /*
         * Embed do Trailer:
         * Este bloco de código é responsável por incorporar o trailer do anime.
         * Ele verifica se uma URL de trailer está disponível e, se sim, cria um iframe dinamicamente
         * para exibir o vídeo. Caso contrário, mostra uma mensagem informando que o trailer não está disponível.
         */
        const trailerContainer = document.getElementById('trailer-container');
        if (anime.trailerUrl) {
            const iframe = document.createElement('iframe');
            iframe.width = "560"; // Valores padrão, ajuste com CSS
            iframe.height = "315"; // Valores padrão, ajuste com CSS
            iframe.src = anime.trailerUrl;
            iframe.title = `Trailer de ${anime.titulo}`;
            iframe.frameBorder = "0";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            iframe.allowFullscreen = true;
            iframe.loading = "lazy";
            trailerContainer.appendChild(iframe);
        } else {
            trailerContainer.innerHTML = '<p>Trailer não disponível.</p>';
        }

        /*
         * Listagem de Episódios para Download:
         * Esta seção itera sobre os episódios do anime e as plataformas de download configuradas.
         * Para cada episódio e plataforma disponível, ele gera um bloco HTML com o título do episódio
         * e botões/links para download, incluindo ícones e nomes das plataformas.
         */
        const episodiosLista = document.getElementById('episodios-lista');
        episodiosLista.innerHTML = ''; // Limpa a lista antes

        // Adicione novas chaves exemplo mefiafire não esqueça do icone svg
        const plataformas = [
            { chave: 'pixeldrain', nome: 'Pixeldrain', icone: '<svg style="height: 1.6em; width: 1.6em;" enable-background="new 0 0 283.46 283.46" version="1.1" viewBox="0 0 288 288" xmlns="http://www.w3.org/2000/svg" class="svelte-1x1207"><path d="m142 2.23c-77 0-139 62.5-139 140 0 77 62.5 139 139 139 77 0 139-62.5 139-139 1e-3 -77-62.5-140-139-140zm0 258c-65.7 0-119-53.2-119-119s53.2-119 119-119c65.7 0 119 53.2 119 119 0 65.7-53.2 119-119 119zm0-219c-55.1 0-99.8 44.7-99.8 99.8 0 55.1 44.7 99.8 99.8 99.8s99.8-44.7 99.8-99.8c0-55.1-44.7-99.8-99.8-99.8zm49.3 36c8.69 0 15.7 7.04 15.7 15.7 0 8.69-7.04 15.7-15.7 15.7s-15.7-7.04-15.7-15.7c0-8.69 7.04-15.7 15.7-15.7zm-49.3-20c8.69 0 15.7 7.04 15.7 15.7 0 8.69-7.04 15.7-15.7 15.7s-15.7-7.04-15.7-15.7c0-8.69 7.04-15.7 15.7-15.7zm-48.7 20c8.69 0 15.7 7.04 15.7 15.7 0 8.69-7.04 15.7-15.7 15.7s-15.7-7.04-15.7-15.7c-1e-3 -8.69 7.04-15.7 15.7-15.7zm-35 63.8c0-8.69 7.04-15.7 15.7-15.7s15.7 7.04 15.7 15.7c0 8.69-7.04 15.7-15.7 15.7-8.69 0-15.7-7.04-15.7-15.7zm35 65.6c-8.69 0-15.7-7.04-15.7-15.7s7.04-15.7 15.7-15.7 15.7 7.04 15.7 15.7-7.04 15.7-15.7 15.7zm48.7 20.7c-8.69 0-15.7-7.04-15.7-15.7 0-8.69 7.04-15.7 15.7-15.7 8.69 0 15.7 7.04 15.7 15.7 1e-3 8.68-7.04 15.7-15.7 15.7zm2e-3 -47c-21.2 0-38.5-17.2-38.5-38.5 0-21.2 17.2-38.5 38.5-38.5 21.2 0 38.5 17.2 38.5 38.5 0 21.2-17.2 38.5-38.5 38.5zm49.3 26.3c-8.69 0-15.7-7.04-15.7-15.7s7.04-15.7 15.7-15.7 15.7 7.04 15.7 15.7-7.04 15.7-15.7 15.7zm18.6-49.9c-8.69 0-15.7-7.04-15.7-15.7 0-8.69 7.04-15.7 15.7-15.7s15.7 7.04 15.7 15.7c0 8.69-7.04 15.7-15.7 15.7z"></path></svg>' },
        ];

        anime.episodios.forEach(ep => {
            const bloco = document.createElement('div');
            bloco.className = 'bloco-episodio';

            const cabecalho = document.createElement('div');
            cabecalho.className = 'cabecalho';

            const titulo = document.createElement('span');
            titulo.className = 'titulo-episodio';
            titulo.textContent = `${anime.titulo} - Episódio ${ep.numero}`;

            const iconeDownload = document.createElement('span');
            iconeDownload.className = 'icone-download';
            iconeDownload.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-328.46 309.23-499.23l42.16-43.38L450-444v-336h60v336l98.61-98.61 42.16 43.38L480-328.46ZM252.31-180Q222-180 201-201q-21-21-21-51.31v-108.46h60v108.46q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85h455.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-108.46h60v108.46Q780-222 759-201q-21 21-51.31 21H252.31Z"/></svg>';

            cabecalho.appendChild(titulo);
            cabecalho.appendChild(iconeDownload);

            const linhaDownloads = document.createElement('div');
            linhaDownloads.className = 'linha-downloads';

            const label = document.createElement('span');
            label.className = 'label-servidor';
            label.textContent = 'Servidor:';

            const botoes = document.createElement('div');
            botoes.className = 'botoes';

            plataformas.forEach(plataforma => {
                const link = ep.downloads[plataforma.chave];
                if (link) {
                    const a = document.createElement('a');
                    a.href = link;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.innerHTML = `
                        ${plataforma.icone}
                        <span>${plataforma.nome}</span>
                    `;
                    botoes.appendChild(a);
                }
            });

            linhaDownloads.appendChild(label);
            linhaDownloads.appendChild(botoes);
            bloco.appendChild(cabecalho);
            bloco.appendChild(linhaDownloads);
            episodiosLista.appendChild(bloco);
        });

        /*
         * Funcionalidade de Compartilhamento:
         * A função 'setupShareButton' cria o HTML do componente de compartilhamento (botão e popup).
         * Ela gerencia a abertura e fechamento do popup, atualiza o link de compartilhamento com
         * o título do anime e a URL da página, e permite copiar o link para a área de transferência.
         * Garante que o setup ocorra após o DOM estar pronto.
         */
        function setupShareButton() {
            console.log('Iniciando setup do botão de compartilhamento...'); // Debug

            // Cria todo o HTML do componente
            const shareHTML = `
                <div class="share-container">
                    <button id="share-button" class="share-button">
                        <span>Compartilhar</span> 
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF" style="
            width: 18px;
        "><path d="M290-370v-227.69q0-29.92 21.19-51.12Q332.39-670 362.31-670h342.15l-113-113 42.77-42.77L820-640 634.23-453.85 591.46-496l113-114H362.31q-5.39 0-8.85 3.46t-3.46 8.85V-370h-60Zm-77.69 230q-29.92 0-51.12-21.19Q140-182.39 140-212.31v-575.38h60v575.38q0 5.39 3.46 8.85t8.85 3.46h455.38q5.39 0 8.85-3.46t3.46-8.85V-370h60v157.69q0 29.92-21.19 51.12Q697.61-140 667.69-140H212.31Z"></path></svg>
                    </button>
                    <div id="share-popup" class="share-popup">
                        <div class="share-popup-content">
                            <span class="close-popup">&times;</span>
                            <strong>Compartilhe o projeto</strong>
                            <p>Anime: <span id="share-anime-title"></span></p>
                            <div class="share-link-container">
                                <input type="text" id="share-link" readonly>
                                <button id="copy-link">Copiar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Insere na div específica
            const shareContainer = document.querySelector('.share-button-container');

            if (!shareContainer) {
                console.error('ERRO: Div .share-button-container não encontrada!');
                return;
            }

            console.log('Div container encontrada, inserindo HTML...'); // Debug
            shareContainer.innerHTML = shareHTML;

            // Elementos após inserção
            const shareButton = document.getElementById('share-button');
            if (!shareButton) {
                console.error('ERRO: Botão share-button não foi criado!');
                return;
            }

            console.log('Botão criado com sucesso!'); // Debug

            // Restante do código de eventos (igual ao anterior)
            const sharePopup = document.getElementById('share-popup');
            const closePopup = document.querySelector('.close-popup');
            const copyButton = document.getElementById('copy-link');
            const shareLink = document.getElementById('share-link');
            const shareTitle = document.getElementById('share-anime-title');

            function updateShareData() {
                const animeTitle = document.getElementById('anime-titulo')?.textContent || 'este anime';
                const currentUrl = window.location.href;

                shareTitle.textContent = animeTitle;
                shareLink.value = `🔴 Baixe e assista todos os episódios de ${animeTitle}: 🔗${currentUrl}`;
            }

            shareButton.addEventListener('click', () => {
                updateShareData();
                sharePopup.style.display = 'block';
            });

            closePopup.addEventListener('click', () => {
                sharePopup.style.display = 'none';
            });

            copyButton.addEventListener('click', () => {
                shareLink.select();
                document.execCommand('copy');
                copyButton.textContent = 'Copiado!';
                setTimeout(() => {
                    copyButton.textContent = 'Copiar';
                }, 2000);
            });

            window.addEventListener('click', (event) => {
                if (event.target === sharePopup) {
                    sharePopup.style.display = 'none';
                }
            });
        }

        // Verifica se já está no DOMContentLoaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupShareButton);
        } else {
            // DOM já carregado
            setupShareButton();
        }

    }

    /*
     * Funcionalidade de Expandir/Ocultar Sinopse:
     * Este bloco gerencia a exibição da sinopse do anime.
     * O botão 'sinopse-toggle' alterna a classe 'expandido' no container da sinopse,
     * o que permite controlá-la via CSS (ex: altura máxima).
     * O texto do botão também muda entre "mais." e "ocultar" conforme o estado.
     */
    const sinopseContainer = document.querySelector('.sinopse-container');
    const sinopseEl = document.getElementById('anime-sinopse');
    const toggleBtn = document.getElementById('sinopse-toggle');

    let sinopseExpandida = false;

    toggleBtn.addEventListener('click', () => {
        sinopseExpandida = !sinopseExpandida;

        if (sinopseExpandida) {
            sinopseContainer.classList.add('expandido');
            toggleBtn.textContent = 'ocultar';
            toggleBtn.setAttribute('data-state', 'ocultar');
        } else {
            sinopseContainer.classList.remove('expandido');
            toggleBtn.textContent = 'mais.';
            toggleBtn.setAttribute('data-state', 'mais');
        }
    });

});