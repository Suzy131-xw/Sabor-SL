// ============================================================
// AVALIAÇÕES DO SABOR SL
// Este arquivo controla as notas e os comentários dos clientes.
// Cada estabelecimento possui uma lista separada no localStorage.
// Atenção: localStorage salva os dados somente neste navegador.
// Para compartilhar avaliações entre vários usuários, será
// necessário conectar o projeto a um banco de dados.
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
    // Encontra as áreas de localização e avaliação desta página.
    const localizacao = document.querySelector("[data-localizacao]");
    const secaoAvaliacoes = document.querySelector("[data-avaliacoes]");

    // ---------------------- LOCALIZAÇÃO ----------------------

    if (localizacao) {
        // O endereço é editado diretamente no atributo data-endereco
        // da seção de localização no arquivo HTML de cada estabelecimento.
        const endereco = localizacao.dataset.endereco.trim();
        const textoEndereco = localizacao.querySelector(".endereco-estabelecimento");
        const areaMapa = localizacao.querySelector(".area-mapa");

        if (endereco) {
            // Mostra o endereço informado no HTML.
            textoEndereco.textContent = "📍 " + endereco;

            // Cria um mapa incorporado usando o endereço editado.
            // Não existe botão para abrir o Google Maps em outra página.
            const mapa = document.createElement("iframe");
            mapa.className = "mapa-estabelecimento";
            mapa.title = "Mapa com a localização do estabelecimento";
            mapa.loading = "lazy";
            mapa.referrerPolicy = "no-referrer-when-downgrade";
            mapa.src = "https://maps.google.com/maps?q=" +
                encodeURIComponent(endereco) + "&output=embed";

            areaMapa.replaceChildren(mapa);
        } else {
            // Enquanto o endereço estiver vazio, mostra uma orientação.
            textoEndereco.textContent =
                "📍 Endereço ainda não cadastrado. Edite esta informação no HTML.";
            areaMapa.innerHTML =
                '<div class="aviso-mapa">O mapa aparecerá aqui quando você preencher o endereço no atributo <strong>data-endereco</strong> desta página.</div>';
        }
    }

    // ---------------------- AVALIAÇÕES ----------------------

    if (!secaoAvaliacoes) return;

    // Identificador exclusivo para que os comentários não se misturem.
    const identificador = secaoAvaliacoes.dataset.estabelecimento;
    const chaveArmazenamento = "saborSL_avaliacoes_" + identificador;

    const formulario = secaoAvaliacoes.querySelector(".formulario-avaliacao");
    const campoNome = secaoAvaliacoes.querySelector("#nome-avaliador");
    const campoNota = secaoAvaliacoes.querySelector("#nota-avaliacao");
    const campoComentario = secaoAvaliacoes.querySelector("#comentario-avaliacao");
    const lista = secaoAvaliacoes.querySelector(".lista-avaliacoes");
    const media = secaoAvaliacoes.querySelector(".nota-media");
    const estrelasMedia = secaoAvaliacoes.querySelector(".estrelas-media");
    const quantidade = secaoAvaliacoes.querySelector(".quantidade-avaliacoes");

    // Recupera as avaliações já salvas neste navegador.
    function carregarAvaliacoes() {
        try {
            return JSON.parse(localStorage.getItem(chaveArmazenamento)) || [];
        } catch (erro) {
            console.error("Não foi possível carregar as avaliações:", erro);
            return [];
        }
    }

    // Calcula e atualiza a média das notas.
    function atualizarResumo(avaliacoes) {
        if (avaliacoes.length === 0) {
            media.textContent = "—";
            estrelasMedia.textContent = "☆☆☆☆☆";
            quantidade.textContent = "Nenhuma avaliação ainda";
            return;
        }

        const soma = avaliacoes.reduce(function (total, item) {
            return total + Number(item.nota);
        }, 0);

        const notaMedia = soma / avaliacoes.length;
        media.textContent = notaMedia.toFixed(1).replace(".", ",");
        estrelasMedia.textContent =
            "★".repeat(Math.round(notaMedia)) +
            "☆".repeat(5 - Math.round(notaMedia));
        quantidade.textContent = avaliacoes.length +
            (avaliacoes.length === 1 ? " avaliação" : " avaliações");
    }

    // Exibe os comentários na página.
    function mostrarAvaliacoes() {
        const avaliacoes = carregarAvaliacoes();
        lista.replaceChildren();
        atualizarResumo(avaliacoes);

        if (avaliacoes.length === 0) {
            const mensagem = document.createElement("p");
            mensagem.className = "sem-avaliacoes";
            mensagem.textContent =
                "Este estabelecimento ainda não recebeu avaliações. Seja a primeira pessoa a comentar!";
            lista.appendChild(mensagem);
            return;
        }

        // Mostra primeiro os comentários mais recentes.
        avaliacoes.slice().reverse().forEach(function (item) {
            const cartao = document.createElement("article");
            cartao.className = "avaliacao-item";

            const cabecalho = document.createElement("div");
            cabecalho.className = "avaliacao-cabecalho";

            const nome = document.createElement("span");
            nome.className = "avaliacao-nome";
            nome.textContent = item.nome;

            const estrelas = document.createElement("span");
            estrelas.className = "avaliacao-estrelas";
            estrelas.textContent =
                "★".repeat(Number(item.nota)) +
                "☆".repeat(5 - Number(item.nota));

            const comentario = document.createElement("p");
            comentario.className = "avaliacao-comentario";
            comentario.textContent = item.comentario;

            cabecalho.append(nome, estrelas);
            cartao.append(cabecalho, comentario);
            lista.appendChild(cartao);
        });
    }

    // Salva uma nova avaliação quando o formulário é enviado.
    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const nome = campoNome.value.trim();
        const nota = Number(campoNota.value);
        const comentario = campoComentario.value.trim();

        // Confere se os campos foram preenchidos corretamente.
        if (!nome || !comentario || nota < 1 || nota > 5) {
            alert("Preencha seu nome, sua nota e seu comentário.");
            return;
        }

        const avaliacoes = carregarAvaliacoes();

        avaliacoes.push({
            nome: nome,
            nota: nota,
            comentario: comentario,
            data: new Date().toISOString()
        });

        try {
            localStorage.setItem(chaveArmazenamento, JSON.stringify(avaliacoes));
            formulario.reset();
            mostrarAvaliacoes();
        } catch (erro) {
            alert("Não foi possível salvar. Verifique o armazenamento do navegador.");
            console.error("Erro ao salvar avaliação:", erro);
        }
    });

    // Exibe as avaliações ao abrir a página.
    mostrarAvaliacoes();
});
