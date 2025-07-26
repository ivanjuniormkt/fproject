document.addEventListener('DOMContentLoaded', () => {
    const animeList = document.getElementById('anime-list');
    const buttons = document.querySelectorAll('.letter-filter button');

    // Função para criar os cards
    function renderAnimes(lista) {
        animeList.innerHTML = '';

        if (lista.length === 0) {
            animeList.innerHTML = '<p style="padding: 20px;">Nenhum anime encontrado.</p>';
            return;
        }

        lista.forEach(anime => {
            animeList.innerHTML += `
                <div class="anime-card">
                    <a href="anime.html?id=${anime.id}" class="anime-link">
                        <div class="anime-img-wrapper">
                            <img src="${anime.imagem}" alt="${anime.titulo}">
                            <div class="anime-title-overlay">
                                <h3>${anime.titulo}</h3>
                            </div>
                            <div class="anime-tags">
                                <span class="tag status ${anime.status.toLowerCase().replace(/\s/g, '-')}">${anime.status.toUpperCase()}</span>
                                <span class="tag resolucao">${anime.resolucao}</span>
                            </div>
                        </div>
                    </a>
                </div>
            `;
        });
    }

    // Função para filtrar por letra
    function filtrarPorLetra(letra) {
        buttons.forEach(btn => btn.classList.remove('active'));
        const btnAtivo = document.querySelector(`.letter-filter button[data-letter="${letra}"]`);
        if (btnAtivo) btnAtivo.classList.add('active');

        if (letra === 'all') {
            renderAnimes(animes);
        } else if (letra === '#') {
            const especiais = animes.filter(a => !/^[A-Za-z]/.test(a.titulo));
            renderAnimes(especiais);
        } else {
            const filtrados = animes.filter(a => a.titulo.trim().toUpperCase().startsWith(letra));
            renderAnimes(filtrados);
        }
    }

    // Adiciona o evento aos botões
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const letra = btn.getAttribute('data-letter');
            filtrarPorLetra(letra);
        });
    });

    // Mostra todos ao carregar
    renderAnimes(animes);
});
                    
