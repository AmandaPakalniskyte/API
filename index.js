const PORT = process.env.PORT || 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()

const newspapers = [
    {
        name:"guardian",
        address:"https://www.theguardian.com/uk/culture",
        base: "",
        imageUrl:""
    },
    {
        name:"independent",
        address:"https://www.independent.co.uk/topic/movies",
        base: ""
    },
    {
        name:"cnn",
        address:"https://edition.cnn.com/entertainment/movies",
        base: "https://edition.cnn.com"
    }
]

// -----------GET ALL ARTICLES FROM ALL NEWSPAPERS------------

const articles = []

newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
        .then((response) => {
            const html = response.data
            const $ = cheerio.load(html)

            $('a:contains("movie")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')
                articles.push({
                    title: ((title.replace(/\r?\n|\r/g, "")).replace(/  +/g, ' ')).trimLeft().trimRight(),
                    url: newspaper.base + url,
                    source: newspaper.name,  
                })
            })  
        })
})

app.get('/', (req, res) => {
    res.json('Welcome to my API')
})

app.get('/movies', (req, res) => {
    res.json(articles)
})



// --------------GET ALL ARTICLES JUST FROM ONE NEWSPAPER-------------


app.get('/movies/:newspaperId', (req, res) => {
    const newspaperId = req.params.newspaperId
    const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].address
    const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].base

    axios.get(newspaperAddress)
         .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const specificArticles = []

            $('a:contains("movie")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')
                specificArticles.push({
                    title: ((title.replace(/\r?\n|\r/g, "")).replace(/  +/g, ' ')).trimLeft().trimRight(),
                    url: newspaperBase + url,
                    source: newspaperId,
                })
            })
            res.json(specificArticles)
         }).catch(err => console.log(err))
})

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
