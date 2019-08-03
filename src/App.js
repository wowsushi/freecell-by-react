import React, { Component } from 'react';
import './App.css';

function InstructionModal (props){
    return (
      <div className="content">
        <button className="btn_cancel">
          <i className="material-icons"  onClick={props.closeModal}>cancel_presentation</i>
        </button>
        <img src="./how_to_play.png" alt="How to play?" className="img_instruction"/>
        <div className="paragraph paragraph_instruction">
          <p>Freecell is a one-deck solitaire card game. All cards are dealt into 8 tableau piles. Four Cells (in the top left corner of the screen) and four foundation piles (top right hand corner) are placed above the tableau piles.</p>
          <p>The object of the game is to build up all cards on foundations from Ace to King by following suit. You win when all 52 cards are moved there, 13 to a pile.</p>
          <p>Top cards of tableau piles and cards from Cells are available to play. You can build tableau piles down by alternating color. Only one card at a time can be moved.</p>
          <p>The top card of any tableau pile can also be moved to any Cell. Each Cell (or Reserve space) may contain only one card. Cards in the cells can be moved to the foundation piles or back to the tableau piles, if possible.</p>
          <p>The rules state that you can move only one card at a time, but you can move group of cards in the proper sequence if you have enough free (empty) Cells and/or tableau piles.</p>
        </div>
      </div>
    )
}

function InfoModal (props) {
  return (
    <div className="content">
        <img src="./word_new_game.png" alt="New game" className="img_info"/>
        <div className="paragraph paragraph_info">
          <button onClick={props.newGame}>Quit and start a new game</button>
          <button onClick={props.restart}>Restart this game</button>
          <button onClick={props.closeModal}>Keep playing</button>
        </div>
    </div>
  )
}

