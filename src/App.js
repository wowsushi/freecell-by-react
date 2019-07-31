import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props)
    this.state= {
      mainTableColumns: [ [], [], [], [], [], [], [], [] ],
      tempDecks: [ [], [], [], [] ],
      sortedDecks: [ [], [], [], [] ],
      draggedArea: '',
      draggedColIndex: 0,
      droppedArea: '',
      droppedColIndex: 0,
      score: 0,
      clock: 0
    }
    this.handleDragStart = this.handleDragStart.bind(this)
    // this.handleDrop = this.handleDrop.bind(this)
    this.handleDragEnter = this.handleDragEnter.bind(this)
    this.handleDragOver = this.handleDragOver.bind(this)
  }

  componentDidMount() {
    this.shuffleCards()
    this.clock()
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  //init game
  getRandomNumber(x) {
    return Math.floor(Math.random() * x )
  }

  shuffleCards() {
    let originalCards = []
    let mainCardArea = [ [], [], [], [], [], [], [], [] ]

    //get ordered 52pcs cards
    for (let i=0; i<52; i++) {
      originalCards.push(i)
    }

    //pick one card in random from original cards
    while (originalCards.length) {
      for (let i=0; i<mainCardArea.length; i++) {
        const suit = {
          0: 'club',
          1: 'diamond',
          2: 'heart',
          3: 'spade'
        }
        if (originalCards.length) {
         let range = originalCards.length
         let pickedCard = originalCards.splice(this.getRandomNumber(range), 1)
         pickedCard = `${ suit[ Math.floor(pickedCard / 13) ] }_${ (pickedCard % 13) + 1 }`
         mainCardArea[i].push(pickedCard)
        }
      }
    }
    this.setState({mainTableColumns: mainCardArea })
  }

  revelCardDecks(cardDecks, status) {
    const cardList = JSON.parse(JSON.stringify(cardDecks))
    let suits =[]
    if (status === 'sorted') {
      suits = ['club', 'diamond', 'heart', 'spade']
      suits.map((suit, index) => {
         suits[index] =  <img src={`${suit}-suit.png`} className="icon" alt={ suit }/>
      })
    }

    cardList.map((column, columnIndex) => {
      column.map((cardColor, cardIndex) => {
        let draggable = (column.length - 1 === cardIndex) ? true : false
        if (status === 'sorted') draggable = false
      let cardDiv =
      <div
        id={cardColor}
        key={cardColor}
        className={'card card_' + status}
        data-columnIndex={columnIndex}>
          <img
            src={'cards/' + cardColor + '.png'}
            alt={cardColor}
            draggable={draggable}
          />
      </div>
        return cardList[columnIndex][cardIndex] = cardDiv
      })
      cardList[columnIndex] =
        <div
          className="card_wrapper"
          // onDrop={this.handleDrop.bind(this, status)}
          onDragStart={this.handleDragStart(status, columnIndex)}
          onDrop={this.handleDrop}
          onDragEnter={this.handleDragEnter(status, columnIndex)}
          onDragOver={this.handleDragOver}
          >
          { suits[columnIndex]  }
          { cardList[columnIndex] }
        </div>
    })
    return cardList
  }

  // drag & drop event
  droppableCheck(id) {
    const { mainTableColumns, tempDecks, sortedDecks, droppedArea, droppedColIndex } = this.state
    const [ droppedSuit, droppedNum ] = id.split('_')
    const suit = {
      0: 'club',
      1: 'diamond',
      2: 'heart',
      3: 'spade'
    }

    switch (droppedArea) {
      case 'temp':
        return (tempDecks[droppedColIndex].length) ? false : true
        break
      case 'sorted':
        return (suit[droppedColIndex] === droppedSuit && sortedDecks[droppedColIndex].length + 1 === +droppedNum)
        break
      case 'main':
        const lastCard = mainTableColumns[droppedColIndex].slice(-1)[0]
        if (!lastCard) return true

        const [lastCardSuit, lastCardNum ] = lastCard.split('_')

        if (lastCardSuit === 'club' || lastCardSuit === 'spade') {
          return (
             ['diamond', 'heart'].includes(droppedSuit)
          &&  +droppedNum === +lastCardNum - 1
          )
        } else {
          return (
            ['club', 'spade'].includes(droppedSuit)
          && +droppedNum === +lastCardNum - 1
          )
        }
        break
    }

  }

  handleDragStart = (status, columnIndex) => e => {
    console.log('start')
    let id = e.target.parentNode.id
    e.dataTransfer.setData('text/plain', e.target.parentNode.id)
    this.setState({draggedArea: status, draggedColIndex: columnIndex})
  }

  handleDrop = e => {
    console.log('drop start')
    const { mainTableColumns, tempDecks, sortedDecks, draggedArea, draggedColIndex, droppedArea, droppedColIndex, score } = this.state

    let newMainTableColumns =JSON.parse(JSON.stringify(mainTableColumns))
    let newTempDecks =JSON.parse(JSON.stringify(tempDecks))
    let newSortedDecks = JSON.parse(JSON.stringify(sortedDecks))

    this.cancelDefault(e)
    let id = e.dataTransfer.getData('text/plain')

    if (this.droppableCheck(id)) {
      //drop card to dropped area
      switch(droppedArea) {
        case 'temp':
          newTempDecks[droppedColIndex].push(id)
          break;
        case 'sorted':
          newSortedDecks[droppedColIndex].push(id)
          break;
        case 'main':
          newMainTableColumns[droppedColIndex].push(id)
          break;
        default:
          console.log('default')
      }

      //remove from dragged area
      switch(draggedArea) {
        case 'temp':
          newTempDecks[draggedColIndex].pop()
          break;
        case 'sorted':
          break;
        case 'main':
          newMainTableColumns[draggedColIndex].pop()
        break;
        default:
          console.log('default')
      }
    }

    this.setState({
      draggedArea: '',
      draggedColIndex: 0,
      droppedArea: '',
      droppedColIndex: 0,
      mainTableColumns: newMainTableColumns,
      tempDecks: newTempDecks,
      sortedDecks: newSortedDecks
    })
    this.calculateScore(newSortedDecks)
  }

  handleDragEnter = (status, columnIndex) => e => {
    this.cancelDefault(e)
    this.setState({droppedArea: status, droppedColIndex: columnIndex})

    let id = e.dataTransfer.getData('text/plain')

  }

  handleDragOver(e) {
    this.cancelDefault(e)
  }

  cancelDefault(e) {
    e.preventDefault()
    e.stopPropagation()
    return false
  }

// clock
  clock() {
    this.interval = setInterval(() => {
      this.setState({ clock: this.state.clock + 1 })
    }, 1000)
  }

  calculateScore(sortedDecks) {
    let totalCards = 0
    sortedDecks.map((column, index) => {
      console.log(column)
      totalCards = totalCards + column.length
    })
    this.setState({score: totalCards * 100})
    console.log(totalCards)
  }

  render() {
    const mainTableColumns = this.revelCardDecks(this.state.mainTableColumns, 'main')
    const tempDecks = this.revelCardDecks(this.state.tempDecks, 'temp')
    const sortedDecks = this.revelCardDecks(this.state.sortedDecks, 'sorted')

    return (
    <div className="container" >
        <div className="header">
          <img className="main_banner" src="logo-bk.png" alt="logo" />
          <div className="nav">
            <img className="more_info icon" src="btn-more.png" alt="more"/>
            <div className="time_control">
              Time: {(Math.floor(this.state.clock / 60)).toString().padStart(2, '0') } : {(this.state.clock % 60).toString().padStart(2, '0')}
            </div>
            <img className="back_tab icon" src="btn-return.png" alt="return"/>
          </div>
          <div className="scoreboard">
            <img className="bone_logo icon" src="bone.png" alt="bone" />
            <div className="score">Score : {this.state.score}</div>
          </div>
        </div>
        <div className="game_table">
          <div className="cards_area cards_area_temp">
            {tempDecks}
          </div>
          <div className="cards_area cards_area_sorted">
            {sortedDecks}
          </div>
          <div className="cards_area cards_area_main left">
            {mainTableColumns.map((column, index) => {
              if (index < 4) return column
            })}
          </div>
          <div className="cards_area cards_area_main right">
            {mainTableColumns.map((column, index) => {
              if (index >= 4) return column
            })}
          </div>
        </div>
        <div className="footer">
          <img className="left_footer" src="bg-left.png" alt="bg"/>
          <div className="center_footer">
            <div className="footer_msg">QUICKLY</div>
            <img src="bg-JQK.png" alt="bg"/>
          </div>
          <img className="right_footer" src="./bg-right.png" alt="bg" />
        </div>
    </div>
    )
  }
}

export default App;
