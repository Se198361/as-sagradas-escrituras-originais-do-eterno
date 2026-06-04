import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Menu, Play, Square, Search, BookOpen, X } from 'lucide-react';
import { db } from '../db/database';
import type { Book, Verse } from '../db/database';
import { ThemeToggle } from './ThemeToggle';
import { useLiveQuery } from 'dexie-react-hooks';

import { translateToJudaic, getJudaicBookName, getJudaicTransliteration } from '../utils/judaicTranslator';

interface ReaderProps {
  book: Book;
  onOpenSidebar: () => void;
  isJudaicMode: boolean;
  onToggleJudaicMode: () => void;
}

// A global set to track books currently loading to avoid concurrent insertions (e.g. from React Strict Mode double-effect)
const loadingBooks = new Set<string>();

// Utilidade para remover os sinais massoréticos (Niqqud e Cantilação Unicode range)
const removeNiqqud = (text: string): string => {
  return text.replace(/[\u0591-\u05C7]/g, '');
};

// Mapeamento de metadados do Antigo Testamento para download de áudio real do hebraico.pro.br
const bookAudioMetadata: Record<string, { seder: number; qod: string }> = {
  gn: { seder: 1, qod: "GENESIS" },
  ex: { seder: 2, qod: "EXODO" },
  lv: { seder: 3, qod: "LEVITICO" },
  nm: { seder: 4, qod: "NUMEROS" },
  dt: { seder: 5, qod: "DEUTERONOMIO" },
  js: { seder: 6, qod: "JOSUE" },
  jz: { seder: 7, qod: "JUIZES" },
  rt: { seder: 8, qod: "RUTE" },
  '1sm': { seder: 9, qod: "1SAMUEL" },
  '2sm': { seder: 10, qod: "2SAMUEL" },
  '1rs': { seder: 11, qod: "1REIS" },
  '2rs': { seder: 12, qod: "2REIS" },
  '1cr': { seder: 13, qod: "1CRONICAS" },
  '2cr': { seder: 14, qod: "2CRONICAS" },
  ed: { seder: 15, qod: "ESDRAS" },
  ne: { seder: 16, qod: "NEEMIAS" },
  et: { seder: 17, qod: "ESTER" },
  'jó': { seder: 18, qod: "JO" },
  sl: { seder: 19, qod: "SALMOS" },
  pv: { seder: 20, qod: "PROVERBIOS" },
  ec: { seder: 21, qod: "ECLESIASTES" },
  ct: { seder: 22, qod: "CANTARES" },
  is: { seder: 23, qod: "ISAIAS" },
  jr: { seder: 24, qod: "JEREMIAS" },
  lm: { seder: 25, qod: "LAMENTACOES" },
  ez: { seder: 26, qod: "EZEQUIEL" },
  dn: { seder: 27, qod: "DANIEL" },
  os: { seder: 28, qod: "OSEIAS" },
  jl: { seder: 29, qod: "JOEL" },
  am: { seder: 30, qod: "AMOS" },
  ob: { seder: 31, qod: "OBADIAS" },
  jn: { seder: 32, qod: "JONAS" },
  mq: { seder: 33, qod: "MIQUEIAS" },
  na: { seder: 34, qod: "NAUM" },
  hc: { seder: 35, qod: "HABACUQUE" },
  sf: { seder: 36, qod: "SOFONIAS" },
  ag: { seder: 37, qod: "AGEU" },
  zc: { seder: 38, qod: "ZACARIAS" },
  ml: { seder: 39, qod: "MALAQUIAS" }
};

// Interface para dados estruturados de Exegese Erudita
interface ExegesisData {
  commentary: string;
  theology: string;
  explanation: string; // Como explicar o versículo hoje de forma prática
  homiletics: string; // Esboço homilético de pregação fiel ao original
  sermon: string; // Roteiro completo de pregação expositiva com referências e exegese original
  wordAnalysis: Array<{
    hebrew: string;
    translit: string;
    translation: string;
    parsing: string;
    rootMeaning: string;
  }>;
}

