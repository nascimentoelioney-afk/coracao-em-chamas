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


// ============================================
// ESTADO
// ============================================

let fotoCarregada = false;

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

function mostrarNotificacao(texto) {

    textoNotificacao.textContent =
        texto;

    notificacao.classList.add(
        "mostrar"
    );

    setTimeout(
        function () {

            notificacao.classList.remove(
                "mostrar"
            );

        },
        2600
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


    if (fotoCarregada) {

        const escalaFinal =
            escalaBase * zoom;

        const largura =
            foto.width * escalaFinal;

        const altura =
            foto.height * escalaFinal;


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
            "Erro ao carregar:",
            caminhoMolduraAtual
        );

    };


// ============================================
// ESCOLHER FOTO
// ============================================

btnEscolher.addEventListener(
    "click",
    function () {

        inputFoto.click();

    }
);


btnTrocarFoto.addEventListener(
    "click",
    function () {

        inputFoto.click();

    }
);


inputFoto.addEventListener(
    "change",
    function () {

        const arquivo =
            this.files[0];


        if (!arquivo) {

            return;

        }


        if (
            !arquivo.type.startsWith("image/")
        ) {

            alert(
                "Escolha uma imagem válida."
            );

            return;

        }


        const leitor =
            new FileReader();


        leitor.onload =
            function (evento) {

                foto.onload =
                    function () {

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

                    };


                foto.src =
                    evento.target.result;

            };


        leitor.readAsDataURL(
            arquivo
        );


        this.value = "";

    }
);


// ============================================
// PREPARAR FOTO
// ============================================

function prepararFoto() {

    escalaBase =
        Math.max(
            TAMANHO / foto.width,
            TAMANHO / foto.height
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


    const escalaFinal =
        escalaBase * zoom;

    const largura =
        foto.width * escalaFinal;

    const altura =
        foto.height * escalaFinal;


    const metadeLargura =
        largura / 2;

    const metadeAltura =
        altura / 2;


    const minX =
        TAMANHO - metadeLargura;

    const maxX =
        metadeLargura;

    const minY =
        TAMANHO - metadeAltura;

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
            posicao.x - ultimoX;

        posY +=
            posicao.y - ultimoY;


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


        if (evento.touches.length === 1) {

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


        if (evento.touches.length === 2) {

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
                posicao.x - ultimoX;

            posY +=
                posicao.y - ultimoY;


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

            desenhar();


            canvas.toBlob(
                function (blob) {

                    blobFinal =
                        blob;

                    resolve(blob);

                },
                "image/png",
                1
            );

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

            alert(
                "Escolha sua foto primeiro."
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
            imagemResultado.dataset.urlAnterior
        ) {

            URL.revokeObjectURL(
                imagemResultado.dataset.urlAnterior
            );

        }


        imagemResultado.src =
            url;


        imagemResultado.dataset.urlAnterior =
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
            1000
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


        const arquivo =
            new File(
                [blob],
                "coracao-em-chamas.png",
                {
                    type: "image/png"
                }
            );


        /*
            Verifica se o navegador consegue
            compartilhar arquivos.
        */

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
                        files: [arquivo],

                        title:
                            "Coração em Chamas",

                        text:
                            "🔥 4º Aniversário de Jovens e Adolescentes - Coração em Chamas"
                    }
                );

            }
            catch (erro) {

                /*
                    AbortError significa apenas
                    que a pessoa fechou o menu
                    de compartilhamento.
                */

                if (
                    erro.name !==
                    "AbortError"
                ) {

                    console.error(
                        erro
                    );

                    mostrarNotificacao(
                        "Não foi possível compartilhar."
                    );

                }

            }

        }
        else {

            /*
                Navegador sem suporte:
                fazemos o download.
            */

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
                1000
            );


            mostrarNotificacao(
                "Seu navegador não permite compartilhar diretamente. A foto foi baixada."
            );

        }

    }
);


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
// PRIMEIRA RENDERIZAÇÃO
// ============================================

desenhar();