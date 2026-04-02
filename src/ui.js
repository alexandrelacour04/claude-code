/**
 * Gestionnaire de l'interface utilisateur
 */
export class UIManager {
  constructor() {
    this.animationsEnabled = true;
  }

  /**
   * Met à jour l'affichage du solde
   */
  updateBalance(amount) {
    document.getElementById('balance').textContent = '$' + amount;
  }

  /**
   * Met à jour l'affichage de la mise
   */
  updateBetDisplay(amount) {
    document.getElementById('bet-display').textContent = '$' + amount;
  }

  /**
   * Affiche ou masque la section de paris
   */
  showBettingSection(show) {
    document.getElementById('betting-section').style.display = show ? 'flex' : 'none';
  }

  /**
   * Affiche ou masque les boutons d'action
   */
  showActionButtons(show) {
    document.getElementById('action-section').style.display = show ? 'flex' : 'none';
  }

  /**
   * Affiche ou masque le bouton de main suivante
   */
  showNextHandButton(show) {
    document.getElementById('next-hand-btn').style.display = show ? 'inline-block' : 'none';
  }

  /**
   * Met à jour le message de statut
   */
  updateStatus(message) {
    document.getElementById('status-message').textContent = message;
  }

  /**
   * Affiche un message d'erreur
   */
  showError(message) {
    this.updateStatus('❌ ' + message);
    setTimeout(() => {
      this.updateStatus('Faites votre mise pour commencer');
    }, 3000);
  }

  /**
   * Crée un élément de carte pour l'affichage
   */
  createCardElement(card, faceDown = false) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';

    if (faceDown) {
      cardDiv.classList.add('card-facedown');
      cardDiv.innerHTML = '<div class="card-back"></div>';
    } else {
      const suitColor = ['♥', '♦'].includes(card.suit) ? 'red' : 'black';
      cardDiv.classList.add(`card-${suitColor}`);
      cardDiv.innerHTML = `
        <div class="card-corner top-left">
          <div class="rank">${card.rank}</div>
          <div class="suit">${card.suit}</div>
        </div>
        <div class="card-center">${card.suit}</div>
        <div class="card-corner bottom-right">
          <div class="rank">${card.rank}</div>
          <div class="suit">${card.suit}</div>
        </div>
      `;
    }

    return cardDiv;
  }

  /**
   * Affiche les mains du joueur et du croupier
   */
  displayHands(playerHand, dealerHand, playerValue, dealerValue, hideDealer) {
    const playerCardsDiv = document.getElementById('player-cards');
    const dealerCardsDiv = document.getElementById('dealer-cards');

    // Vider les conteneurs
    playerCardsDiv.innerHTML = '';
    dealerCardsDiv.innerHTML = '';

    // Afficher les cartes du joueur
    playerHand.forEach((card, index) => {
      const cardEl = this.createCardElement(card, false);
      if (this.animationsEnabled) {
        cardEl.style.animationDelay = (index * 0.1) + 's';
        cardEl.classList.add('card-deal');
      }
      playerCardsDiv.appendChild(cardEl);
    });

    // Afficher les cartes du croupier
    dealerHand.forEach((card, index) => {
      const isFaceDown = hideDealer && index === 1;
      const cardEl = this.createCardElement(card, isFaceDown);
      if (this.animationsEnabled) {
        cardEl.style.animationDelay = (index * 0.1) + 's';
        cardEl.classList.add('card-deal');
      }
      dealerCardsDiv.appendChild(cardEl);
    });

    // Mettre à jour les valeurs affichées
    document.getElementById('player-value').textContent = playerValue;

    if (hideDealer) {
      document.getElementById('dealer-value').textContent = dealerHand[0] ? this.getCardValue(dealerHand[0]) : '0';
    } else {
      document.getElementById('dealer-value').textContent = dealerValue;
    }
  }

  /**
   * Obtient la valeur numérique d'une carte
   */
  getCardValue(card) {
    if (card.rank === 'A') return 11;
    if (['J', 'Q', 'K'].includes(card.rank)) return 10;
    return parseInt(card.rank);
  }

  /**
   * Efface l'affichage des cartes
   */
  clearHands() {
    document.getElementById('player-cards').innerHTML = '<div class="card-placeholder">Vos cartes</div>';
    document.getElementById('dealer-cards').innerHTML = '<div class="card-placeholder">Cartes du croupier</div>';
    document.getElementById('player-value').textContent = '0';
    document.getElementById('dealer-value').textContent = '0';
  }
}
