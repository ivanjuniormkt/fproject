// comentarios.js

// === Variáveis e Elementos do Comentário ===
const form = document.getElementById('comentarioForm');
const lista = document.getElementById('listaComentarios');
const erroComentario = document.getElementById("erroComentario");

// Variáveis que serão preenchidas por data.js
let FORM_URL;
let ENTRY_NOME;
let ENTRY_COMENTARIO;
let CSV_URL;

// Garante que as variáveis globais sejam atribuídas
document.addEventListener('DOMContentLoaded', () => {
    if (window.commentConfig) {
        FORM_URL = window.commentConfig.FORM_URL;
        ENTRY_NOME = window.commentConfig.ENTRY_NOME;
        ENTRY_COMENTARIO = window.commentConfig.ENTRY_COMENTARIO;
        CSV_URL = window.commentConfig.CSV_URL;

        carregarComentarios();
    } else {
        console.error("window.commentConfig não foi definido. Comentários não serão carregados corretamente.");
        lista.innerHTML = "<p>Erro na configuração dos comentários. Por favor, tente novamente mais tarde.</p>";
    }
});

const palavrasProibidasAnimes = [
    "fdp", "fila da puta", "pau no cu", "cuzão", "merdinha", "cu", "buceta",
    "lixo", "verme", "nojento", "nojenta", "inútil", "retardado", "retardada",
    "inferno", "maldito", "maldita", "desgraçado", "desgraçada", "energúmeno",
    "piranha", "sirigaita", "quenga", "arrombado", "arrombada",
    "psicopata", "terrorista", "assassino", "assassina", "ladrão", "ladra",
    "bandido", "bandida", "marginal", "marginais"
];

// === Funções de Validação e Utilidade ===
function normalizar(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function contemPalavrasOfensivas(texto) {
    const textoLimpo = normalizar(texto);
    return palavrasProibidasAnimes.some(palavra => textoLimpo.includes(palavra));
}

function validarCampos(nome, comentario) {
    const regexNome = /^[a-zA-ZÀ-ÿ0-9\s]{2,30}$/;
    const regexComentario = /^[^<>]{1,500}$/;

    form.comentario.classList.remove("erro");
    erroComentario.textContent = "";

    if (!regexNome.test(nome)) {
        erroComentario.textContent = "* Nome inválido. Use apenas letras e números.";
        return false;
    }

    if (!regexComentario.test(comentario)) {
        erroComentario.textContent = "* Comentário inválido. Evite símbolos como < ou >.";
        form.comentario.classList.add("erro");
        return false;
    }

    if (contemPalavrasOfensivas(comentario)) {
        erroComentario.textContent = "* Seu comentário contém palavras inadequadas. Por favor, seja respeitoso.";
        form.comentario.classList.add("erro");
        return false;
    }

    return true;
}

function podeComentar() {
    const ultimoEnvio = localStorage.getItem("ultimoComentario");
    const agora = Date.now();
    if (ultimoEnvio && agora - ultimoEnvio < 10) {
        erroComentario.textContent = "* Espere pelo menos 1 minuto antes de enviar outro comentário.";
        form.comentario.classList.add("erro");
        return false;
    }
    localStorage.setItem("ultimoComentario", agora);
    return true;
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.innerText = texto;
    return div.innerHTML;
}

// === Lógica de Envio de Comentários ===
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = form.nome.value.trim();
    const comentario = form.comentario.value.trim();

    if (form.fakeEmail.value !== "") return;

    if (!validarCampos(nome, comentario)) return;
    if (!podeComentar()) return;

    const data = new FormData();
    data.append(ENTRY_NOME, nome);
    data.append(ENTRY_COMENTARIO, comentario);

    fetch(FORM_URL, {
        method: "POST",
        mode: "no-cors",
        body: data
    }).then(() => {
        form.reset();
        erroComentario.textContent = "";
        form.comentario.classList.remove("erro");
        carregarComentarios();
    }).catch(error => {
        console.error('Erro ao enviar comentário:', error);
        erroComentario.textContent = "Ocorreu um erro ao enviar seu comentário. Tente novamente.";
    });

    setTimeout(() => {
        carregarComentarios();
    }, 1000); // espera 1 segundo antes de recarregar
});

// === Lógica de Carregamento de Comentários ===
function carregarComentarios() {
    fetch(CSV_URL)
        .then(response => response.text())
        .then(data => {
            const linhas = data.split("\n").slice(1); // ignora cabeçalho
            const comentarios = [];

            for (const linha of linhas) {
                if (!linha.trim()) continue; // ignora linha vazia

                // Extrai colunas, tratando vírgulas dentro de aspas
                const colunas = linha.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(c => c.replace(/^"|"$/g, ""));

                // Garante que temos pelo menos nome e comentário
                if (!colunas || colunas.length < 3) continue;

                const timestamp = colunas[0];
                const nome = colunas[1];
                const comentario = colunas[2];

                // ignora linhas vazias
                if (!nome || !comentario) continue;

                comentarios.push({ nome, comentario, timestamp });
            }

            // Exibe os comentários em ordem do mais recente para o mais antigo
            comentarios.reverse();

            const container = document.getElementById("listaComentarios");
            container.innerHTML = "";

            for (const c of comentarios) {
                const el = document.createElement("div");
                el.className = "comentario";
                el.innerHTML = `
                    <div class="avatar">
                        <img src="/img/avatar.webp" alt="Avatar">
                    </div>
                    <div class="conteudo">
                        <p><strong>${c.nome}</strong> <span class="data">${c.timestamp}</span></p>
                        <p>${c.comentario}</p>
                    </div>
                `;
                container.appendChild(el);
            }

            if (comentarios.length === 0) {
                container.innerHTML = "<p>Nenhum comentário ainda.</p>";
            }
        })
        .catch(error => {
            console.error("Erro ao carregar comentários:", error);
            document.getElementById("listaComentarios").innerHTML = "<p>Erro ao carregar comentários.</p>";
        });
}
