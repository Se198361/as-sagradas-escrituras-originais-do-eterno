const axios = require('axios');
axios.get('https://hebraico.pro.br/biblia/livros/pt-BR').then(res => {
    const matches = [...res.data.matchAll(/href="\/biblia\/pt-BR\+he_pt-BR\/(.*?)\/1\/1\/pt-BR"/g)];
    matches.forEach(m => console.log(m[1]));
}).catch(err => console.log('error'));