function WinModal (props) {
  return (
    <div className="content">
        <img src="./congratulations.svg" alt="win" className="img_win"/>
        <div className="paragraph paragraph_win">
          <button onClick={props.restart}>Restart</button>
          <button onClick={props.newGame}>New Game</button>
          <img className="win_pic" src="./congratulations_pic.png" alt="win_pic"/>
        </div>
    </div>
  )
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state= {
      mainTableColumns: [[ [], [], [], [], [], [], [], [] ]],
      tempDecks: [[ [], [], [], [] ]],
      sortedDecks: [[ [], [], [], [] ]],
      draggedArea: '',
      draggedColIndex: 0,
      droppedArea: '',
      droppedColIndex: 0,
      score: 0,
      clock: 0,
      modal: <InstructionModal closeModal={this.closeModal}/>
    }
    this.handleDragStart = this.handleDragStart.bind(this)
    this.handleDragEnter = this.handleDragEnter.bind(this)
    this.handleDragOver = this.handleDragOver.bind(this)
  }

  componentDidMount() {
    this.shuffleCards()
  }

  componentDidUpdate(prevProps, prevState) {

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
    this.setState({mainTableColumns: [mainCardArea] })
  }

  revelCardDecks(cardDecks, status) {
    const cardList = JSON.parse(JSON.stringify(cardDecks))
    let suits =[]
    if (status === 'sorted') {
      suits = ['club', 'diamond', 'heart', 'spade']
      suits.map((suit, index) => {
         suits[index] =  <img src={`${suit}-suit.png`} className="icon" alt={ suit }/>
         return null
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
       >
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
          key={columnIndex}
          >
          { suits[columnIndex]  }
          { cardList[columnIndex] }
        </div>
      return null
    })
    return cardList
  }

  // drag & drop event
  droppableCheck(id) {
    const { droppedArea, droppedColIndex } = this.state
    const mainTableColumns = this.state.mainTableColumns[this.state.mainTableColumns.length-1]
    const tempDecks = this.state.tempDecks[this.state.tempDecks.length-1]
    const sortedDecks = this.state.sortedDecks[this.state.sortedDecks.length-1]

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
      case 'sorted':
        return (suit[droppedColIndex] === droppedSuit && sortedDecks[droppedColIndex].length + 1 === +droppedNum)
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
      default:
        console.log('error')
    }

  }

  handleDragStart = (status, columnIndex) => e => {
    let id = e.target.parentNode.id
    e.dataTransfer.setData('text/plain', id)
    this.setState({draggedArea: status, draggedColIndex: columnIndex})
  }

  handleDrop = e => {
    const { mainTableColumns, tempDecks, sortedDecks, draggedArea, draggedColIndex, droppedArea, droppedColIndex } = this.state

    let newMainTableColumns =JSON.parse(JSON.stringify(mainTableColumns))
    let newTempDecks =JSON.parse(JSON.stringify(tempDecks))
    let newSortedDecks = JSON.parse(JSON.stringify(sortedDecks))

    newMainTableColumns = newMainTableColumns[newMainTableColumns.length-1]
    newTempDecks = newTempDecks[newTempDecks.length-1]
    newSortedDecks = newSortedDecks[newSortedDecks.length-1]

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
    mainTableColumns.push(newMainTableColumns)
    tempDecks.push(newTempDecks)
    sortedDecks.push(newSortedDecks)

    this.setState({
      draggedArea: '',
      draggedColIndex: 0,
      droppedArea: '',
      droppedColIndex: 0,
      mainTableColumns: mainTableColumns,
      tempDecks: tempDecks,
      sortedDecks: sortedDecks
    })
    this.calculateScore(newSortedDecks)
  }

  handleDragEnter = (status, columnIndex) => e => {
    this.cancelDefault(e)
    this.setState({droppedArea: status, droppedColIndex: columnIndex})
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
      totalCards += column.length
      return null
    })
    this.setState({score: totalCards * 100})

    if (totalCards === 52) {
      this.setState({modal: <WinModal newGame={this.newGame} restart={this.restart} closeModal={this.closeModal} />})

      const modal = document.querySelector('.modal')
      modal.style.display = 'block'
      clearInterval(this.interval)
    }
  }

  undo = () => e => {
    const { mainTableColumns, tempDecks, sortedDecks } = this.state

    if (mainTableColumns.length > 1) {
      mainTableColumns.pop()
      tempDecks.pop()
      sortedDecks.pop()
    } else {
      alert('這已經是第一步囉')
    }

    this.setState({
      mainTableColumns: mainTableColumns,
      tempDecks: tempDecks,
      sortedDecks: sortedDecks
    })
    this.calculateScore(sortedDecks[sortedDecks.length-1])
  }

  newGame = () => {
    this.closeModal()
    this.shuffleCards()
    this.setState({
      // mainTableColumns: [[ [], [], [], [], [], [], [], [] ]],
      tempDecks: [[ [], [], [], [] ]],
      sortedDecks: [[ [], [], [], [] ]],
      score: 0,
      clock: 0
    })
  }

  restart = () => {
    this.closeModal()
    this.setState({
      mainTableColumns: [this.state.mainTableColumns[0]],
      tempDecks: [[ [], [], [], [] ]],
      sortedDecks: [[ [], [], [], [] ]],
      score: 0,
      clock: 0
    })
  }

  closeModal = () => {
    const modal = document.querySelector('.modal')
    modal.style.display = 'none'
    this.clock()
  }

  openModal = (modalName) => e => {
    switch (modalName) {
      case 'instruction':
        this.setState({modal: <InstructionModal />})
        break
      case 'info':
        this.setState({modal: <InfoModal newGame={this.newGame} restart={this.restart} closeModal={this.closeModal} />})
        break
      case 'win':
        this.setState({modal: <WinModal newGame={this.newGame} closeModal={this.closeModal} />})
        break
      default:
        console.log('error')
    }

    const modal = document.querySelector('.modal')
    modal.style.display = 'block'
    clearInterval(this.interval)
  }

  render() {
    const mainTableColumns = this.revelCardDecks(this.state.mainTableColumns[this.state.mainTableColumns.length-1], 'main')
    const tempDecks = this.revelCardDecks(this.state.tempDecks[this.state.tempDecks.length-1], 'temp')
    const sortedDecks = this.revelCardDecks(this.state.sortedDecks[this.state.sortedDecks.length-1], 'sorted')

    return (
    <div className="container" >
        <div className="header">
          <img className="main_banner" src="logo-bk.png" alt="logo" />
          <div className="nav">
            <img className="more_info icon" src="btn-more.png" alt="more" onClick={this.openModal('info')}/>
            <div className="time_control">
              Time: {(Math.floor(this.state.clock / 60)).toString().padStart(2, '0') } : {(this.state.clock % 60).toString().padStart(2, '0')}
            </div>
            <img className="back_tab icon" src="btn-return.png" alt="return" onClick={this.undo()}/>
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
              return null
            })}
          </div>
          <div className="cards_area cards_area_main right">
            {mainTableColumns.map((column, index) => {
              if (index >= 4) return column
              return null
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
        <div className="modal">
          <div className="background" onClick={this.closeModal}></div>
            {this.state.modal}
        </div>
    </div>
    )
  }
}

export default App;
