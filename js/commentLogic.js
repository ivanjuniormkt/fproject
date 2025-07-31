// === Variáveis e Elementos do Comentário ===
const form = document.getElementById('comentarioForm');
const lista = document.getElementById('listaComentarios');
const erroComentario = document.getElementById("erroComentario");

let FORM_URL;
let ENTRY_NOME;
let ENTRY_COMENTARIO;
let CSV_URL;

let carregandoComentarios = false;

// === Configuração Inicial ===
document.addEventListener('DOMContentLoaded', () => {
    if (window.commentConfig) {
        FORM_URL = window.commentConfig.FORM_URL;
        ENTRY_NOME = window.commentConfig.ENTRY_NOME;
        ENTRY_COMENTARIO = window.commentConfig.ENTRY_COMENTARIO;
        CSV_URL = window.commentConfig.CSV_URL;

        carregarComentarios();
    } else {
        console.error("Configuração de comentários ausente.");
        lista.innerHTML = "<p>Erro na configuração dos comentários.</p>";
    }
});

// === Filtros e Validações ===
const palavrasProibidasAnimes = [
    "fdp", "fila da puta", "pau no cu", "cuzão", "merdinha", "cu", "buceta",
    "lixo", "verme", "nojento", "nojenta", "inútil", "retardado", "retardada",
    "inferno", "maldito", "maldita", "desgraçado", "desgraçada", "energúmeno",
    "piranha", "sirigaita", "quenga", "arrombado", "arrombada",
    "psicopata", "terrorista", "assassino", "assassina", "ladrão", "ladra",
    "bandido", "bandida", "marginal", "marginais"
];

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
        erroComentario.textContent = "* Seu comentário contém palavras inadequadas.";
        form.comentario.classList.add("erro");
        return false;
    }

    return true;
}

function podeComentar() {
    const ultimoEnvio = localStorage.getItem("ultimoComentario");
    const agora = Date.now();
    if (ultimoEnvio && agora - ultimoEnvio < 10000) {
        erroComentario.textContent = "* Aguarde alguns segundos antes de comentar novamente.";
        return false;
    }
    localStorage.setItem("ultimoComentario", agora);
    return true;
}

// === Escapando HTML (segurança) ===
function escapeHtml(texto) {
    const div = document.createElement('div');
    div.innerText = texto;
    return div.innerHTML;
}

// === Envio do Formulário ===
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

    mostrarLoading();

    fetch(FORM_URL, {
        method: "POST",
        mode: "no-cors",
        body: data
    }).then(() => {
        form.reset();
        erroComentario.textContent = "";
        setTimeout(() => {
            carregarComentarios();
        }, 4000); // Aguardar 4 segundos antes de recarregar
    }).catch(error => {
        console.error('Erro ao enviar comentário:', error);
        erroComentario.textContent = "Erro ao enviar o comentário. Tente novamente.";
    });
});

// === Animação de Carregando ===
function mostrarLoading() {
    lista.innerHTML = "<p>⏳ Carregando comentários...</p>";
}

// === Parser CSV Robusto ===
function parseCSV(text) {
    const linhas = text.split("\n");
    const dados = [];

    for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i].trim();
        if (!linha) continue;

        const matches = linha.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
        if (!matches || matches.length < 3) continue;

        const [timestamp, nome, comentario] = matches.map(c => c.replace(/^"|"$/g, "").replace(/""/g, '"'));
        if (!nome || !comentario) continue;

        dados.push({ nome, comentario, data: timestamp });
    }

    return dados;
}

// === Carregar Comentários ===
function carregarComentarios() {
    if (carregandoComentarios) return;
    carregandoComentarios = true;

    mostrarLoading();

    fetch(CSV_URL + `?t=${Date.now()}`) // força nova leitura (sem cache)
        .then(response => response.text())
        .then(data => {
            const comentarios = parseCSV(data).reverse();
            lista.innerHTML = "";

            if (comentarios.length === 0) {
                lista.innerHTML = "<p>Nenhum comentário ainda.</p>";
                return;
            }

            for (const c of comentarios) {
                const el = document.createElement("div");
                el.className = "comentario";
                el.innerHTML = `
                    <img class="profile" src="img/assets/profile.webp" alt="profile">
                    <div style="width: 100%;">
                        <div class="comentario-meta">
                            <strong>${escapeHtml(c.nome)}</strong>
                            <div style="font-size: 12px; color: #898989;">${escapeHtml(c.data)}</div>
                        </div>
                        <div class="com">${escapeHtml(c.comentario)}</div>
                    </div>
                `;
                lista.appendChild(el);
            }
        })
        .catch(error => {
            console.error("Erro ao carregar comentários:", error);
            lista.innerHTML = "<p>Erro ao carregar comentários.</p>";
        })
        .finally(() => {
            carregandoComentarios = false;
        });
}
