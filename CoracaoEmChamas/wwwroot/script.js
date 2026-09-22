// ============================================
// ELEMENTOS
// ============================================

const canvas =
    document.getElementById("canvas");

const ctx =
    canvas.getContext("2d");

const inputFoto =
    document.getElementById("inputFoto");

const btnEscolher =
    document.getElementById("btnEscolher");

const btnTrocarFoto =
    document.getElementById("btnTrocarFoto");

const btnCentralizar =
    document.getElementById("btnCentralizar");

const btnGerar =
    document.getElementById("btnGerar");

const btnBaixar =
    document.getElementById("btnBaixar");

const btnCompartilhar =
    document.getElementById("btnCompartilhar");

const btnEditar =
    document.getElementById("btnEditar");

const controleZoom =
    document.getElementById("zoom");

const valorZoom =
    document.getElementById("valorZoom");

const areaEdicao =
    document.getElementById("areaEdicao");

const resultado =
    document.getElementById("resultado");

const imagemResultado =
    document.getElementById("imagemResultado");

const placeholder =
    document.getElementById("placeholder");

const opcoesMoldura =
    document.querySelectorAll(".opcao-moldura");

const notificacao =
    document.getElementById("notificacao");

const textoNotificacao =
    document.getElementById("textoNotificacao");


// ============================================
// CONFIGURAÇÃO
// ============================================

const TAMANHO = 1080;

// Limite de segurança do arquivo.
// 40 MB é suficiente para praticamente qualquer
// foto normal de celular, evitando arquivos gigantes.
const TAMANHO_MAXIMO_ARQUIVO =
    40 * 1024 * 1024;

canvas.width = TAMANHO;
canvas.height = TAMANHO;


// ============================================
// IMAGENS
// ============================================

const foto = new Image();

const moldura = new Image();

let caminhoMolduraAtual =
    "imagens/moldura1.png";

moldura.src =
    caminhoMolduraAtual;


// URL temporária da foto escolhida.
// Será liberada da memória quando outra foto for aberta.
let urlFotoAtual = null;


// ============================================
// ESTADO
// ============================================

let fotoCarregada = false;

let carregandoFoto = false;

let escalaBase = 1;

let zoom = 1;

let posX =
    TAMANHO / 2;

let posY =
    TAMANHO / 2;

let arrastando = false;

let ultimoX = 0;
let ultimoY = 0;

let distanciaInicial = null;

let zoomInicial = 1;

let blobFinal = null;


// ============================================
// NOTIFICAÇÃO
// ============================================

let temporizadorNotificacao = null;

function mostrarNotificacao(
    texto,
    duracao = 3000
) {

    textoNotificacao.textContent =
        texto;

    notificacao.classList.add(
        "mostrar"
    );


    if (temporizadorNotificacao) {

        clearTimeout(
            temporizadorNotificacao
        );

    }


    temporizadorNotificacao =
        setTimeout(
            function () {

                notificacao.classList.remove(
                    "mostrar"
                );

            },
            duracao
        );

}


// ============================================
// DESENHAR
// ============================================

function desenhar() {

    ctx.clearRect(
        0,
        0,
        TAMANHO,
        TAMANHO
    );


    if (
        fotoCarregada &&
        foto.naturalWidth > 0 &&
        foto.naturalHeight > 0
    ) {

        const escalaFinal =
            escalaBase * zoom;

        const largura =
            foto.naturalWidth *
            escalaFinal;

        const altura =
            foto.naturalHeight *
            escalaFinal;


        ctx.save();


        ctx.beginPath();

        ctx.arc(
            TAMANHO / 2,
            TAMANHO / 2,
            TAMANHO / 2,
            0,
            Math.PI * 2
        );

        ctx.clip();


        ctx.drawImage(
            foto,
            posX - largura / 2,
            posY - altura / 2,
            largura,
            altura
        );


        ctx.restore();

    }


    if (
        moldura.complete &&
        moldura.naturalWidth > 0
    ) {

        ctx.drawImage(
            moldura,
            0,
            0,
            TAMANHO,
            TAMANHO
        );

    }

}


// ============================================
// MOLDURA
// ============================================

moldura.onload =
    function () {

        desenhar();

    };