// Analisador hermenêutico/exegético que gera análises profundas sob demanda
const getExegesisData = (verse: Verse, bookName: string, isJudaicMode: boolean): ExegesisData => {
  const abbrev = verse.book_abbrev.toLowerCase();
  const ref = `${bookName} ${verse.chapter}:${verse.verse}`;
  
  let rawData: ExegesisData;

  // Exegese dedicada clássica para Gênesis 1:1
  if (abbrev === 'gn' && verse.chapter === 1 && verse.verse === 1) {
    rawData = {
      commentary: `No princípio (Bereshit) criou Deus os céus e a terra. O termo "Bereshit" inicia a Torá com a preposição "be" (em/no) e o substantivo "reshit" (princípio, primazia). Gramaticalmente, indica o ponto de partida absoluto da criação do tempo, espaço e matéria. O verbo "Bara" (criou) é de suma importância teológica: na Bíblia Hebraica, este verbo possui exclusivamente Deus (Elohim) como sujeito ativo. Ele expressa a ação de trazer algo à existência a partir do nada (creatio ex nihilo), sem esforço antropomórfico. "Elohim" é o plural de majestade para demonstrar a soberania e a pluralidade em unidade do Criador. A partícula "Et" é um sinal gramatical do acusativo que aponta para os objetos diretos: os céus (HaShamayim - as alturas espirituais e físicas) e a terra (HaAretz - a matéria condensada).`,
      theology: `Este versículo serve como fundamento cosmológico para toda a revelação monoteísta. Ao contrário dos mitos pagãos antigos de criação (como o Enuma Elish babilônico), que descreviam a criação através de combates caóticos entre deuses preexistentes, a narrativa bíblica estabelece que o Deus Único e Eterno precede o universo criado e possui autoridade absoluta sobre ele. A expressão expressa que a história linear humana tem um início planejado e governado sob os desígnios soberanos do Eterno.`,
      explanation: `Para explicar este versículo hoje, mostre à congregação que a palavra "Bereshit" (No princípio) aponta para um início planejado e soberano de Deus, e não para um acidente cósmico. A criação vem do amor e da autoridade divina. O verbo "Bara" (criou) revela o poder exclusivo de Deus de trazer à existência o que não existia (creatio ex nihilo). Diga ao seu público que, mesmo quando nos deparamos com situações que parecem sem forma e vazias, o mesmo Deus de poder soberano (Elohim) tem o poder infinito de criar novas histórias e propósitos do nada.`,
      homiletics: `Esboço Homilético para Pregação Fiel:\n1. O Princípio com Propósito Divino (Bereshit): A história e o tempo não são governados pelo acaso, mas pelo plano eterno do Criador.\n2. O Poder Criador Exclusivo de Deus (Bara): Somente o Eterno (Elohim) pode realizar o impossível e trazer à existência o que não existia. Nossa fé deve ser teocêntrica.\n3. O Domínio Absoluto do Criador (Os céus e a terra): Deus reina soberanamente sobre o mundo visível e invisível; tudo pertence a Ele e proclama a Sua glória.`,
      sermon: `Sermão Expositivo Completo: "O Começo de Tudo sob a Soberania do Criador"\n\nINTRODUÇÃO:\nAo subirmos ao púlpito hoje para expor a Palavra de Deus, deparamo-nos com o alicerce de toda a verdade bíblica em Gênesis 1:1. Para compreender a profundidade deste texto, precisamos mergulhar na língua original em que foi inspirado. A primeira palavra hebraica da Bíblia é בְּרֵאשִׁית (Bereshit - "No princípio"). Destaque para a igreja que isso não é meramente um dado cronológico. "Bereshit" aponta para um começo absoluto planejado de forma deliberada. Deus não criou o universo como um experimento casual ou por acaso; Ele estabeleceu uma fundação soberana. Antes de existir o tempo, o espaço, a matéria ou as suas aflições diárias, o Eterno já estava lá, movendo o início com perfeito propósito.\n\nPONTO 1: O NOME E A MAJESTADE SUPREMA DE DEUS\nA revelação se inicia teocêntrica. Quem está no comando da criação é אֱלֹהִים (Elohim - "Deus"). O uso deste termo, que é um plural de majestade e plenitude, enfatiza a soberania ilimitada e o poder imensurável do Criador.\n\n• Versículo Cruzado 1: João 1:1-3\n  -> Texto: "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus. Ele estava no princípio com Deus. Todas as coisas foram feitas por ele..."\n  -> Explicação da Referência Cruzada: Mostre à congregação a perfeita unidade das Escrituras! O mesmo "Bereshit" de Gênesis é invocado pelo apóstolo João para introduzir Yeshua (Jesus), a Palavra Viva (o Verbo). Explique que o Deus invisível que criou o cosmo manifestou-Se visivelmente em Yeshua. Pregar Gênesis 1:1 fielmente é apontar para Cristo como o Arquiteto e Sustentador de toda a existência humana. Ele é o princípio de nossa nova vida.\n\n• Versículo Cruzado 2: Salmo 102:25\n  -> Texto: "Desde a antiguidade fundaste a terra; e os céus são obra das tuas mãos."\n  -> Explicação da Referência Cruzada: O salmista ressalta a absoluta solidez da fundação divina em contraste com a impermanência do mundo físico. Ensine às pessoas no púlpito que tudo o que vemos ao nosso redor (casas, finanças, crises) pode envelhecer e abalar-se, mas Aquele que fundamentou a existência permanece eternamente imutável e fiel à Sua aliança.\n\nPONTO 2: A EXCLUSIVIDADE DO MILAGRE DIVINO NO CAOS\nO verbo usado no hebraico para criar é בָּרָא (Bara - "criou"). Explique com clareza à congregação: na Bíblia inteira, o verbo "Bara" possui exclusivamente Deus como sujeito ativo. O homem pode modelar ou "fazer" (Asah) coisas a partir de matéria existente, mas somente Elohim pode fazer o "Bara" - criar a partir do nada absoluto (creatio ex nihilo).\n\n• Versículo Cruzado 1: Hebreus 11:3\n  -> Texto: "Pela fé entendemos que os mundos foram criados pela palavra de Deus; de maneira que aquilo que se vê não foi feito do que é aparente."\n  -> Explicação da Referência Cruzada: O autor de Hebreus decodifica o milagre do "Bara" original. Deus trouxe o universo visível à realidade a partir do invisível, puramente pela força da Sua Palavra ativa. Pressione a aplicação prática na vida dos ouvintes: se a vida de alguém parece vazia, sem forma ou devastada pelo sofrimento, proclame que o Deus do "Bara" tem a prerrogativa única de gerar esperança, salvação e paz do nada absoluto.\n\n• Versículo Cruzado 2: Romanos 4:17\n  -> Texto: "...Deus que vivifica os mortos, e chama as coisas que não são como se já fossem."\n  -> Explicação da Referência Cruzada: O apóstolo Paulo utiliza a teologia da criação ex-nihilo para ilustrar a justificação do pecador. Pregar este cruzamento significa explicar que Deus não precisa de "boas obras preexistentes" para restaurar um coração; Ele opera o Seu milagre gerando uma nova natureza espiritual a partir do nada, puramente por Sua graça.\n\nPONTO 3: A PLENITUDE E A FINALIDADE DE TODA A EXISTÊNCIA\nDeus criou הַשָּׁמַיִם וְאֵת הָאָRֶץ (HaShamayim ve-et HaAretz - "os céus e a terra"). Esta expressão merismática abrange todo o espectro espiritual (invisível) e físico (visível) do universo, declarando que o Eterno é o dono soberano de ambos.\n\n• Versículo Cruzado: Colossenses 1:16\n  -> Texto: "Porque nele foram criadas todas as coisas que há nos céus e na terra, visíveis e invisíveis... tudo foi criado por ele e para ele."\n  -> Explicação da Referência Cruzada: Paulo elucida que todas as coisas, espirituais e materiais, foram criadas através de Cristo e possuem como objetivo final a glória de Cristo. Destaque para os ouvintes que o ser humano foi planejado com o mesmo fim: viver "para Ele". Uma vida vivida fora dessa finalidade divina está fora de órbita, desequilibrada e frustrada.\n\nCONCLUSÃO E APELO:\nO Deus do Bereshit, que age exclusivamente através do Bara como o poderoso Elohim sobre os céus e a terra, convida cada coração a render-se ao Seu domínio amoroso. Se sua jornada parece estar imersa no caos ou em escuridão profunda, coloque-se diante dAquele que tem a autoridade absoluta de ordenar a luz e iniciar um recomeço maravilhoso em sua alma hoje! Amém.`,
      wordAnalysis: [
        { hebrew: 'בְּרֵאשִׁית', translit: "bere'shit", translation: 'No princípio', parsing: 'Substantivo Fem. com Prep.', rootMeaning: 'Raiz רֵאשִׁית (reshit): início absoluto, primazia, primícias. Indica o início do fluxo temporal. Strong H7225.' },
        { hebrew: 'בָּרָא', translit: 'bara', translation: 'criou', parsing: 'Verbo Qal Perfeito 3MS', rootMeaning: 'Raiz בָּרָא (bara): criar a partir do nada. Usado unicamente tendo Deus como sujeito na Bíblia. Strong H1254.' },
        { hebrew: 'אֱלֹהִים', translit: 'elohim', translation: 'Deus', parsing: 'Substantivo Plural Masculino', rootMeaning: 'Raiz אֱלֹהִים (elohim): Deus, forças supremas, plural de majestade para expressar plenitude de poder. Strong H430.' },
        { hebrew: 'אֵת', translit: 'et', translation: '(partícula)', parsing: 'Partícula de Acusativo Dir.', rootMeaning: 'Aponta para o objeto direto. Na tradição mística (Cabala), representa o Alef (א) ao Tav (ת), o início e o fim. Strong H853.' },
        { hebrew: 'הַשָּׁמַיִם', translit: 'hashamayim', translation: 'os céus', parsing: 'Substantivo Plural com Art.', rootMeaning: 'Raiz שָׁמַיִם (shamayim): as alturas, o reino celestial e a atmosfera física criada. Strong H8064.' },
        { hebrew: 'וְאֵת', translit: 've-et', translation: 'e (partícula)', parsing: 'Conjunção + Partícula', rootMeaning: 'Partícula conjuntiva ligando os dois pilares primordiais da criação física. Strong H853.' },
        { hebrew: 'הָאָרֶץ', translit: 'ha-aretz', translation: 'a terra', parsing: 'Substantivo Sing. com Art.', rootMeaning: 'Raiz אֶרֶץ (eretz): solo, terra firme, o mundo habitável e a base material da existência. Strong H776.' }
      ]
    };
  } else if (abbrev === 'jn' && verse.chapter === 1 && verse.verse === 1) {
    rawData = {
      commentary: `E veio (Vayehi) a palavra do SENHOR (Devar-YHVH) a Jonas, filho de Amitai, dizendo... O livro começa com a clássica conjunção consecutiva "Vayehi" ("E foi" ou "E aconteceu"), que liga este livro às crônicas históricas de Israel, mostrando que o chamado profético é um evento histórico e factual, não uma alegoria ou mito. A expressão "Devar-YHVH" (Palavra do Eterno) é a fórmula técnica de inspiração profética por excelência. O nome "Jonas" (Yonah) significa "pomba", simbolizando a nação de Israel ou uma mensagem de paz que o profeta resistirá em proclamar. Seu pai "Amitai" significa "Minha Verdade", adicionando uma camada irônica de que Jonas carrega a verdade divina, mesmo em sua posterior fuga desesperada.`,
      theology: `A exegese deste chamado demonstra o caráter inevitável da vontade e da palavra de YHVH. O profeta não escolhe sua missão; a palavra "veio" ativamente sobre ele. Isto contrasta a soberania absoluta do Deus de Israel com a limitação geográfica e moral dos deuses locais das nações vizinhas. O envio de Jonas a uma cidade pagã como Nínive prefigura a universalidade da misericórdia divina, extrapolando os limites geográficos e raciais da nação de Israel para abraçar toda a criação.`,
      explanation: `Explique à congregação que a Palavra do Senhor (Devar-YHVH) é uma força viva que invade a nossa história com chamados práticos. Jonas (pomba) representa a nossa própria fragilidade humana em resistir ao Ide de Deus, especialmente quando nos desafia a pregar a misericórdia a pessoas difíceis. Ensine que a verdade de Deus (Amitai) é soberana e inescapável, e que fugir dos desígnios eternos em prol de conveniências pessoais sempre trará tempestades e sofrimento na nossa jornada.`,
      homiletics: `Esboço Homilético para Pregação Fiel:\n1. A Palavra que Toma a Iniciativa (Vayehi Devar-YHVH): Deus não nos deixa no silêncio; Ele fala de forma assertiva e direcionada.\n2. O Conflito do Mensageiro (Jonas, filho de Amitai): Como nossa fraqueza e preconceito podem nos tentar a resistir à vontade revelada de Deus.\n3. O Escopo Universal da Misericórdia Divina: O chamado missionário de Deus rompe as nossas barriers geográficas e religiosas para levar arrependimento e graça aos aflitos.`,
      sermon: `Sermão Expositivo Completo: "A Palavra Inescapável do Senhor e a Ilusão da Fuga"\n\nINTRODUÇÃO:\nA desobediência a Deus muitas vezes começa silenciosa, disfarçada de conveniência pessoal e conforto próprio. No entanto, o chamado do Eterno é uma força histórica irresistível. O livro de Jonas inicia-se com uma das declarações teológicas mais fortes da Bíblia Hebraica: וַיְהִי דְּבัר-יְהוָה (Vayehi Devar-YHVH - "E aconteceu a palavra de YHVH"). Destaque à congregação que o chamado de Deus não é um convite educado para ser debatido, mas uma ordenança solene de intervenção amorosa. Hoje, aprenderemos no púlpito o perigo de resistirmos à voz do Eterno e a beleza de nos submetermos ao Seu envio soberano.\n\nPONTO 1: A PALAVRA QUE TOMA A INICIATIVA E EXIGE OBEDIÊNCIA\nNo hebraico original, a expressão דְּבัר-יְהוָה (Devar-YHVH - "Palavra de YHVH") indica a revelação dinâmica e a expressão visível da vontade do Senhor. O chamado não se origina nos pensamentos de Jonas, mas desce do trono de Deus para guiá-lo ativamente.\n\n• Versículo Cruzado 1: Isaías 55:11\n  -> Texto: "Assim será a minha palavra, que sair da minha boca; ela não voltará para mim vazia, antes fará o que me apraz, e prosperará naquilo para que a enviei."\n  -> Explicação da Referência Cruzada: Ensine à congregação que a Palavra de Deus (Davar) possui um poder intrínseco de realização. Quando Deus lança um mandamento sobre a vida de um servo, esse mandamento cumprirá o seu papel. Jonas tentou fugir, mas a Palavra do Senhor o seguiu na tempestade e nas profundezas do grande peixe. Mostre que é inútil lutar contra os mandatos soberanos do Pai; Sua Palavra sempre prosperará e prevalecerá.\n\n• Versículo Cruzado 2: Salmo 119:105\n  -> Texto: "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho."\n  -> Explicação da Referência Cruzada: O salmista declara que a direção de YHVH é a única luz segura para guiar nossos passos. Quando a palavra de Deus veio a Jonas, ela deveria ter sido sua luz de obediência. No entanto, Jonas rejeitou essa luz para buscar a escuridão da rebeldia. Pregar este ponto é mostrar aos ouvintes que fugir da revelação de Deus é escolher a cegueira espiritual.\n\nPONTO 2: A INCOERÊNCIA DE UM MENSAGEIRO FALHO\nJonas (יוֹנָה - Yonah, que significa "pomba") é filho de Amitai (אֲמִתַּי - Amitay, que significa "Minha Verdade"). Há uma profunda ironia na exegese desses nomes: o portador da verdade divina (Amitai) age de forma covarde e egoísta como uma pomba amedrontada (Yonah), resistindo a pregar a misericórdia aos inimigos ninivitas.\n\n• Versículo Cruzado 1: Jeremias 1:7-8\n  -> Texto: "Mas o Senhor me disse: Não digas: Eu sou um menino; porque a todos a quem eu te enviar, irás; e tudo quanto te mandar, falarás. Não temas diante deles..."\n  -> Explicação da Referência Cruzada: Faça um contraste marcante no púlpito: enquanto Jeremias, assustado, foi encorajado por Deus a proclamar a verdade e obedeceu, Jonas, cheio de preconceito e comodismo, tentou escapar do seu dever. Ensine que o compromisso de pregar a verdade do Evangelho não depende de nossos sentimentos em relação aos ouvintes ou do nosso próprio conforto, mas da fidelidade Àquele que nos envia.\n\n• Versículo Cruzado 2: 1 Coríntios 1:27\n  -> Texto: "Mas Deus escolheu as coisas loucas deste mundo para confundir as sábias; e Deus escolheu as coisas fracas deste mundo para confundir as fortes."\n  -> Explicação da Referência Cruzada: Explique à igreja que Deus se utiliza de vasos de barro imperfeitos (como Jonas, e como nós) para manifestar a perfeição de Sua graça. Apesar da rebeldia inicial de Jonas, Deus insistiu em restaurá-lo e usá-lo para salvar Nínive. Pregar isso traz consolo e alerta: Deus nos usa em nossa fraqueza, mas exige que nosso coração seja quebrado por Ele.\n\nPONTO 3: A ILUSÃO DE ESCAPAR DO ALTÍSSIMO\nJonas desce a Jope para fugir "de diante da face do Senhor" (mili-lifney YHVH) rumo a Tarsis. Ele achava que a distância geográfica poderia libertá-lo da voz e do domínio do Criador.\n\n• Versículo Cruzado: Salmo 139:7-10\n  -> Texto: "Para onde me irei do teu espírito, ou para onde fugirei da tua face? Se subir ao céu, lá tu estás; se fizer no inferno a minha cama, eis que tu ali estás também..."\n  -> Explicação da Referência Cruzada: O salmista desmascara de forma definitiva a ilusão de Jonas e de qualquer pecador em fuga. O Eterno é onipresente! Não há esconderijo, navio ou profundezes que possam nos isolar do olhar soberano de Deus. Confronte amorosamente a congregação: "Em qual navio você tem tentado embarcar para escapar da voz de Deus? Volte para a presença do Pai, pois fugir de Deus é caminhar direto para o naufrágio!"\n\nCONCLUSÃO E APELO:\nA Palavra do Senhor veio a Jonas para salvar uma nação, e ela vem a nós hoje para restaurar a nossa história. Que possamos abandonar nossas ilusórias Tarsis de comodismo e orgulho espiritual. Convide os presentes a dobrar os joelhos perante a soberana vontade de YHVH, dizendo em obediência: "Eis-me aqui, Senhor, envia-me a mim." Amém.`,
      wordAnalysis: [
        { hebrew: 'וַיְהִי', translit: 'vayehi', translation: 'E veio / e aconteceu', parsing: 'Verbo Qal Imperfeito 3MS', rootMeaning: 'Raiz הָיָה (hayah): ser, existir, tornar-se. A conjunção conversiva Vav transforma o tempo para o passado. Strong H1961.' },
        { hebrew: 'דְּבַר-            יְהוָה', translit: 'devar-yhvh', translation: 'a palavra do SENHOR', parsing: 'Substantivo Regente + Nome Prop.', rootMeaning: 'Davar (palavra/revelação, H1697) em estado construto com o Tetragrama YHVH (o Eterno Existente, H3068).' },
        { hebrew: 'אֶל-            יוֹנָה', translit: 'el-yonah', translation: 'a Jonas', parsing: 'Preposição + Nome Próprio', rootMeaning: 'Nome יוֹנָה (yonah): pomba. O destinatário da ordenança divina e protagonista. Strong H3124.' },
        { hebrew: 'בֶן-            אֲמִתַּי', translit: 'ven-amitay', translation: 'filho de Amitai', parsing: 'Substantivo Regente + Nome Prop.', rootMeaning: 'Ven (filho de, H1121) + Amitai (fidelidade/verdade do Eterno, H573). A linhagem terrena do profeta.' },
        { hebrew: 'לֵאמֹר', translit: 'lemor', translation: 'dizendo / para dizer', parsing: 'Infinito Construto com Prep.', rootMeaning: 'Raiz אָמัר (amar): falar, declarar. Literalmente "para dizer", introduzindo o discurso divino direto. Strong H559.' }
      ]
    };
  } else {
    // Motor hermenêutico/exegético inteligente e dinâmico para os demais versículos
    const hasYHVH = verse.words.some(w => {
      const t = w.transliteration.toLowerCase();
      return t.includes('yhvh') || t.includes('yahweh') || t.includes('yëhovåh') || t.includes('yhovåh') || t.includes('yahuah') || t.includes('yhwh');
    });
    const hasElohim = verse.words.some(w => w.transliteration.toLowerCase().includes('elohim') || w.transliteration.toLowerCase().includes('eloh'));
    const hasBara = verse.words.some(w => w.transliteration.toLowerCase().includes('bara'));
    const hasBen = verse.words.some(w => w.transliteration.toLowerCase().includes('ben') || w.transliteration.toLowerCase().includes('ven'));
    const hasYom = verse.words.some(w => w.transliteration.toLowerCase().includes('yom'));
    const hasDavar = verse.words.some(w => w.transliteration.toLowerCase().includes('devar') || w.transliteration.toLowerCase().includes('dëvar') || w.transliteration.toLowerCase().includes('davar'));
    
    const keyWordsExplored: string[] = [];
    if (hasYHVH) keyWordsExplored.push("o Tetragrama YHVH (o Nome Eterno e Inefável de Deus, derivado da raiz 'ser/existir', expressando autoexistência e fidelidade pactual)");
    if (hasElohim) keyWordsExplored.push("o substantivo Elohim (plural de majestade usado para designar o Deus de Israel em Sua plenitude de poder, soberania cósmica e justiça)");
    if (hasBara) keyWordsExplored.push("o verbo Bara (ação exclusiva de Deus para criar algo absolutamente original ou ex-nihilo)");
    if (hasBen) keyWordsExplored.push("o termo Ben/Ven (filho/descendente, fundamental para linhagens e promessas covenants)");
    if (hasYom) keyWordsExplored.push("a unidade de tempo Yom (dia, ciclo completo ou período designado por Deus)");
    if (hasDavar) keyWordsExplored.push("o termo Davar (palavra, manifestação activa da vontade e intelecto divino que cria e governa)");

    const keyWordsString = keyWordsExplored.length > 0
      ? ` Dentre os vocábulos em destaque, este trecho bíblico contém ${keyWordsExplored.join(', bem como ')}, o que enriquece imensamente seu valor hermenêutico.`
      : '';

    const generatedCommentary = `A exegese de ${ref} revela uma preciosa harmonia textual entre o hebraico original e as nuances teológicas da mensagem. A sintaxe hebraica organiza o fluxo de pensamentos de forma que os conceitos cruciais e as ações divinas tomem precedência absoluta na frase.${keyWordsString} Ao observar o arranjo interlinear, nota-se que cada expressão carrega uma profundidade de significado idiomático que a tradução em língua portuguesa apenas arranha. Estudar as conexões gramaticais hebraicas deste versículo amplia nosso discernimento sobre a intenção dos autores inspirados e a riqueza das revelações divinas preservadas ao longo dos séculos pelos escribas massoretas.`;

    const generatedTheology = `Do ponto de vista teológico, ${ref} ressalta o relacionamento pactual e a soberania do Criador frente ao universo material e à história humana. A preservação milenar deste texto com acentuação e sinais massoréticos (Niqqud) permite reconstruir detalhadamente a pronúncia vocalizada original e a carga dramática e litúrgica pretendida para a proclamação das Escrituras em Israel. Cada elemento linguístico convida o estudante a aprofundar-se na imutabilidade das verdades divinas.`;

    const generatedExplanation = `Para explicar este versículo fielmente a partir do original hebraico, mostre à congregação que a estrutura gramatical coloca a ação e o caráter de Deus no centro da mensagem. Destaque que a tradução bíblica em português ganha muito mais força e precisão quando compreendemos as palavras originais. Se o versículo menciona ${hasYHVH ? 'o Nome Sagrado e inefável do Eterno (YHVH)' : ''}${hasElohim ? (hasYHVH ? ' e ' : '') + 'o Deus de Soberania Absoluta (Elohim)' : ''}${!hasYHVH && !hasElohim ? 'a aliança de Deus' : ''}, ajude as pessoas a entenderem que isso denota fidelidade eterna e o plano infalível do Senhor. Este discernimento é crucial para que nossa fé não seja baseada em sentimentos superficiais, mas no conhecimento sólido da Revelação divina.`;

    const generatedHomiletics = `Esboço Temático para Pregação Fiel (Exposição de ${ref}):\n1. O Fundamento Teocêntrico das Escrituras: Como este texto exalta o caráter, a palavra e a autoridade ativa de Deus acima de expectativas humanas.\n2. A Compreensão Correta da Verdade Original: Por que precisamos entender o significado real das palavras-chave hebraicas e sua conexão direta com a aliança espiritual.\n3. Chamada Prática e Resposta de Fé: Como a congregação pode aplicar esta instrução pura em suas decisões diárias, servindo e honrando o Nome do Eterno com integridade.`;

    const generatedSermon = `Sermão Expositivo Completo: "Vivendo na Presença do Eterno e Obedecendo à Sua Palavra"\n\nINTRODUÇÃO:\nAo expormos a Palavra de Deus em ${ref} hoje no púlpito, somos confrontados com a necessidade urgente de conhecermos as bases originais da nossa fé. No hebraico bíblico, cada vocábulo carrega uma força idiomática e espiritual que muitas vezes passa desapercebida em nossas traduções regulares. A pregação de hoje visa expor a soberania divina e o chamado prático para as nossas vidas através dAquele que nos chamou das trevas para a Sua maravilhosa luz.\n\nPONTO 1: A REVELAÇÃO DO CARÁTER DO SENHOR\nA base de toda pregação correta deve ser a Pessoa e os atributos de Deus. O texto original nos apresenta a santidade e o compromisso da divindade. ${hasYHVH ? 'O Nome inefável de YHVH (iavé) nos lembra dAquele que É, Era e Há de Ser, sustentando Suas promessas covenants.' : 'A palavra divina nos confronta com a necessidade de submissão humilde ao Seu reinado eterno.'}\n\n• Versículo Cruzado 1: Êxodo 3:14\n  -> Texto: "E disse Deus a Moisés: EU SOU O QUE SOU. Disse mais: Assim dirás aos filhos de Israel: EU SOU me enviou a vós."\n  -> Explicação da Referência Cruzada: Explique à congregação que quando o Nome do Senhor está envolvido, Ele revela Sua fidelidade inabalável e Sua presença constante. Deus não é uma força distante; Ele é a Fonte de Vida ativa. Pregar esta verdade significa declarar à igreja que, independentemente da dor ou angústia, o Deus da aliança está presente na história de cada filho Seu.\n\n• Versículo Cruzado 2: Salmo 23:1\n  -> Texto: "O SENHOR é o meu pastor, nada me faltará."\n  -> Explicação da Referência Cruzada: O salmista une a realeza de YHVH ao Seu cuidado protetor. Ensine de forma compreensível ao rebanho que o governo soberano do Eterno não serve para nos escravizar, mas para nos conduzir em pastos verdes de paz e salvação eterna.\n\nPONTO 2: A SUPREMACIA E A AUTORIDADE DA PALAVRA REVELADA\nNo original, a comunicação de Deus tem precedência. ${hasDavar ? 'O vocábulo DËVAR (Palavra) é a manifestação tangível do pensamento divino, que ordena o cosmo e estabelece a verdade absoluta.' : 'Os verbos no texto exigem uma atitude imediata de respeito e reverência diante dAquele que nos instrui e santifica.'}\n\n• Versículo Cruzado 1: Isaías 40:8\n  -> Texto: "Seca-se a erva, e cai a flor, porém a palavra de nosso Deus permanece eternamente."\n  -> Explicação da Referência Cruzada: Este cruzamento enfatiza que enquanto a sabedoria humana e as modas teológicas são transitórias, a Palavra pura do Eterno permanece imutável e inabalável. Explique aos ouvintes no púlpito que construir a vida sobre filosofias humanas é construir na areia; nossa única base firme é a verdade das Escrituras Sagradas.\n\n• Versículo Cruzado 2: João 14:15\n  -> Texto: "Se me amais, guardai os meus mandamentos."\n  -> Explicação da Referência Cruzada: O Messias une intimidade amorosa a obediência doutrinária prática. Explique de forma enfática que não existe "comunhão com o Eterno" sem a prática ativa da Sua instrução pura, a qual Ele preservou com tanto amor para nós.\n\nPONTO 3: A ALIANÇA ESPIRITUAL E A RESPOSTA ATIVA DO SER HUMANO\nA exegese da Palavra de Deus serve como escudo contra falsos ensinamentos e nos atrai a um compromisso inegociável de vida santa perante o Criador.\n\n• Versículo Cruzado: Romanos 10:17\n  -> Texto: "De sorte que a fé é pelo ouvir, e o ouvir pela palavra de Deus."\n  -> Explicação da Referência Cruzada: O apóstolo Paulo estabelece que a verdadeira fé bíblica é gerada através da proclamação fiel e da escuta reverente da Palavra pura de Deus (o Rhema divino). Ao pregar este ponto, instrua a igreja que o estudo exegético nos nutre espiritualmente e nos prepara para sermos testemunhas irrepreensíveis no mundo.\n\nCONCLUSÃO E APELO:\nO Senhor de toda a criação nos chamou à fidelidade e à glória. Que a verdade original deste versículo transforme nosso caráter e alinhe nossa conduta diária. Convide cada ouvinte a render sua vida, seus projetos e sua vontade sob o controle amoroso dAquele que é o Alfa e o Ômega da nossa história. Amém.`;

    const getDynamicParsing = (w: typeof verse.words[0]) => {
      const t = w.transliteration.toLowerCase();
      
      if (t.includes('yhvh') || t.includes('yëhovåh') || t.includes('yhovåh') || t.includes('yahuah') || t.includes('yhwh')) return { parsing: 'Nome Próprio Teofórico', rootMeaning: 'O Nome Inefável de Deus (o Eterno que É, Era e Há de Ser). Raiz הָיָה (hayah - ser/existir). Strong H3068.' };
      if (t.includes('elohim') || t.includes('elohey')) return { parsing: 'Substantivo Plural Masculino', rootMeaning: 'Deus, plural de majestade da raiz אֵל (El - força, poder). Strong H430.' };
      if (t.includes('vayehi') || t.includes('vayëhy')) return { parsing: 'Verbo Qal Conversivo', rootMeaning: 'E veio a ser, e foi. Conjunção consecutiva acoplada à raiz de existência הָיָה. Strong H1961.' };
      if (t.includes('devar') || t.includes('dëvar') || t.includes('davar')) return { parsing: 'Substantivo Regente', rootMeaning: 'Palavra, assunto, revelação. Da raiz דָּבַר (falar, ordenar). Strong H1697.' };
      if (t.includes('el-') || t.includes('el ')) return { parsing: 'Preposição de Movimento', rootMeaning: 'Preposição "a", "para", "em direção a". Strong H413.' };
      if (t.includes('ven-') || t.includes('ven ') || t.includes('ben-')) return { parsing: 'Substantivo Singular Masc.', rootMeaning: 'Filho de, descendente, herdeiro. Raiz בָּנָה (construir/edificar a casa). Strong H1121.' };
      if (t.startsWith('ha-') || (t.startsWith('ha') && w.hebrew.startsWith('הַ'))) return { parsing: 'Artigo Definido Hebraico', rootMeaning: 'O artigo prefixado "Ha-" que especifica e singulariza o objeto direto na frase.' };
      if (t.startsWith('va-') || t.startsWith('ve-') || t.startsWith('u-') || t.startsWith('ve') || t.startsWith('va')) return { parsing: 'Conjunção Aditiva', rootMeaning: 'Conjunção coordenativa prefixada "e" que conecta as ações e orações.' };
      
      let generalParsing = 'Substantivo / Partícula';
      let generalRoot = `Palavra hebraica associada ao contexto de ${w.portuguese || 'estudo'}.`;
      
      if (w.portuguese.toLowerCase().includes('disse') || w.portuguese.toLowerCase().includes('falou')) {
        generalParsing = 'Verbo de Ação Verbal';
        generalRoot = 'Raiz אָמַר (amar) ou דָּבַר (davar): comunicação e declaração ativa. Strong H559.';
      } else if (w.portuguese.toLowerCase().includes('terra')) {
        generalParsing = 'Substantivo Comum';
        generalRoot = 'Raiz אֶרֶץ (eretz): solo terrestre, terra habitável. Strong H776.';
      } else if (w.portuguese.toLowerCase().includes('mar')) {
        generalParsing = 'Substantivo Masculino';
        generalRoot = 'Raiz יָם (yam): grande massa de água, mar. Strong H3220.';
      } else if (w.portuguese.toLowerCase().includes('rei')) {
        generalParsing = 'Substantivo Regente Masc.';
        generalRoot = 'Raiz מֶלֶךְ (melekh): governante, rei soberano. Strong H4428.';
      }
      
      return { parsing: generalParsing, rootMeaning: generalRoot };
    };

    const wordAnalysis = verse.words.map(w => {
      const morph = getDynamicParsing(w);
      return {
        hebrew: w.hebrew,
        translit: w.transliteration,
        translation: w.portuguese,
        parsing: morph.parsing,
        rootMeaning: morph.rootMeaning
      };
    });

    rawData = {
      commentary: generatedCommentary,
      theology: generatedTheology,
      explanation: generatedExplanation,
      homiletics: generatedHomiletics,
      sermon: generatedSermon,
      wordAnalysis
    };
  }

  if (isJudaicMode) {
    return {
      commentary: translateToJudaic(rawData.commentary, true),
      theology: translateToJudaic(rawData.theology, true),
      explanation: translateToJudaic(rawData.explanation, true),
      homiletics: translateToJudaic(rawData.homiletics, true),
      sermon: translateToJudaic(rawData.sermon, true),
      wordAnalysis: rawData.wordAnalysis.map(w => ({
        ...w,
        translit: getJudaicTransliteration(w.translit, true),
        translation: translateToJudaic(w.translation, true),
        rootMeaning: translateToJudaic(w.rootMeaning, true)
      }))
    };
  }

  return rawData;
};

