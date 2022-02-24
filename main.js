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
                view.flipCard(card)
                model.revealedCards.push(card)
                this.currectState = GAME_STATE.SecondCardAwaits
                break
            case GAME_STATE.SecondCardAwaits:
                view.flipCard(card)
                model.revealedCards.push(card)
                    //判斷是否成功
                if (model.isRevealedCardsMatched()) {
                    this.currectState = GAME_STATE.CardsMatched
                    view.pairCard(model.revealedCards[0])
                    view.pairCard(model.revealedCards[1])
                    model.revealedCards = []
                    this.currectState = GAME_STATE.FirstCardAwaits
                } else {
                    this.currectState = GAME_STATE.CardsMatchFailed
                    setTimeout(() => {
                        view.flipCard(model.revealedCards[0])
                        view.flipCard(model.revealedCards[1])
                        model.revealedCards = []
                        this.currectState = GAME_STATE.FirstCardAwaits
                    }, 1000)
                }
                break
        }
        console.log('currectState', this.currectState)
        console.log('revealedCards', model.revealedCards.map(card =>
            card.dataset.index))
    }
}
const model = {
    revealedCards: [],
    isRevealedCardsMatched() {
        return this.revealedCards[0].dataset.index % 13 ===
            this.revealedCards[1].dataset.index % 13
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
    flipCard(card) {
        if (card.classList.contains('back')) {
            card.classList.remove('back')
            card.innerHTML = this.getCardContent(Number(card.dataset.index))
            return
        }

        card.classList.add('back')
        card.innerHTML = null
    },
    pairCard(card) {
        card.classList.add('paired')
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
    }
}
controller.generateCards()

document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', event => {
        controller.dispatchCardActive(card)
    })
})