moldura.onerror =
    function () {

        console.error(
            "Erro ao carregar a moldura:",
            caminhoMolduraAtual
        );

        mostrarNotificacao(
            "Não foi possível carregar esta moldura."
        );

    };


// ============================================
// BOTÕES PARA ESCOLHER FOTO
// ============================================

btnEscolher.addEventListener(
    "click",
    function () {

        if (carregandoFoto) {

            return;

        }

        inputFoto.click();

    }
);


btnTrocarFoto.addEventListener(
    "click",
    function () {

        if (carregandoFoto) {

            return;

        }

        inputFoto.click();

    }
);


// ============================================
// IDENTIFICAR ARQUIVO DE IMAGEM
// ============================================

function arquivoPareceImagem(
    arquivo
) {

    if (!arquivo) {

        return false;

    }


    // Primeiro verifica o MIME informado
    // pelo próprio navegador.

    if (
        arquivo.type &&
        arquivo.type.startsWith("image/")
    ) {

        return true;

    }


    // Alguns celulares/navegadores podem não
    // fornecer corretamente o MIME.
    // Nesse caso verificamos a extensão.

    const nome =
        arquivo.name
            .toLowerCase()
            .trim();


    const extensoesPermitidas = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".heic",
        ".heif",
        ".jfif",
        ".avif"
    ];


    return extensoesPermitidas.some(
        function (extensao) {

            return nome.endsWith(
                extensao
            );

        }
    );

}


// ============================================
// LIBERAR URL TEMPORÁRIA
// ============================================

function liberarUrlFotoAnterior() {

    if (urlFotoAtual) {

        URL.revokeObjectURL(
            urlFotoAtual
        );

        urlFotoAtual = null;

    }

}


// ============================================
// ERRO AO ABRIR FOTO
// ============================================

function erroAoCarregarFoto(
    arquivo
) {

    carregandoFoto = false;

    fotoCarregada = false;

    liberarUrlFotoAnterior();


    console.error(
        "O navegador não conseguiu decodificar a imagem:",
        arquivo
    );


    mostrarNotificacao(
        "⚠️ Não foi possível abrir esta foto. Tente outra imagem ou uma versão em JPG/PNG.",
        5500
    );

}


// ============================================
// ESCOLHER FOTO
// ============================================

inputFoto.addEventListener(
    "change",
    function () {

        const arquivo =
            this.files &&
                this.files.length > 0
                ? this.files[0]
                : null;


        // Permite selecionar novamente
        // o mesmo arquivo posteriormente.
        this.value = "";


        if (!arquivo) {

            return;

        }


        if (
            !arquivoPareceImagem(
                arquivo
            )
        ) {

            mostrarNotificacao(
                "⚠️ O arquivo escolhido não parece ser uma imagem válida.",
                4500
            );

            return;

        }


        if (
            arquivo.size >
            TAMANHO_MAXIMO_ARQUIVO
        ) {

            mostrarNotificacao(
                "⚠️ Esta foto é muito grande. Escolha uma foto menor ou envie uma captura de tela dela.",
                5500
            );

            return;

        }


        carregandoFoto = true;

        fotoCarregada = false;

        blobFinal = null;


        mostrarNotificacao(
            "📷 Carregando foto...",
            1800
        );


        liberarUrlFotoAnterior();


        try {

            urlFotoAtual =
                URL.createObjectURL(
                    arquivo
                );

        }
        catch (erro) {

            console.error(
                "Erro ao criar URL da foto:",
                erro
            );

            carregandoFoto = false;

            mostrarNotificacao(
                "⚠️ Não foi possível ler esta foto.",
                4500
            );

            return;

        }


        foto.onload =
            function () {

                // Verifica se a imagem realmente
                // possui dimensões válidas.

                if (
                    !foto.naturalWidth ||
                    !foto.naturalHeight
                ) {

                    erroAoCarregarFoto(
                        arquivo
                    );

                    return;

                }


                carregandoFoto = false;

                fotoCarregada = true;

                blobFinal = null;


                prepararFoto();


                placeholder.classList.add(
                    "escondido"
                );


                areaEdicao.classList.remove(
                    "escondido"
                );


                resultado.classList.add(
                    "escondido"
                );


                btnEscolher.textContent =
                    "📷 Escolher outra foto";


                desenhar();


                mostrarNotificacao(
                    "✅ Foto carregada!"
                );

            };


        foto.onerror =
            function () {

                erroAoCarregarFoto(
                    arquivo
                );

            };


        foto.src =
            urlFotoAtual;

    }
);