export const Reader: React.FC<ReaderProps> = ({ book, onOpenSidebar, isJudaicMode, onToggleJudaicMode }) => {
  const [chapter, setChapter] = useState(1);
  const [totalChapters, setTotalChapters] = useState(1);
  const [playingVerse, setPlayingVerse] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);

  // Estados dos Novos Recursos Adicionados
  const [showNiqqud, setShowNiqqud] = useState(true);
  const [audioSpeed, setAudioSpeed] = useState(0.35); // Velocidade do áudio padrão ultra-compreensível (0.35x)
  const [verseQuery, setVerseQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'chapter' | 'book'>('chapter');
  const [searchResults, setSearchResults] = useState<Verse[]>([]);
  const [isSearchingBook, setIsSearchingBook] = useState(false);
  const [selectedExegesisVerse, setSelectedExegesisVerse] = useState<Verse | null>(null);

  // Fonte de Áudio: 'original' (Hebraico real) ou 'transliterated' (Transliteração lida em PT)
  const [audioSource, setAudioSource] = useState<'original' | 'transliterated'>('transliterated');
  const [hasHebrewVoice, setHasHebrewVoice] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Detecta se existe alguma voz nativa em Hebraico no sistema/navegador
  useEffect(() => {
    const detectHebrewVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const hasHe = voices.some(v => v.lang.toLowerCase().startsWith('he'));
      setHasHebrewVoice(hasHe);
      // Se houver voz nativa em Hebraico, prioriza a leitura na língua original!
      if (hasHe) {
        setAudioSource('original');
      }
    };
    detectHebrewVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = detectHebrewVoice;
    }
  }, []);

  // Reset chapter when book changes and load book dynamically if not cached
  useEffect(() => {
    setChapter(1);
    setVerseQuery(''); // Limpa a barra de busca ao trocar de livro
    setSelectedExegesisVerse(null); // Fecha painel de exegese ao trocar de livro
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // Rola o container para o topo imediatamente (Capítulo 1, Versículo 1)
    setTimeout(() => {
      const scrollContainer = document.querySelector('.reader-content');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    }, 50);
    
    const loadBook = async () => {
      // If this book is already being loaded in a parallel thread, wait for it
      if (loadingBooks.has(book.abbrev)) {
        for (let i = 0; i < 20; i++) { // Wait up to 3 seconds (20 * 150ms)
          await new Promise(resolve => setTimeout(resolve, 150));
          if (!loadingBooks.has(book.abbrev)) break;
        }
        // After waiting, verify if the book is now loaded in IndexedDB
        const cachedVerses = await db.verses.where('book_abbrev').equals(book.abbrev).toArray();
        if (cachedVerses.length > 0) {
          const chapters = new Set(cachedVerses.map(v => v.chapter));
          setTotalChapters(chapters.size || 1);
          return;
        }
      }

      loadingBooks.add(book.abbrev);
      setIsFetching(true);
      setDownloadProgress(null);
      try {
        // 1. Check if we already have verses for this book in IndexedDB
        let existingVersesCount = await db.verses.where('book_abbrev').equals(book.abbrev).count();
        
        // Self-healing: Check for duplicate verses (e.g., if total cached verses > unique chapter:verse keys)
        if (existingVersesCount > 0) {
          const cachedVerses = await db.verses.where('book_abbrev').equals(book.abbrev).toArray();
          const uniqueKeys = new Set(cachedVerses.map(v => `${v.chapter}:${v.verse}`));
          
          if (cachedVerses.length > uniqueKeys.size) {
            console.warn(`Deteção de duplicados para ${book.name}. Limpando banco local e reimportando...`);
            await db.verses.where('book_abbrev').equals(book.abbrev).delete();
            existingVersesCount = 0;
          }
        }
        
        if (existingVersesCount === 0) {
          // 2. Fetch from the local dynamic endpoint
          setDownloadProgress('Baixando texto...');
          const response = await fetch(`db/${book.abbrev}.json`);
          if (!response.ok) {
            throw new Error(`Failed to fetch book data: ${response.statusText}`);
          }
          
          setDownloadProgress('Processando dados...');
          const versesData = await response.json();
          
          setDownloadProgress('Salvando offline...');
          await db.verses.bulkAdd(versesData);
          console.log(`Successfully cached ${versesData.length} verses of ${book.name} offline!`);
        }
        
        // 3. Load from IndexedDB to compute chapters
        const cachedVerses = await db.verses.where('book_abbrev').equals(book.abbrev).toArray();
        const chapters = new Set(cachedVerses.map(v => v.chapter));
        setTotalChapters(chapters.size || 1);
      } catch (error) {
        console.error(`Failed to load book ${book.name}:`, error);
      } finally {
        loadingBooks.delete(book.abbrev);
        setIsFetching(false);
        setDownloadProgress(null);
      }
    };
    
    loadBook();
  }, [book]);

  const verses = useLiveQuery(
    () => db.verses.where({ book_abbrev: book.abbrev, chapter }).toArray(),
    [book.abbrev, chapter]
  );

  // Efeito reativo para busca no livro inteiro usando IndexedDB
  useEffect(() => {
    if (!verseQuery || searchMode !== 'book') {
      setSearchResults([]);
      return;
    }
    
    const performSearch = async () => {
      setIsSearchingBook(true);
      try {
        const q = verseQuery.toLowerCase();
        const results = await db.verses
          .where('book_abbrev')
          .equals(book.abbrev)
          .filter(v => 
            v.text_pt.toLowerCase().includes(q) ||
            v.words.some(w => 
              w.portuguese.toLowerCase().includes(q) ||
              w.transliteration.toLowerCase().includes(q) ||
              w.hebrew.toLowerCase().includes(q) ||
              removeNiqqud(w.hebrew).toLowerCase().includes(q)
            )
          )
          .toArray();
        
        // Remove duplicados e ordena cronologicamente por capítulo e versículo
        const uniqueResults = Array.from(new Map(results.map(v => [`${v.chapter}:${v.verse}`, v])).values())
          .sort((a, b) => a.chapter === b.chapter ? a.verse - b.verse : a.chapter - b.chapter);
        
        setSearchResults(uniqueResults);
      } catch (error) {
        console.error("Erro na busca de versículos:", error);
      } finally {
        setIsSearchingBook(false);
      }
    };

    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [verseQuery, searchMode, book.abbrev]);

  const prevChapter = () => {
    if (chapter > 1) setChapter(c => c - 1);
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const nextChapter = () => {
    if (chapter < totalChapters) setChapter(c => c + 1);
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChapter(Number(e.target.value));
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const playAudio = (verse: Verse) => {
    const verseId = verse.id!;
    if (playingVerse === verseId) {
      window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingVerse(null);
      return;
    }

    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingVerse(verseId);

    // Só considera que tem áudio real se os carimbos de tempo forem maiores que zero (evita silêncio em Números e outros livros sem MP3)
    const hasRecordedAudio = verse.audio_start !== undefined && verse.audio_end !== undefined && (verse.audio_start > 0 || verse.audio_end > 0);

    if (hasRecordedAudio && audioSource === 'transliterated') {
      const meta = bookAudioMetadata[verse.book_abbrev.toLowerCase()];
      if (meta) {
        const sederPadded = String(meta.seder).padStart(3, '0');
        const chapterPadded = String(verse.chapter).padStart(3, '0');
        const mp3Url = `https://hebraico.pro.br/girsaot/he/biblia/mp3/${sederPadded}_${meta.qod}/${meta.qod}_${chapterPadded}.mp3`;

        const audio = new Audio(mp3Url);
        audioRef.current = audio;

        // Mapeamento inteligente de velocidade para o áudio humano para evitar distorção
        let playbackRate = 1.0;
        if (audioSpeed === 0.25) playbackRate = 0.7;
        else if (audioSpeed === 0.35) playbackRate = 0.8;
        else if (audioSpeed === 0.50) playbackRate = 0.9;
        else if (audioSpeed === 0.65) playbackRate = 1.0;
        audio.playbackRate = playbackRate;

        // Inicia na marcação de tempo correta
        audio.currentTime = verse.audio_start!;

        const handleTimeUpdate = () => {
          if (audio.currentTime >= verse.audio_end!) {
            audio.pause();
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            if (audioRef.current === audio) {
              audioRef.current = null;
            }
            setPlayingVerse(null);
          }
        };

        const handleEnded = () => {
          audio.removeEventListener('timeupdate', handleTimeUpdate);
          if (audioRef.current === audio) {
            audioRef.current = null;
          }
          setPlayingVerse(null);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', (err) => {
          console.error("Erro ao reproduzir MP3 da fonte, caindo para sintetizador grave:", err);
          audio.removeEventListener('timeupdate', handleTimeUpdate);
          if (audioRef.current === audio) {
            audioRef.current = null;
          }
          playTTS(verse);
        });

        audio.play().catch(err => {
          console.error("Falha no play() do áudio local:", err);
          playTTS(verse);
        });
        return;
      }
    }

    playTTS(verse);
  };

  const playTTS = (v: Verse) => {
    let textToSpeak = '';
    let lang = 'pt-BR';

    if (audioSource === 'original') {
      textToSpeak = v.words
        .map(w => showNiqqud ? w.hebrew : removeNiqqud(w.hebrew))
        .join(' ');
      lang = 'he-IL';
    } else {
      textToSpeak = v.words
        .map(w => w.transliteration.toLowerCase())
        .join(', ') // Adiciona uma pausa natural e nítida entre cada palavra para permitir o entendimento pausado
        .replace(/yhvh/g, 'iavé') // Pronúncia do Tetragrama Sagrado de forma solene
        .replace(/ë/g, 'e')
        .replace(/å/g, 'a')
        .replace(/sh/g, 'ch')
        .replace(/y/g, 'i') // Mapeia y para i para evitar que o leitor soletre a letra
        .replace(/q/g, 'c') // Mapeia q para c para som mais natural
        .replace(/kh/g, 'c') // Ajusta kh para c
        .replace(/h\b/g, '') // Remove o h mudo no fim das sílabas/palavras
        .replace(/-/g, ' ') // Substitui hifens por espaços para pausas mais limpas
        .replace(/,\s*,/g, ',') // Evita vírgulas duplicadas
        .replace(/:\s*,/g, ':'); // Evita acúmulo de pontuação
      lang = 'pt-BR';
    }
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang;
    // Mapeamento inteligente de velocidade para o sintetizador de voz (TTS) ajustado para ser verdadeiramente devagar e pausado
    let ttsRate = 0.55;
    if (audioSpeed === 0.25) ttsRate = 0.45;
    else if (audioSpeed === 0.35) ttsRate = 0.55; // Velocidade ideal padrão para escuta pausada e estudo de pronúncia
    else if (audioSpeed === 0.50) ttsRate = 0.70;
    else if (audioSpeed === 0.65) ttsRate = 0.85;
    utterance.rate = ttsRate;
    // Pitch de 0.95x para a transliteração em português garante um tom de voz humana natural, quente, nítida e extremamente agradável (evita distorção robótica do pitch 0.68)
    utterance.pitch = audioSource === 'original' ? 0.92 : 0.95;
    
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice;

    if (audioSource === 'original') {
      selectedVoice = voices.find(vo => vo.lang.toLowerCase().startsWith('he'));
    } else {
      // Filtragem rígida de gênero: obter apenas vozes em português que NÃO sejam femininas
      const ptBRVoices = voices.filter(vo => vo.lang.toLowerCase().replace('_', '-').includes('pt-br'));
      const ptBRMaleVoices = ptBRVoices.filter(vo => {
        const nameLower = vo.name.toLowerCase();
        // Lista restritiva de termos de vozes conhecidas femininas a serem totalmente evitadas
        const femaleKeys = [
          'francisca', 'maria', 'helena', 'zita', 'lucia', 'joana', 'yara', 'leila', 
          'leticia', 'female', 'mulher', 'girl', 'woman', 'elizabeth', 'clara', 'elza', 
          'giselle', 'heloisa', 'adriana', 'vivian', 'luciana', 'fernanda', 'gabriela', 
          'vitoria', 'marcia', 'patricia', 'sandra', 'female'
        ];
        return !femaleKeys.some(k => nameLower.includes(k));
      });

      // Prioridade 1: Microsoft Antonio Online (Natural) - a voz masculina mais idêntica e realística do Windows/Edge
      selectedVoice = ptBRMaleVoices.find(vo => {
        const nameLower = vo.name.toLowerCase();
        return nameLower.includes('antonio') && nameLower.includes('natural');
      });
      
      // Prioridade 2: Microsoft Daniel Online (Natural) - outra voz masculina de excelente qualidade neural
      if (!selectedVoice) {
        selectedVoice = ptBRMaleVoices.find(vo => {
          const nameLower = vo.name.toLowerCase();
          return nameLower.includes('daniel') && nameLower.includes('natural');
        });
      }
      
      // Prioridade 3: Qualquer outra voz "Natural" masculina/neutra
      if (!selectedVoice) {
        selectedVoice = ptBRMaleVoices.find(vo => vo.name.toLowerCase().includes('natural'));
      }
      
      // Prioridade 4: Daniel clássico (excelente timbre grave solene offline)
      if (!selectedVoice) {
        selectedVoice = ptBRMaleVoices.find(vo => vo.name.toLowerCase().includes('daniel'));
      }
      
      // Prioridade 5: Antonio clássico
      if (!selectedVoice) {
        selectedVoice = ptBRMaleVoices.find(vo => vo.name.toLowerCase().includes('antonio'));
      }
      
      // Prioridade 6: Qualquer outra voz masculina por tag
      if (!selectedVoice) {
        selectedVoice = ptBRMaleVoices.find(vo => {
          const nameLower = vo.name.toLowerCase();
          return nameLower.includes('male') || nameLower.includes('homem') || nameLower.includes('julio') || nameLower.includes('thiago') || nameLower.includes('duarte') || nameLower.includes('felipe');
        });
      }
      
      // Prioridade 7: Primeira voz masculina filtrada disponível
      if (!selectedVoice && ptBRMaleVoices.length > 0) {
        selectedVoice = ptBRMaleVoices[0];
      }
      
      // Prioridade 8: Se não houver voz masculina pré-filtrada, procura nas gerais por termos masculinos
      if (!selectedVoice) {
        selectedVoice = ptBRVoices.find(vo => {
          const nameLower = vo.name.toLowerCase();
          return nameLower.includes('antonio') || nameLower.includes('daniel') || nameLower.includes('julio') || nameLower.includes('thiago') || nameLower.includes('male') || nameLower.includes('homem');
        });
      }

      // Fallback absoluto final: primeira voz em português (se tudo falhar)
      if (!selectedVoice && ptBRVoices.length > 0) {
        selectedVoice = ptBRVoices[0];
      }
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => setPlayingVerse(null);
    utterance.onerror = () => setPlayingVerse(null);

    window.speechSynthesis.speak(utterance);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Filtra versículos duplicados pelo número do versículo para garantia absoluta de exibição limpa
  const uniqueVerses = verses
    ? Array.from(new Map(verses.map(v => [v.verse, v])).values()).sort((a, b) => a.verse - b.verse)
    : [];

  // Filtro de versículos em memória caso a pesquisa por "Neste Capítulo" esteja ativa
  const filteredVerses = uniqueVerses.filter(v => {
    if (!verseQuery || searchMode !== 'chapter') return true;
    const q = verseQuery.toLowerCase();
    return (
      v.text_pt.toLowerCase().includes(q) ||
      String(v.verse).includes(q) ||
      v.words.some(w => 
        w.portuguese.toLowerCase().includes(q) ||
        w.transliteration.toLowerCase().includes(q) ||
        w.hebrew.toLowerCase().includes(q) ||
        removeNiqqud(w.hebrew).toLowerCase().includes(q)
      )
    );
  });

  // Determina a lista final de versículos a ser exibida no leitor
  const displayVerses = searchMode === 'book' && verseQuery ? searchResults : filteredVerses;

  return (
    <div className="reader-container">
      <header className="reader-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn-icon" onClick={onOpenSidebar} style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}>
            <Menu size={20} />
          </button>
          <h2 className="book-title">{getJudaicBookName(book.abbrev, book.name, isJudaicMode)}</h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="chapter-selector">
            <button className="btn-icon" onClick={prevChapter} disabled={chapter <= 1}>
              <ChevronLeft size={20} />
            </button>
            
            <select 
              className="chapter-select" 
              value={chapter} 
              onChange={handleChapterChange}
              title="Selecione o capítulo"
            >
              {Array.from({ length: totalChapters }, (_, i) => i + 1).map(c => (
                <option key={c} value={c}>Capítulo {c}</option>
              ))}
            </select>
            
            <button className="btn-icon" onClick={nextChapter} disabled={chapter >= totalChapters}>
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)', margin: '0 0.5rem' }} />
          <ThemeToggle />
        </div>
      </header>

      {/* Barra de Ferramentas Rápida para Configurações Adicionais */}
      <div className="reader-toolbar">
        {/* Seletor de Tradução Judaica (Stern) vs Tradução Padrão */}
        <div className="toolbar-controls-group">
          <span className="control-label">Versão de Leitura:</span>
          <div className="segmented-control">
            <button 
              className={`segmented-btn ${isJudaicMode ? 'active' : ''}`} 
              onClick={onToggleJudaicMode}
              title="Utilizar terminologia e nomes hebraicos originais da Bíblia Judaica Completa"
            >
              Versão Judaica (Stern)
            </button>
            <button 
              className={`segmented-btn ${!isJudaicMode ? 'active' : ''}`} 
              onClick={onToggleJudaicMode}
              title="Utilizar tradução literal padrão em português"
            >
              Tradução Padrão (Literal)
            </button>
          </div>
        </div>

        {/* Toggle Premium de Sinais Massoréticos */}
        <div className="toolbar-controls-group">
          <span className="control-label">Texto Original:</span>
          <div className="segmented-control">
            <button 
              className={`segmented-btn ${showNiqqud ? 'active' : ''}`} 
              onClick={() => setShowNiqqud(true)}
              title="Exibir texto original hebraico vocalizado com sinais massoréticos (Niqqud)"
            >
              Com Sinais
            </button>
            <button 
              className={`segmented-btn ${!showNiqqud ? 'active' : ''}`} 
              onClick={() => setShowNiqqud(false)}
              title="Exibir texto original hebraico puro consonantal sem sinais massoréticos"
            >
              Sem Sinais
            </button>
          </div>
        </div>

        {/* Seleção do Tipo de Áudio (Hebraico vs Transliterado) */}
        <div className="toolbar-controls-group">
          <span className="control-label">Pronúncia do Áudio:</span>
          <div className="segmented-control">
            <button 
              className={`segmented-btn ${audioSource === 'original' ? 'active' : ''}`} 
              onClick={() => setAudioSource('original')}
              title="Ouvir a leitura lida na língua original (Hebraico he-IL) baseada no texto ativo (com/sem sinais)"
            >
              Hebraico
            </button>
            <button 
              className={`segmented-btn ${audioSource === 'transliterated' ? 'active' : ''}`} 
              onClick={() => setAudioSource('transliterated')}
              title="Ouvir a leitura com a transliteração aproximada em Português"
            >
              Transliterado
            </button>
          </div>
          {!hasHebrewVoice && audioSource === 'original' && (
            <span style={{ fontSize: '0.7rem', color: 'var(--brand-primary)', fontWeight: '600' }}>
              💡 Voz hebraica indisponível no navegador. Usando fallback transliterado.
            </span>
          )}
        </div>

        {/* Seletor Dinâmico de Velocidade do Áudio */}
        <div className="toolbar-controls-group">
          <span className="control-label">Velocidade do Áudio:</span>
          <div className="speed-btn-group">
            {[0.25, 0.35, 0.50, 0.65].map(speed => (
              <button 
                key={speed} 
                className={`speed-badge ${audioSpeed === speed ? 'active' : ''}`} 
                onClick={() => setAudioSpeed(speed)}
                title={`Ajustar velocidade de áudio para ${speed}x`}
              >
                {speed === 0.35 ? '0.35x (Recom.)' : `${speed}x`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="reader-content">
        <div className="text-container">
          {/* Barra de Pesquisa de Versículos e Palavras */}
          <div className="verse-search-container">
            <div className="verse-search-box">
              <Search size={18} className="verse-search-icon" />
              <input 
                type="text" 
                placeholder={`Pesquisar por texto, versículo ou raiz hebraica em ${getJudaicBookName(book.abbrev, book.name, isJudaicMode)}...`}
                value={verseQuery}
                onChange={(e) => setVerseQuery(e.target.value)}
                className="verse-search-input"
              />
              {verseQuery && (
                <button className="verse-search-clear" onClick={() => setVerseQuery('')} title="Limpar busca">
                  <X size={16} />
                </button>
              )}
            </div>
            
            {verseQuery && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', alignItems: 'center' }}>
                <span className="control-label" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Escopo da Pesquisa:</span>
                <div className="segmented-control" style={{ borderRadius: '12px' }}>
                  <button 
                    className={`segmented-btn ${searchMode === 'chapter' ? 'active' : ''}`} 
                    onClick={() => setSearchMode('chapter')}
                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: '10px' }}
                  >
                    Neste Capítulo
                  </button>
                  <button 
                    className={`segmented-btn ${searchMode === 'book' ? 'active' : ''}`} 
                    onClick={() => setSearchMode('book')}
                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: '10px' }}
                  >
                    No Livro Inteiro
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Banner informativo de resultados da busca */}
          {searchMode === 'book' && verseQuery && (
            <div className="search-results-banner">
              <span>
                {isSearchingBook 
                  ? 'Pesquisando na base local IndexedDB...' 
                  : `Encontrados ${searchResults.length} versículos contendo "${verseQuery}" no livro de ${getJudaicBookName(book.abbrev, book.name, isJudaicMode)}`}
              </span>
              {searchResults.length > 0 && !isSearchingBook && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Use os botões para ouvir ou exegese rápida</span>
              )}
            </div>
          )}

          {isFetching || !verses ? (
            <div className="loading-container" style={{ height: '50vh', gap: '1.5rem', background: 'transparent' }}>
              <div className="spinner"></div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '1.1rem' }}>
                  {downloadProgress ? `Preparando o livro de ${getJudaicBookName(book.abbrev, book.name, isJudaicMode)}` : 'Carregando versículos...'}
                </p>
                {downloadProgress && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    {downloadProgress} • Acesso offline ativado
                  </p>
                )}
              </div>
            </div>
          ) : displayVerses.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
              Nenhum versículo ou palavra correspondente encontrada.
            </p>
          ) : (
            displayVerses.map(v => (
              <div key={v.id} className="verse-container">
                <div className="verse-header">
                  <span className="verse-number">
                    {searchMode === 'book' && verseQuery ? `${v.chapter}:${v.verse}` : `${chapter}.${v.verse}`}
                  </span>
                  
                  <p className="verse-text-pt">{translateToJudaic(v.text_pt, isJudaicMode)}</p>
                  
                  <div className="verse-actions">
                    {/* Botão de Atalho para Saltos de Capítulo durante busca geral */}
                    {searchMode === 'book' && verseQuery && v.chapter !== chapter && (
                      <button 
                        className="btn-jump-chapter"
                        onClick={() => {
                          setChapter(v.chapter);
                          setSearchMode('chapter');
                          setVerseQuery('');
                          // Adiciona pequena rolagem suave
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        title={`Navegar para o Capítulo ${v.chapter}`}
                      >
                        Cap. {v.chapter}
                      </button>
                    )}

                    {/* Novo Botão de Exegese Avançada */}
                    <button 
                      className={`btn-exegesis ${selectedExegesisVerse?.id === v.id ? 'active' : ''}`}
                      onClick={() => setSelectedExegesisVerse(v)}
                      title={`Análise Exegética Detalhada para este versículo`}
                    >
                      <BookOpen size={14} />
                      <span>Exegese</span>
                    </button>
                    
                    <button 
                      className="btn-play" 
                      onClick={() => playAudio(v)}
                      title="Ouvir Transliteração / Hebraico"
                    >
                      {playingVerse === v.id ? <Square size={16} /> : <Play size={16} fill="currentColor" />}
                    </button>
                  </div>
                </div>
                
                <div className="interlinear-row">
                  {v.words.map((word, idx) => (
                    <div key={idx} className="word-block">
                      <span className="word-hebrew">
                        {showNiqqud ? word.hebrew : removeNiqqud(word.hebrew)}
                      </span>
                      <span className="word-transliteration">
                        {getJudaicTransliteration(word.transliteration, isJudaicMode)}
                      </span>
                      <span className="word-portuguese">{translateToJudaic(word.portuguese, isJudaicMode)}</span>
                      <span className="word-number">{word.number}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Painel Deslizante de Exegese Premium (Glassmorphic Slide-up Drawer) */}
      <div 
        className={`exegesis-drawer-overlay ${selectedExegesisVerse ? 'open' : ''}`} 
        onClick={() => setSelectedExegesisVerse(null)} 
      />
      
      <div className={`exegesis-drawer ${selectedExegesisVerse ? 'open' : ''}`}>
        <div className="exegesis-drawer-handle" />
        
        {selectedExegesisVerse && (() => {
          const exeData = getExegesisData(selectedExegesisVerse, getJudaicBookName(book.abbrev, book.name, isJudaicMode), isJudaicMode);
          return (
            <>
              <div className="exegesis-drawer-header">
                <div className="exegesis-drawer-title-group">
                  <h3>Estudo & Análise Exegética</h3>
                  <p>{getJudaicBookName(book.abbrev, book.name, isJudaicMode)} {selectedExegesisVerse.chapter}:{selectedExegesisVerse.verse} • Texto Interlinear do Original</p>
                </div>
                <button className="btn-icon" onClick={() => setSelectedExegesisVerse(null)} title="Fechar análise">
                  <X size={20} />
                </button>
              </div>
              
              <div className="exegesis-drawer-content">
                {/* Seção 1: Exibição do versículo original hebraico comparado com tradução */}
                <div className="exegesis-section">
                  <div className="exegesis-section-title">
                    <BookOpen size={16} />
                    <span>Texto no Original & Tradução</span>
                  </div>
                  <div className="exegesis-verses-display">
                    <div className="exegesis-original-hebrew">
                      {showNiqqud 
                        ? selectedExegesisVerse.words.map(w => w.hebrew).join(' ')
                        : selectedExegesisVerse.words.map(w => removeNiqqud(w.hebrew)).join(' ')}
                    </div>
                    <div className="exegesis-pt-translation">
                      {translateToJudaic(selectedExegesisVerse.text_pt, isJudaicMode)}
                    </div>
                  </div>
                </div>

                {/* Seção 2: Tabela de morfologia e análise palavra por palavra */}
                <div className="exegesis-section">
                  <div className="exegesis-section-title">
                    <BookOpen size={16} />
                    <span>Morfologia e Análise Filológica Palavra por Palavra</span>
                  </div>
                  <div className="morphology-container">
                    <table className="morphology-table">
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Hebreu Original</th>
                          <th>Transliteração</th>
                          <th>Tradução Lit.</th>
                          <th>Morfologia / Classe</th>
                          <th>Significado da Raiz / Strong</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exeData.wordAnalysis.map((word, idx) => (
                          <tr key={idx}>
                            <td className="morphology-hebrew" style={{ paddingRight: '2rem' }}>
                              {showNiqqud ? word.hebrew : removeNiqqud(word.hebrew)}
                            </td>
                            <td className="morphology-translit">{word.translit}</td>
                            <td className="morphology-portuguese">{word.translation || '—'}</td>
                            <td>
                              <span className="morphology-parsing">{word.parsing}</span>
                            </td>
                            <td className="morphology-root">{word.rootMeaning}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Seção 3: Comentário erudito histórico-teológico */}
                <div className="exegesis-section">
                  <div className="exegesis-section-title">
                    <BookOpen size={16} />
                    <span>Comentário Teológico e Hermenêutica Erudita</span>
                  </div>
                  <div className="commentary-rich-text">
                    <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--brand-primary)' }}>Análise Contextual e Linguística:</p>
                    <p style={{ marginBottom: '1.5rem' }}>{exeData.commentary}</p>
                    <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--brand-primary)' }}>Implicações Teológicas e Significado Histórico:</p>
                    <p>{exeData.theology}</p>
                  </div>
                </div>
                {/* Seção 4: Guia de Explicação & Esboço de Pregação Expositiva */}
                <div className="exegesis-section">
                  <div className="exegesis-section-title">
                    <BookOpen size={16} />
                    <span>Aplicação Prática & Guia de Pregação Fiel</span>
                  </div>
                  <div className="commentary-rich-text">
                    <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--brand-primary)' }}>Como explicar o versículo a partir do hebraico original:</p>
                    <p style={{ marginBottom: '1.5rem' }}>{exeData.explanation}</p>
                    
                    <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--brand-primary)' }}>Esboço Homilético para Pregação Correta:</p>
                    <div style={{ whiteSpace: 'pre-line', lineHeight: '1.7', color: 'var(--text-primary)' }}>
                      {exeData.homiletics}
                    </div>
                  </div>
                </div>

                {/* Seção 5: Roteiro de Pregação Completo & Referências Cruzadas */}
                <div className="exegesis-section">
                  <div className="exegesis-section-title">
                    <BookOpen size={16} />
                    <span>Sermão Expositivo Completo & Referências Cruzadas</span>
                  </div>
                  <div className="commentary-rich-text">
                    <p style={{ fontWeight: '600', marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>Roteiro de Pregação Integrado com Termos Originais e Referências Explicadas:</p>
                    <div style={{ 
                      whiteSpace: 'pre-line', 
                      lineHeight: '1.8', 
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-accent)',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      marginTop: '0.5rem',
                      fontSize: '0.98rem',
                      textAlign: 'justify'
                    }}>
                      {exeData.sermon}
                    </div>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};
