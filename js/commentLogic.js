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
});

// === Lógica de Carregamento de Comentários ===
async function carregarComentarios() {
    if (!CSV_URL) {
        lista.innerHTML = "<p>Nenhum URL de comentários configurado.</p>";
        return;
    }

    lista.innerHTML = "Carregando comentários...";
    try {
        const res = await fetch(CSV_URL);
        const texto = await res.text();
        const linhas = texto.trim().split("\n");

        if (linhas.length < 2) {
            lista.innerHTML = "<p>Sem comentários ainda.</p>";
            return;
        }

        const cabecalho = linhas[0].split(",");
        const indiceTimestamp = cabecalho.findIndex(h => h.trim() === "Carimbo de data/hora");
        const indiceNome = cabecalho.findIndex(h => h.trim() === "Nome");
        const indiceComentario = cabecalho.findIndex(h => h.trim() === "Comentário");

        if (indiceTimestamp === -1 || indiceNome === -1 || indiceComentario === -1) {
            console.error("Erro: Uma ou mais colunas esperadas não foram encontradas no CSV.");
            lista.innerHTML = "<p>Erro ao carregar comentários.</p>";
            return;
        }

        const comentarios = linhas.slice(1).map(linha => {
            const colunas = linha.split(",");
            return {
                nome: escapeHtml(colunas[indiceNome]?.trim() || "Anônimo"),
                data: colunas[indiceTimestamp]?.trim(),
                comentario: escapeHtml(colunas[indiceComentario]?.trim() || "")
            };
        });

        comentarios.sort((a, b) => new Date(b.data) - new Date(a.data));

        const finalHtml = comentarios.map(c => `
            <div class="comentario">
                <img class="profile" src="img/assets/profile.webp" alt="profile">
                <div style="width: 100%;">
                    <div class="comentario-meta">
                        <strong>${c.nome}</strong>
                        <div style="font-size: 12px; color: #898989;">${c.data}</div>
                    </div>
                    <div class="com">${c.comentario}</div>
                </div>
            </div>
        `).join("");

        lista.innerHTML = finalHtml;

    } catch (error) {
        console.error("Erro ao carregar comentários:", error);
        lista.innerHTML = "<p>Erro ao carregar comentários.</p>";
    }
}
