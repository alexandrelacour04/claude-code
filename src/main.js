import { BlackjackGame } from './game.js';
import { UIManager } from './ui.js';
import { SoundManager } from './sound.js';

/**
 * Contrôleur principal du jeu
 */
class GameController {
  constructor() {
    this.game = new BlackjackGame();
    this.ui = new UIManager();
    this.sound = new SoundManager();
    this.initializeEventListeners();
    this.game.loadStats();
    this.updateUI();
  }

  initializeEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
    });

    // Menu toggle
    document.getElementById('menu-toggle').addEventListener('click', () => {
      document.querySelector('.sidebar').classList.toggle('collapsed');
    });

    // Betting buttons
    document.querySelectorAll('.bet-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.placeBet(parseInt(e.target.dataset.bet)));
    });

    // Custom bet
    document.getElementById('confirm-bet').addEventListener('click', () => {
      const amount = parseInt(document.getElementById('custom-bet').value);
      if (amount > 0) {
        this.placeBet(amount);
      }
    });

    // Doubler la mise
    document.getElementById('double-bet').addEventListener('click', () => {
      const amount = this.game.playerBet * 2;
      if (amount <= this.game.balance + this.game.playerBet) {
        this.game.playerBet = amount;
        this.game.balance -= this.game.playerBet / 2;
        document.getElementById('confirm-bet').click();
      }
    });

    // Game action buttons
    document.getElementById('hit-btn').addEventListener('click', () => this.playerHit());
    document.getElementById('stand-btn').addEventListener('click', () => this.playerStand());
    document.getElementById('double-btn').addEventListener('click', () => this.playerDouble());
    document.getElementById('split-btn').addEventListener('click', () => this.playerSplit());

    // Next hand and reset
    document.getElementById('next-hand-btn').addEventListener('click', () => this.resetForNextHand());
    document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());

    // Settings
    document.getElementById('sound-toggle').addEventListener('change', (e) => {
      this.sound.setEnabled(e.target.checked);
    });

    document.getElementById('animation-toggle').addEventListener('change', (e) => {
      document.documentElement.setAttribute('data-animations', e.target.checked);
    });

    document.getElementById('reset-balance-btn').addEventListener('click', () => {
      const amount = parseInt(document.getElementById('starting-balance').value);
      this.game.balance = amount;
      this.game.playerBet = 0;
      this.game.gameState = 'betting';
      this.updateUI();
    });

    document.getElementById('clear-history-btn').addEventListener('click', () => {
      if (confirm('Êtes-vous sûr? Cette action ne peut pas être annulée.')) {
        this.game.clearStats();
        this.updateUI();
      }
    });

    // Custom bet input enter key
    document.getElementById('custom-bet').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('confirm-bet').click();
      }
    });
  }

  placeBet(amount) {
    if (this.game.placeBet(amount)) {
      this.sound.play('bet');
      document.getElementById('custom-bet').value = '';
      this.ui.showBettingSection(false);
      this.game.startNewHand();
      this.ui.displayHands(
        this.game.playerHand,
        this.game.dealerHand,
        this.game.calculateHandValue(this.game.playerHand),
        this.game.calculateHandValue(this.game.dealerHand),
        true // hideDealer
      );
      this.ui.updateStatus('Votre main: Hit ou Stand?');
      this.ui.showActionButtons(true);
      this.updateUI();
    } else {
      this.ui.showError('Mise invalide. Vérifiez votre solde.');
    }
  }

  playerHit() {
    this.sound.play('card');
    const result = this.game.playerHit();

    if (result === 'bust') {
      this.sound.play('bust');
      this.finishHand();
    } else {
      this.ui.displayHands(
        this.game.playerHand,
        this.game.dealerHand,
        this.game.calculateHandValue(this.game.playerHand),
        this.game.calculateHandValue(this.game.dealerHand),
        true
      );
    }
    this.updateUI();
  }

  playerStand() {
    this.sound.play('stand');
    this.game.playerStand();
    this.ui.displayHands(
      this.game.playerHand,
      this.game.dealerHand,
      this.game.calculateHandValue(this.game.playerHand),
      this.game.calculateHandValue(this.game.dealerHand),
      false // show dealer cards
    );
    this.ui.updateStatus('Le croupier joue...');
    this.ui.showActionButtons(false);

    // Simuler un délai pour le croupier
    setTimeout(() => {
      this.finishHand();
    }, 1500);
  }

  playerDouble() {
    if (this.game.doubleBet()) {
      this.sound.play('bet');
      this.game.playerHit();

      if (!this.game.isBust(this.game.playerHand)) {
        this.game.playerStand();
      } else {
        this.finishHand();
      }
      this.updateUI();
    }
  }

  playerSplit() {
    // Split sera implémenté dans une version future
    this.ui.showError('Fonctionnalité non encore implémentée');
  }

  finishHand() {
    const result = this.game.determineWinner();
    this.sound.play(result.outcome);

    this.ui.displayHands(
      this.game.playerHand,
      this.game.dealerHand,
      this.game.calculateHandValue(this.game.playerHand),
      this.game.calculateHandValue(this.game.dealerHand),
      false
    );

    this.ui.updateStatus(result.message);
    this.ui.showActionButtons(false);
    this.ui.showNextHandButton(true);
    this.updateUI();
  }

  resetForNextHand() {
    if (this.game.balance <= 0) {
      this.ui.showError('Solde insuffisant. Veuillez réinitialiser la partie.');
      return;
    }
    this.game.playerHand = [];
    this.game.dealerHand = [];
    this.game.playerBet = 0;
    this.game.gameState = 'betting';
    this.ui.clearHands();
    this.ui.showBettingSection(true);
    this.ui.showNextHandButton(false);
    this.ui.showActionButtons(false);
    this.ui.updateStatus('Faites votre mise pour commencer');
    this.updateUI();
  }

  resetGame() {
    if (confirm('Êtes-vous sûr? Cela réinitialisera votre solde.')) {
      this.game.resetGame(1000);
      this.resetForNextHand();
    }
  }

  switchView(viewName) {
    // Mettre à jour la navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.view === viewName) {
        btn.classList.add('active');
      }
    });

    // Mettre à jour les vues
    document.querySelectorAll('.view').forEach(view => {
      view.style.display = 'none';
    });
    document.getElementById(`${viewName}-view`).style.display = 'block';

    // Mettre à jour les statistiques si nécessaire
    if (viewName === 'stats') {
      this.updateStats();
    }
  }

  updateStats() {
    document.getElementById('hands-played').textContent = this.game.stats.handsPlayed;
    document.getElementById('wins').textContent = this.game.stats.wins;
    document.getElementById('losses').textContent = this.game.stats.losses;
    document.getElementById('pushes').textContent = this.game.stats.pushes;
    document.getElementById('best-hand').textContent = this.game.stats.blackjacks > 0 ? 'BJ' : 'N/A';
    document.getElementById('total-winnings').textContent = '$' + this.game.stats.totalWinnings;

    // Mettre à jour l'historique
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    if (this.game.stats.history.length === 0) {
      historyList.innerHTML = '<p class="empty-history">Aucune main jouée encore</p>';
      return;
    }

    this.game.stats.history.forEach(hand => {
      const item = document.createElement('div');
      item.className = `history-item history-${hand.outcome}`;
      item.innerHTML = `
        <div class="history-time">${hand.date}</div>
        <div class="history-values">
          <span class="player-val">Vous: ${hand.playerValue}</span>
          <span class="dealer-val">Croupier: ${hand.dealerValue}</span>
        </div>
        <div class="history-outcome">${hand.outcome.toUpperCase()}</div>
        <div class="history-bet">Mise: $${hand.bet}</div>
      `;
      historyList.appendChild(item);
    });
  }

  updateUI() {
    this.ui.updateBalance(this.game.balance);
    this.ui.updateBetDisplay(this.game.playerBet);
    this.game.saveStats();
  }
}

// Initialiser le jeu au chargement
document.addEventListener('DOMContentLoaded', () => {
  const controller = new GameController();
  window.gameController = controller;
});
