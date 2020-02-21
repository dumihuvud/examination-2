import { messageResponse_, question_, alt_, quizForm_, template_ } from './templates.js'

export class Test extends window.HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template_.content.cloneNode(true))

    this._start = this.shadowRoot.querySelector('button')
    this._container = this.shadowRoot.querySelector('.container')
    this._inputField = this.shadowRoot.querySelector('.inputfield')

    this.questionURL = 'http://vhost3.lnu.se:20080/question/1'
    this.answerURL = ''
    this.answerParsed = ''
    this.firstQuestion = true
  }

  static get observedAttributes () {
    return []
  }

  attributeChangedCallback () {

  }

  connectedCallback () {
    this._start.addEventListener('click', event => {
      this.startQuiz()
    })
  }

  disconnectedCallback () {
    this._start.addEventListener('click', event => {
      this.startQuiz()
    })
  }

  /**
   * Quiz game logic
   * TODOs:needs a timer
   */
  startQuiz () {
    while (this._container.firstChild) {
      this._container.removeChild(this._container.lastChild)
    }
    this._search(this.questionURL)
  }

  /**
   * Gets the response from the server
   * @param {url} questionURL
   */
  async _search (questionURL) {
    let searchResult = await window.fetch(questionURL)

    searchResult = await searchResult.json()

    this.parser(searchResult)
  }

  async renderResult () {
    const pTag = document.createElement('p')
    pTag.innerText = await this.parsedResponse.message
    console.log(this.parsedResponse)
    this._container.appendChild(pTag)
  }

  /**
   * Parses throgh obj and gets entries and values. Creates nodes based on values.
   * @param {json Object} searchResult
   */
  async parser (searchResult) {
    console.log(searchResult)
    if (!('alternatives' in searchResult)) {
      this._inputField.appendChild(quizForm_.content.cloneNode(true))
      const input = this.shadowRoot.querySelector('#answer')
      input.addEventListener('keydown', async event => {
        if (event.key === 'Enter') {
          const answer = input.value
          await this.sendAnswer(this.answerURL, answer)
          await this.renderResult()
        }
      })
    }
    for (const [key, value] of Object.entries(searchResult)) {
      switch (key) {
        case 'id':
          break
        case 'message':
          break
        case 'question':
          question_.innerHTML = `<p>${value}</p>`
          this._container.appendChild(question_.content.cloneNode(true))
          break
        case 'alternatives':
          for (const [key, val] of Object.entries(value)) {
            // answer should be 'alt1'
            alt_.innerHTML = `<button>${val}</button>`
            this._container.appendChild(alt_.content.cloneNode(true))
          }
          break
        case 'nextURL':
          // console.log(value)
          //   !! figure out !!
          this.answerURL = value
          break
        default:
          break
      }
    }
    if (this.firstQuestion) {
      console.log('frist')
    } else {
      this.sendAnswer(this.answerURL)
    }
    this.firstQuestion = false
  }

  /**
   * sends the answer to server and gets response
   * ${inputVal}
   */
  async sendAnswer (answerURL, answerParsed) {
    console.log(answerParsed)
    // let temp = JSON.stringify(answerParsed)
    const temp = answerParsed
    console.log(answerParsed)
    const data = { answer: temp }
    const settings = {
      method: 'Post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)

    }
    try {
      console.log(answerURL)
      const fetchResponse = await window.fetch(answerURL, settings)
      const data = await fetchResponse.json()
      console.log(data)
      this.parsedResponse = data
      return data
    } catch (error) {
      console.log(error)
      return error
    }
  }

  _getVal () {
    let inputValue
    const input = this.shadowRoot.querySelector('#answer')
    input.addEventListener('keydown', event => {
      inputValue = input.value + String.fromCharCode(event.which)
      if (event.keyCode === 13) {
        this.answerURL = inputValue
        console.log(inputValue)
      }
    })
  }
}

window.customElements.define('x-test', Test)

/**
 * TODO:
 * create a function to get input field answer
 * send the answer to sendAnswer()
 */
