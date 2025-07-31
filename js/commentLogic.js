// comentarios.js

// === Variáveis e Elementos do Comentário ===
const form = document.getElementById('comentarioForm');
const lista = document.getElementById('listaComentarios');
const erroComentario = document.getElementById("erroComentario");
const parentIdInput = document.getElementById('parentIdInput');

// ATENÇÃO: ESTES VALORES SERÃO DEFINIDOS PELO 'main.js' ATRAVÉS DE 'window.commentConfig'.
// NÃO DEFINA AS URLS E OS IDs DIRETAMENTE AQUI.
// ELES DEVEM VIR DO OBJETO 'window.commentConfig'.
let FORM_URL;
let ENTRY_NOME;
let ENTRY_COMENTARIO;
let ENTRY_PARENT_ID;
let CSV_URL;
let ENTRY_COMMENT_ID;

// Garante que as variáveis globais sejam atribuídas
document.addEventListener('DOMContentLoaded', () => {
    // É importante que esta parte só seja executada DEPOIS que main.js tenha definido window.commentConfig
    // A ordem dos scripts no HTML (data.js -> main.js -> comentarios.js) já ajuda nisso.
    if (window.commentConfig) {
        FORM_URL = window.commentConfig.FORM_URL;
        ENTRY_NOME = window.commentConfig.ENTRY_NOME;
        ENTRY_COMENTARIO = window.commentConfig.ENTRY_COMENTARIO;
        ENTRY_PARENT_ID = window.commentConfig.ENTRY_PARENT_ID;
        CSV_URL = window.commentConfig.CSV_URL;
        ENTRY_COMMENT_ID = window.commentConfig.ENTRY_COMMENT_ID;

        // Chama a função para carregar os comentários depois que as configurações foram carregadas
        // Isso substitui o `document.addEventListener('DOMContentLoaded', carregarComentarios);` no final.
        carregarComentarios();
    } else {
        console.error("window.commentConfig não foi definido. Comentários não serão carregados corretamente.");
        lista.innerHTML = "<p>Erro na configuração dos comentários. Por favor, tente novamente mais tarde.</p>";
    }
});

const palavrasProibidasAnimes = [
    // Ofensas gerais
    "fdp", "fila da puta", "pau no cu", "cuzão", "merdinha", "cu", "buceta",
    "lixo", "verme", "nojento", "nojenta", "inútil", "retardado", "retardada",
    "inferno", "maldito", "maldita", "desgraçado", "desgraçada", "energúmeno",

    // Ofensas com conotação sexual ou gênero
    "piranha", "sirigaita", "quenga", "arrombado", "arrombada",

    // Termos sérios ou criminosos (masculino e feminino)
    "psicopata", "terrorista",
    "assassino", "assassina",
    "ladrão", "ladra",
    "bandido", "bandida",
    "marginal", "marginais"
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
// === Lógica de Envio de Comentários (VERSÃO FINAL) ===
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = form.nome.value.trim();
    const comentario = form.comentario.value.trim();
    const parentId = parentIdInput.value;

    if (form.fakeEmail.value !== "") {
        return;
    }

    if (!validarCampos(nome, comentario)) return;
    if (!podeComentar()) return;

    const data = new FormData();
    data.append(ENTRY_NOME, nome);
    data.append(ENTRY_COMENTARIO, comentario);

    // Se é um comentário principal, enviamos o ID único para a coluna ID do Comentário Pai
    if (!parentId) {
        const novoIdPrincipal = "main_" + Date.now();
        data.append(ENTRY_PARENT_ID, novoIdPrincipal);
    } 
    // Se é uma resposta, enviamos o ID do pai para a coluna ID do Comentário Pai
    // e o ID único da resposta para a coluna ID do Comentário
    else {
        const novoIdResposta = "reply_" + Date.now();
        data.append(ENTRY_PARENT_ID, parentId);
        data.append(ENTRY_COMMENT_ID, novoIdResposta);
    }
    
    fetch(FORM_URL, {
        method: "POST",
        mode: "no-cors",
        body: data
    }).then(() => {
        form.reset();
        parentIdInput.value = "";
        erroComentario.textContent = "";
        form.comentario.classList.remove("erro");
        
        const cancelButton = document.querySelector('.cancel-reply-button');
        if (cancelButton) {
            cancelButton.remove();
        }
        
        carregarComentarios();
        
        const h2Comentario = document.querySelector('h2');
        if (h2Comentario) {
            h2Comentario.after(form);
        }
        document.querySelector('h2').textContent = `Deixe seu comentário`;
    }).catch(error => {
        console.error('Erro ao enviar comentário:', error);
        erroComentario.textContent = "Ocorreu um erro ao enviar seu comentário. Tente novamente.";
    });
});

