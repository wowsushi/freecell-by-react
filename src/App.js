import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props)
    this.state= {
      mainTableColumns: [],
      count: 0
    }
    this.handleClick = this.handleClick.bind(this)
  }

  componentDidMount() {
    this.shuffleCards()

  }

  componentDidUpdate(prevProps) {
          console.log(this.state.count)
    console.log(this.state.mainTableColumns)
  }

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
        const color = {
          0: 'club',
          1: 'diamond',
          2: 'heart',
          3: 'spade'
        }
        if (originalCards.length) {
         let range = originalCards.length
         let pickedCard = originalCards.splice(this.getRandomNumber(range), 1)
         pickedCard = `${ color[ Math.floor(pickedCard / 13) ] }_${ (pickedCard % 13) + 1 }`
         mainCardArea[i].push(pickedCard)
        }
      }
    }
    this.setState({mainTableColumns: mainCardArea })
  }

  draggableCheck(cardList) {
    return "123"
  }

  handleClick() {
    this.setState({count: this.state.count +1})

  }

  render() {
    const mainTableColumns = JSON.parse(JSON.stringify(this.state.mainTableColumns))

    mainTableColumns.map((column, columnIndex) => {
      column.map((cardColor, cardIndex) => {
        let draggable = (column.length - 1 === cardIndex) ? true : false
      let cardDiv = <div id={cardColor} class="card card_main" draggable={draggable}><img src={'cards/' + cardColor + '.png'} alt={cardColor}/></div>
        mainTableColumns[columnIndex][cardIndex] = cardDiv
      })
      mainTableColumns[columnIndex] = <div className="card_wrapper">{ mainTableColumns[columnIndex] }</div>
    })

    return (
    <div className="container" onClick={this.handleClick}>
        <div className="header">
          <img className="main_banner" src="logo-bk.png" alt="logo" />
          <div className="nav">
            <img className="more_info icon" src="btn-more.png" alt="more"/>
            <div className="time_control">Time: 00 : 10</div>
            <img className="back_tab icon" src="btn-return.png" alt="return"/>
          </div>
          <div className="scoreboard">
            <img className="bone_logo icon" src="bone.png" alt="bone" />
            <div className="score">Score : 100</div>
          </div>
        </div>
        <div className="game_table">
          <div className="cards_area cards_area_temp">
            <div className="card_wrapper"></div>
            <div className="card_wrapper"></div>
            <div className="card_wrapper"></div>
            <div className="card_wrapper"></div>
          </div>
          <div className="cards_area cards_area_sorted">
            <div className="card_wrapper">
              <img src="club-suit-w.png" alt="club"/>
            </div>
            <div className="card_wrapper">
              <img src="diamond-suit-w.png" alt="diamond"/>
            </div>
            <div className="card_wrapper">
              <img src="heart-suit-w.png" alt="heard"/>
            </div>
            <div className="card_wrapper">
              <img src="spade-suit-w.png" alt="spade"/>
            </div>
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