// ============================================
// PREPARAR FOTO
// ============================================

function prepararFoto() {

    const larguraFoto =
        foto.naturalWidth ||
        foto.width;

    const alturaFoto =
        foto.naturalHeight ||
        foto.height;


    escalaBase =
        Math.max(
            TAMANHO / larguraFoto,
            TAMANHO / alturaFoto
        );


    zoom = 1;

    controleZoom.value = 1;

    valorZoom.textContent =
        "100%";


    posX =
        TAMANHO / 2;

    posY =
        TAMANHO / 2;

}


// ============================================
// MOLDURAS
// ============================================

opcoesMoldura.forEach(
    function (opcao) {

        opcao.addEventListener(
            "click",
            function () {

                opcoesMoldura.forEach(
                    function (item) {

                        item.classList.remove(
                            "selecionada"
                        );

                    }
                );


                this.classList.add(
                    "selecionada"
                );


                caminhoMolduraAtual =
                    this.dataset.moldura;


                moldura.src =
                    caminhoMolduraAtual;


                blobFinal = null;

            }
        );

    }
);


// ============================================
// ZOOM
// ============================================

controleZoom.addEventListener(
    "input",
    function () {

        if (!fotoCarregada) {

            return;

        }


        zoom =
            parseFloat(
                this.value
            );


        valorZoom.textContent =
            Math.round(
                zoom * 100
            ) + "%";


        limitarPosicao();

        blobFinal = null;

        desenhar();

    }
);


// ============================================
// CENTRALIZAR
// ============================================

btnCentralizar.addEventListener(
    "click",
    function () {

        if (!fotoCarregada) {

            return;

        }


        posX =
            TAMANHO / 2;

        posY =
            TAMANHO / 2;

        zoom = 1;

        controleZoom.value = 1;

        valorZoom.textContent =
            "100%";

        blobFinal = null;

        desenhar();

    }
);


// ============================================
// LIMITAR FOTO
// ============================================

function limitarPosicao() {

    if (!fotoCarregada) {

        return;

    }


    const larguraFoto =
        foto.naturalWidth ||
        foto.width;

    const alturaFoto =
        foto.naturalHeight ||
        foto.height;


    const escalaFinal =
        escalaBase * zoom;

    const largura =
        larguraFoto *
        escalaFinal;

    const altura =
        alturaFoto *
        escalaFinal;


    const metadeLargura =
        largura / 2;

    const metadeAltura =
        altura / 2;


    const minX =
        TAMANHO -
        metadeLargura;

    const maxX =
        metadeLargura;

    const minY =
        TAMANHO -
        metadeAltura;

    const maxY =
        metadeAltura;


    if (largura >= TAMANHO) {

        posX =
            Math.min(
                maxX,
                Math.max(
                    minX,
                    posX
                )
            );

    }
    else {

        posX =
            TAMANHO / 2;

    }


    if (altura >= TAMANHO) {

        posY =
            Math.min(
                maxY,
                Math.max(
                    minY,
                    posY
                )
            );

    }
    else {

        posY =
            TAMANHO / 2;

    }

}


// ============================================
// POSIÇÃO
// ============================================

function obterPosicao(
    clientX,
    clientY
) {

    const rect =
        canvas.getBoundingClientRect();


    return {

        x:
            (clientX - rect.left) *
            (canvas.width / rect.width),

        y:
            (clientY - rect.top) *
            (canvas.height / rect.height)

    };

}


// ============================================
// MOUSE
// ============================================

canvas.addEventListener(
    "mousedown",
    function (evento) {

        if (!fotoCarregada) {

            return;

        }


        arrastando = true;


        const posicao =
            obterPosicao(
                evento.clientX,
                evento.clientY
            );


        ultimoX =
            posicao.x;

        ultimoY =
            posicao.y;

    }
);