// === Lógica de Carregamento de Comentários ===
// === Lógica de Carregamento de Comentários (CORRIGIDA) ===
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
        const comentariosMap = new Map();

        if (linhas.length < 2) {
            lista.innerHTML = "<p>Sem comentários ainda.</p>";
            return;
        }
        
        const cabecalho = linhas[0].split(",");
        const indiceTimestamp = cabecalho.findIndex(h => h.trim() === "Carimbo de data/hora");
        const indiceNome = cabecalho.findIndex(h => h.trim() === "Nome");
        const indiceParentId = cabecalho.findIndex(h => h.trim() === "ID do Comentário Pai");
        const indiceComentario = cabecalho.findIndex(h => h.trim() === "Comentário");
        const indiceCommentId = cabecalho.findIndex(h => h.trim() === "ID do Comentário");

        if (indiceTimestamp === -1 || indiceNome === -1 || indiceParentId === -1 || indiceComentario === -1 || indiceCommentId === -1) {
            console.error("Erro: Uma ou mais colunas esperadas não foram encontradas no CSV. Verifique os nomes dos cabeçalhos na planilha.");
            lista.innerHTML = "<p>Erro ao carregar comentários. Verifique a configuração da planilha.</p>";
            return;
        }

        linhas.slice(1).forEach(linha => {
            const colunas = linha.split(",");

            if (colunas.length <= Math.max(indiceTimestamp, indiceNome, indiceParentId, indiceComentario, indiceCommentId)) {
                console.warn("Linha com número insuficiente de colunas ignorada:", linha);
                return;
            }

            const timestampStr = colunas[indiceTimestamp].trim();
            const nome = escapeHtml(colunas[indiceNome].trim() || "Anônimo");
            const parentId = colunas[indiceParentId].trim() || ''; 
            const comentarioId = colunas[indiceCommentId]?.trim() || parentId;
            const comentarioTexto = escapeHtml(colunas[indiceComentario].trim() || "");

            if (!comentarioId) {
                console.warn("Comentário sem ID válido ignorado:", linha);
                return;
            }

            const comentarioObj = {
                id: comentarioId,
                nome: nome,
                data: timestampStr,
                comentario: comentarioTexto,
                parentId: colunas[indiceCommentId]?.trim() ? parentId : null,
                respostas: []
            };
            comentariosMap.set(comentarioId, comentarioObj);
        });

        const comentariosPrincipais = [];
        comentariosMap.forEach(comentario => {
            if (comentario.parentId && comentariosMap.has(comentario.parentId)) {
                comentariosMap.get(comentario.parentId).respostas.push(comentario);
            } else {
                comentariosPrincipais.push(comentario);
            }
        });

        comentariosPrincipais.sort((a, b) => new Date(b.data) - new Date(a.data));

        function renderizarComentario(comentario, isResposta = false) {
            let html = `<div class="comentario${isResposta ? ' resposta' : ''}" data-comment-id="${comentario.id}">
                            <img class="profile" src="img/assets/profile.webp" alt="profile" width="300">
                            <div style="width: 100%;">
                                <div class="comentario-meta">
                                    <strong>${comentario.nome}</strong><div style="font-size: 12px; color: #898989;">${comentario.data}</div>
                                    <div>
                                        <button class="reply-button" data-comment-id="${comentario.id}">Responder</button>
                                    </div>
                                </div>
                                <div class="com">${comentario.comentario}</div>
                                <div id="reply-form-${comentario.id}" class="reply-form-container" style="display:none;">
                                </div>
                            </div>
                        </div>`;
            comentario.respostas.sort((a, b) => new Date(b.data) - new Date(a.data)).forEach(resposta => {
                html += renderizarComentario(resposta, true);
            });
            return html;
        }

        let finalHtml = "";
        if (comentariosPrincipais.length > 0) {
            comentariosPrincipais.forEach(c => {
                finalHtml += renderizarComentario(c);
            });
        } else {
            finalHtml = "<p>Sem comentários ainda.</p>";
        }

        lista.innerHTML = finalHtml;
        document.querySelectorAll('.reply-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const commentIdToReply = e.target.dataset.commentId;
                const replyFormContainer = document.getElementById(`reply-form-${commentIdToReply}`);

                if (replyFormContainer.style.display === 'block') {
                    replyFormContainer.style.display = 'none';
                    replyFormContainer.innerHTML = '';
                    parentIdInput.value = '';
                    form.comentario.value = '';
                    const h2Comentario = document.querySelector('h2');
                    if (h2Comentario) {
                        h2Comentario.after(form);
                    }
                    document.querySelector('h2').textContent = `Deixe seu comentário`;
                    return;
                }

                document.querySelectorAll('.reply-form-container').forEach(container => {
                    container.style.display = 'none';
                    container.innerHTML = '';
                });

                replyFormContainer.style.display = 'block';

                replyFormContainer.appendChild(form);
                parentIdInput.value = commentIdToReply;
                form.comentario.focus();
                form.comentario.value = '';

                let nomeDoPai = "este comentário";
                for (const [id, obj] of comentariosMap.entries()) {
                    if (id === commentIdToReply) {
                        nomeDoPai = obj.nome;
                        break;
                    }
                }
                document.querySelector('h2').textContent = `Responder a "${nomeDoPai}"`;

                const cancelButton = document.createElement('button');
                cancelButton.textContent = 'Cancelar Resposta';
                cancelButton.type = 'button';
                cancelButton.className = 'cancel-reply-button';
                cancelButton.onclick = () => {
                    const h2Comentario = document.querySelector('h2');
                    if (h2Comentario) {
                        h2Comentario.after(form);
                    }
                    parentIdInput.value = '';
                    form.comentario.value = '';
                    replyFormContainer.style.display = 'none';
                    document.querySelector('h2').textContent = `Deixe seu comentário`;
                };
                replyFormContainer.appendChild(cancelButton);
            });
        });
    } catch (error) {
        console.error("Erro ao carregar comentários:", error);
        lista.innerHTML = "<p>Erro ao carregar comentários.</p>";
    }
}

// Chama a função para carregar os comentários quando a página é carregada
document.addEventListener('DOMContentLoaded', carregarComentarios);