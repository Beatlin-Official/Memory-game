const GAME_STATE = {
    FirstCardAwaits: 'FirstCardAwaits',
    SecondCardAwaits: 'SecondCardAwaits',
    CardsMatchFailed: 'CardsMatchFailed',
    CardsMatched: 'CardsMatched',
    GameFinished: 'GameFinished',
}

const Symbols = [
    './img/poker-spade.png',
    './img/poker-heart.png',
    './img/poker-diamond.png',
    './img/poker-club.png'
]

const utility = {
    getRandomNumberArray(count) {
        const number = Array.from(Array(count).keys())
        for (let index = number.length - 1; index > 0; index--) {
            let randomIndex = Math.floor(Math.random() * (index + 1));
            [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
        }
        return number
    }
}

const model = {
    revealedCards: [],
    isRevealedCardsMatched() {
        return this.revealedCards[0].dataset.index % 13 ===
            this.revealedCards[1].dataset.index % 13
    },
    score: 0,
    triedTimes: 0
}

const controller = {
    currectState: GAME_STATE.FirstCardAwaits,
    generateCards() {
        view.displayCards(utility.getRandomNumberArray(52))
    },
    dispatchCardActive(card) {
        if (!card.classList.contains('back')) {
            return
        }
        switch (this.currectState) {
            case GAME_STATE.FirstCardAwaits:
                view.flipCards(card)
                model.revealedCards.push(card)
                this.currectState = GAME_STATE.SecondCardAwaits
                break

            case GAME_STATE.SecondCardAwaits:
                view.renderTriedTimes(++model.triedTimes)
                view.flipCards(card)
                model.revealedCards.push(card)
                    //判斷是否成功
                if (model.isRevealedCardsMatched()) {
                    view.renderScore(model.score += 10)
                    this.currectState = GAME_STATE.CardsMatched
                    view.pairCards(...model.revealedCards)
                    model.revealedCards = []

                    if (model.score === 260) {
                        this.currectState = GAME_STATE.GameFinished
                        view.showGameFinished()
                        return
                    }
                    this.currectState = GAME_STATE.FirstCardAwaits

                } else {
                    this.currectState = GAME_STATE.CardsMatchFailed
                    view.appendWrongAnimation(...model.revealedCards)
                    setTimeout(this.resetCards, 900)
                }
                break
        }
        console.log('currectState', this.currectState)
        console.log('revealedCards', model.revealedCards.map(card =>
            card.dataset.index))
    },
    resetCards() {
        view.flipCards(...model.revealedCards)
        model.revealedCards = []
        controller.currectState = GAME_STATE.FirstCardAwaits //resetCards會被當參數setTimeout給使用,this就必改為controller
    },
    restartGame() {

    }
}

const view = {
    getCardElement(index) {
        return `
            <div data-index="${index}" class="card back">
            </div>
        `
    },
    getCardContent(index) {
        const number = this.transformNumber((index % 13) + 1)
        const symbol = Symbols[Math.floor(index / 13)]
        return `
                <img src="${symbol}" />
                <p>${number}</p>
        `
    },
    flipCards(...cards) {
        cards.map(card => {
            if (card.classList.contains('back')) {
                card.classList.remove('back')
                card.innerHTML = this.getCardContent(Number(card.dataset.index))
                return
            }
            card.classList.add('back')
            card.innerHTML = null
        })
    },
    pairCards(...cards) {
        cards.map(card => {
            card.classList.add('paired')
        })
    },
    transformNumber(number) {
        switch (number) {
            case 1:
                return 'A'
            case 11:
                return 'J'
            case 12:
                return 'Q'
            case 13:
                return 'K'
            default:
                return number
        }
    },
    displayCards(indexes) {
        const cards = document.querySelector('#cards')
        cards.innerHTML = indexes.map(index =>
            this.getCardElement(index)).join('')
    },
    renderScore(score) {
        document.querySelector('.score').innerHTML = `Score: ${score}`
    },
    renderTriedTimes(times) {
        document.querySelector('.tried').innerHTML = `You've tried: ${times} times`
    },
    appendWrongAnimation(...cards) {
        cards.map(card => {
            card.classList.add('wrong')
            card.addEventListener('animationend', event =>
                event.target.classList.remove('wrong'), { once: true })
        })
    },
    showGameFinished() {
        const div = document.createElement('div')
        div.classList.add('completed')
        div.innerHTML = `
        <h1>Complete!</h1>
        <p>Score: ${model.score}</p>
        <p>You've tried: ${model.triedTimes} times</p>
        <button class="restart">&#8635 Play again</button>
        `
        const header = document.querySelector('#header-container')
        header.before(div)

        return this.restartGame()
    },
    restartGame() {
        const restart = document.querySelector('.restart')
        restart.addEventListener('click', event => {
            window.location.reload()
        })
    }
}
controller.generateCards()
    // 直接看結束畫面view.showGameFinished()

document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', event => {
        controller.dispatchCardActive(card)
    })
})