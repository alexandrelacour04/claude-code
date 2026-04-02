/**
 * Classe principale pour gérer la logique du blackjack
 */
export class BlackjackGame {
  constructor() {
    this.deck = [];
    this.playerHand = [];
    this.dealerHand = [];
    this.playerBet = 0;
    this.balance = 1000;
    this.gameState = 'betting'; // betting, playing, dealer-turn, finished
    this.stats = {
      handsPlayed: 0,
      wins: 0,
      losses: 0,
      pushes: 0,
      blackjacks: 0,
      totalWinnings: 0,
      history: []
    };
    this.initializeDeck();
  }

  /**
   * Initialise un nouveau deck de 52 cartes
   */
  initializeDeck() {
    this.deck = [];
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    for (let suit of suits) {
      for (let rank of ranks) {
        this.deck.push({ rank, suit });
      }
    }
    this.shuffleDeck();
  }

  /**
   * Mélange le deck avec l'algorithme Fisher-Yates
   */
  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
    // Réinitialiser le deck si moins de 25% de cartes restantes
    if (this.deck.length < 13) {
      this.initializeDeck();
    }
  }

  /**
   * Tire une carte du deck
   */
  dealCard() {
    if (this.deck.length === 0) {
      this.initializeDeck();
    }
    return this.deck.pop();
  }

  /**
   * Calcule la valeur d'une main
   */
  calculateHandValue(hand) {
    let value = 0;
    let aces = 0;

    for (let card of hand) {
      if (card.rank === 'A') {
        aces++;
        value += 11;
      } else if (['J', 'Q', 'K'].includes(card.rank)) {
        value += 10;
      } else {
        value += parseInt(card.rank);
      }
    }

    // Ajuster pour les as si nécessaire
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  }

  /**
   * Vérifie si c'est un blackjack (21 avec 2 cartes)
   */
  isBlackjack(hand) {
    return hand.length === 2 && this.calculateHandValue(hand) === 21;
  }

  /**
   * Vérifie si la main est "bust" (dépasse 21)
   */
  isBust(hand) {
    return this.calculateHandValue(hand) > 21;
  }

  /**
   * Place une mise
   */
  placeBet(amount) {
    if (amount > 0 && amount <= this.balance) {
      this.playerBet = amount;
      this.balance -= amount;
      return true;
    }
    return false;
  }

  /**
   * Augmente la mise (doubler)
   */
  doubleBet() {
    if (this.playerBet * 2 <= this.balance + this.playerBet) {
      const additional = this.playerBet;
      this.playerBet *= 2;
      this.balance -= additional;
      return true;
    }
    return false;
  }

  /**
   * Démarre une nouvelle main
   */
  startNewHand() {
    this.playerHand = [];
    this.dealerHand = [];
    this.gameState = 'playing';

    // Distribuer les cartes initiales
    this.playerHand.push(this.dealCard());
    this.dealerHand.push(this.dealCard());
    this.playerHand.push(this.dealCard());
    this.dealerHand.push(this.dealCard());
  }

  /**
   * Le joueur tire une carte
   */
  playerHit() {
    this.playerHand.push(this.dealCard());
    if (this.isBust(this.playerHand)) {
      this.gameState = 'finished';
      return 'bust';
    }
    return 'hit';
  }

  /**
   * Le joueur reste
   */
  playerStand() {
    this.gameState = 'dealer-turn';
    this.dealerTurn();
    return 'stand';
  }

  /**
   * Le croupier joue selon ses règles (doit tirer si < 17, rester si >= 17)
   */
  dealerTurn() {
    while (this.calculateHandValue(this.dealerHand) < 17) {
      this.dealerHand.push(this.dealCard());
    }
    this.gameState = 'finished';
  }

  /**
   * Détermine le résultat de la main
   */
  determineWinner() {
    const playerValue = this.calculateHandValue(this.playerHand);
    const dealerValue = this.calculateHandValue(this.dealerHand);
    const playerBlackjack = this.isBlackjack(this.playerHand);
    const dealerBlackjack = this.isBlackjack(this.dealerHand);

    let result = {
      outcome: null,
      payout: 0,
      message: ''
    };

    // Joueur bust
    if (this.isBust(this.playerHand)) {
      result.outcome = 'loss';
      result.message = 'Vous avez dépassé 21. Vous perdez!';
      this.stats.losses++;
    }
    // Croupier bust
    else if (this.isBust(this.dealerHand)) {
      result.outcome = 'win';
      result.payout = this.playerBet * 2;
      result.message = 'Le croupier a dépassé 21. Vous gagnez!';
      this.stats.wins++;
    }
    // Deux blackjacks
    else if (playerBlackjack && dealerBlackjack) {
      result.outcome = 'push';
      result.payout = this.playerBet;
      result.message = 'Deux blackjacks! Égalité!';
      this.stats.pushes++;
    }
    // Joueur blackjack
    else if (playerBlackjack) {
      result.outcome = 'blackjack';
      result.payout = Math.floor(this.playerBet * 2.5); // 3:2 payout
      result.message = 'Blackjack! Vous gagnez!';
      this.stats.wins++;
      this.stats.blackjacks++;
    }
    // Croupier blackjack
    else if (dealerBlackjack) {
      result.outcome = 'loss';
      result.message = 'Le croupier a un blackjack. Vous perdez!';
      this.stats.losses++;
    }
    // Comparaison des valeurs
    else if (playerValue > dealerValue) {
      result.outcome = 'win';
      result.payout = this.playerBet * 2;
      result.message = `Vous avez ${playerValue}. Le croupier a ${dealerValue}. Vous gagnez!`;
      this.stats.wins++;
    }
    else if (playerValue < dealerValue) {
      result.outcome = 'loss';
      result.message = `Vous avez ${playerValue}. Le croupier a ${dealerValue}. Vous perdez!`;
      this.stats.losses++;
    }
    else {
      result.outcome = 'push';
      result.payout = this.playerBet;
      result.message = `Vous avez tous les deux ${playerValue}. Égalité!`;
      this.stats.pushes++;
    }

    // Mettre à jour le solde et les statistiques
    if (result.payout > 0) {
      this.balance += result.payout;
      this.stats.totalWinnings += result.payout - this.playerBet;
    }

    this.stats.handsPlayed++;
    this.recordHand(result);

    return result;
  }

  /**
   * Enregistre la main dans l'historique
   */
  recordHand(result) {
    this.stats.history.unshift({
      date: new Date().toLocaleTimeString('fr-FR'),
      playerValue: this.calculateHandValue(this.playerHand),
      dealerValue: this.calculateHandValue(this.dealerHand),
      bet: this.playerBet,
      outcome: result.outcome,
      message: result.message
    });
    // Garder seulement les 50 dernières mains
    if (this.stats.history.length > 50) {
      this.stats.history.pop();
    }
  }

  /**
   * Réinitialise la partie
   */
  resetGame(newBalance = null) {
    if (newBalance !== null) {
      this.balance = newBalance;
    }
    this.playerHand = [];
    this.dealerHand = [];
    this.playerBet = 0;
    this.gameState = 'betting';
  }

  /**
   * Sauvegarde les statistiques dans localStorage
   */
  saveStats() {
    localStorage.setItem('blackjack-stats', JSON.stringify(this.stats));
  }

  /**
   * Charge les statistiques depuis localStorage
   */
  loadStats() {
    const saved = localStorage.getItem('blackjack-stats');
    if (saved) {
      this.stats = JSON.parse(saved);
    }
  }

  /**
   * Réinitialise les statistiques
   */
  clearStats() {
    this.stats = {
      handsPlayed: 0,
      wins: 0,
      losses: 0,
      pushes: 0,
      blackjacks: 0,
      totalWinnings: 0,
      history: []
    };
    this.saveStats();
  }
}