window.addEventListener(
    "mousemove",
    function (evento) {

        if (!arrastando) {

            return;

        }


        const posicao =
            obterPosicao(
                evento.clientX,
                evento.clientY
            );


        posX +=
            posicao.x -
            ultimoX;

        posY +=
            posicao.y -
            ultimoY;


        ultimoX =
            posicao.x;

        ultimoY =
            posicao.y;


        limitarPosicao();

        blobFinal = null;

        desenhar();

    }
);


window.addEventListener(
    "mouseup",
    function () {

        arrastando = false;

    }
);


// ============================================
// DISTÂNCIA ENTRE DOIS DEDOS
// ============================================

function calcularDistancia(
    toque1,
    toque2
) {

    const x =
        toque2.clientX -
        toque1.clientX;

    const y =
        toque2.clientY -
        toque1.clientY;


    return Math.sqrt(
        (x * x) +
        (y * y)
    );

}


// ============================================
// TOUCH
// ============================================

canvas.addEventListener(
    "touchstart",
    function (evento) {

        if (!fotoCarregada) {

            return;

        }


        if (
            evento.touches.length === 1
        ) {

            arrastando = true;

            distanciaInicial = null;


            const toque =
                evento.touches[0];


            const posicao =
                obterPosicao(
                    toque.clientX,
                    toque.clientY
                );


            ultimoX =
                posicao.x;

            ultimoY =
                posicao.y;

        }


        if (
            evento.touches.length === 2
        ) {

            arrastando = false;


            distanciaInicial =
                calcularDistancia(
                    evento.touches[0],
                    evento.touches[1]
                );


            zoomInicial =
                zoom;

        }


        evento.preventDefault();

    },
    {
        passive: false
    }
);


canvas.addEventListener(
    "touchmove",
    function (evento) {

        if (!fotoCarregada) {

            return;

        }


        // UM DEDO = MOVER

        if (
            evento.touches.length === 1 &&
            arrastando
        ) {

            const toque =
                evento.touches[0];


            const posicao =
                obterPosicao(
                    toque.clientX,
                    toque.clientY
                );


            posX +=
                posicao.x -
                ultimoX;

            posY +=
                posicao.y -
                ultimoY;


            ultimoX =
                posicao.x;

            ultimoY =
                posicao.y;


            limitarPosicao();

            blobFinal = null;

            desenhar();

        }


        // DOIS DEDOS = ZOOM

        if (
            evento.touches.length === 2 &&
            distanciaInicial !== null
        ) {

            const distanciaAtual =
                calcularDistancia(
                    evento.touches[0],
                    evento.touches[1]
                );


            const fator =
                distanciaAtual /
                distanciaInicial;


            zoom =
                zoomInicial *
                fator;


            zoom =
                Math.max(
                    1,
                    Math.min(
                        3,
                        zoom
                    )
                );


            controleZoom.value =
                zoom;


            valorZoom.textContent =
                Math.round(
                    zoom * 100
                ) + "%";


            limitarPosicao();

            blobFinal = null;

            desenhar();

        }


        evento.preventDefault();

    },
    {
        passive: false
    }
);


canvas.addEventListener(
    "touchend",
    function (evento) {

        if (
            evento.touches.length === 0
        ) {

            arrastando = false;

            distanciaInicial = null;

        }


        if (
            evento.touches.length === 1
        ) {

            arrastando = true;

            distanciaInicial = null;


            const toque =
                evento.touches[0];


            const posicao =
                obterPosicao(
                    toque.clientX,
                    toque.clientY
                );


            ultimoX =
                posicao.x;

            ultimoY =
                posicao.y;

        }

    }
);


// ============================================
// CRIAR BLOB FINAL
// ============================================

function criarBlobFinal() {

    return new Promise(
        function (resolve) {

            try {

                desenhar();


                canvas.toBlob(
                    function (blob) {

                        if (!blob) {

                            resolve(null);

                            return;

                        }


                        blobFinal =
                            blob;

                        resolve(blob);

                    },
                    "image/png",
                    1
                );

            }
            catch (erro) {

                console.error(
                    "Erro ao gerar imagem:",
                    erro
                );

                resolve(null);

            }

        }
    );

}


// ============================================
// GERAR
// ============================================

btnGerar.addEventListener(
    "click",
    async function () {

        if (!fotoCarregada) {

            mostrarNotificacao(
                "📷 Escolha sua foto primeiro."
            );

            return;

        }


        const blob =
            await criarBlobFinal();


        if (!blob) {

            mostrarNotificacao(
                "Não foi possível gerar a imagem."
            );

            return;

        }


        const url =
            URL.createObjectURL(
                blob
            );


        if (
            imagemResultado.dataset
                .urlAnterior
        ) {

            URL.revokeObjectURL(
                imagemResultado.dataset
                    .urlAnterior
            );

        }


        imagemResultado.src =
            url;


        imagemResultado.dataset
            .urlAnterior =
            url;


        resultado.classList.remove(
            "escondido"
        );


        resultado.scrollIntoView(
            {
                behavior: "smooth",
                block: "start"
            }
        );

    }
);


// ============================================
// BAIXAR
// ============================================

btnBaixar.addEventListener(
    "click",
    async function () {

        let blob =
            blobFinal;


        if (!blob) {

            blob =
                await criarBlobFinal();

        }


        if (!blob) {

            mostrarNotificacao(
                "Não foi possível preparar a imagem."
            );

            return;

        }


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            "coracao-em-chamas-foto-oficial.png";


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


        setTimeout(
            function () {

                URL.revokeObjectURL(
                    url
                );

            },
            1500
        );


        mostrarNotificacao(
            "🔥 Foto salva!"
        );

    }
);


// ============================================
// COMPARTILHAR
// ============================================

btnCompartilhar.addEventListener(
    "click",
    async function () {

        let blob =
            blobFinal;


        if (!blob) {

            blob =
                await criarBlobFinal();

        }


        if (!blob) {

            mostrarNotificacao(
                "Não foi possível preparar a imagem."
            );

            return;

        }


        let arquivo;


        try {

            arquivo =
                new File(
                    [blob],
                    "coracao-em-chamas.png",
                    {
                        type:
                            "image/png"
                    }
                );

        }
        catch (erro) {

            console.error(
                "Erro ao preparar arquivo:",
                erro
            );

            baixarComoFallback(
                blob
            );

            return;

        }


        if (
            navigator.share &&
            navigator.canShare &&
            navigator.canShare(
                {
                    files: [arquivo]
                }
            )
        ) {

            try {

                await navigator.share(
                    {
                        files:
                            [arquivo],

                        title:
                            "Coração em Chamas",

                        text:
                            "🔥 4º Aniversário de Jovens e Adolescentes - Coração em Chamas"
                    }
                );

            }
            catch (erro) {

                if (
                    erro.name !==
                    "AbortError"
                ) {

                    console.error(
                        erro
                    );

                    mostrarNotificacao(
                        "Não foi possível compartilhar diretamente."
                    );

                }

            }

        }
        else {

            baixarComoFallback(
                blob
            );

        }

    }
);


// ============================================
// DOWNLOAD DE SEGURANÇA
// ============================================

function baixarComoFallback(
    blob
) {

    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;

    link.download =
        "coracao-em-chamas-foto-oficial.png";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    setTimeout(
        function () {

            URL.revokeObjectURL(
                url
            );

        },
        1500
    );


    mostrarNotificacao(
        "Seu navegador não permite compartilhar diretamente. A foto foi salva no aparelho.",
        4500
    );

}


// ============================================
// VOLTAR
// ============================================

btnEditar.addEventListener(
    "click",
    function () {

        resultado.classList.add(
            "escondido"
        );


        document
            .querySelector(".card")
            .scrollIntoView(
                {
                    behavior: "smooth",
                    block: "start"
                }
            );

    }
);


// ============================================
// LIMPEZA DE MEMÓRIA
// ============================================

window.addEventListener(
    "beforeunload",
    function () {

        liberarUrlFotoAnterior();


        if (
            imagemResultado.dataset
                .urlAnterior
        ) {

            URL.revokeObjectURL(
                imagemResultado.dataset
                    .urlAnterior
            );

        }

    }
);


// ============================================
// PRIMEIRA RENDERIZAÇÃO
// ============================================

desenhar();