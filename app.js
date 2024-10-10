const moves = ['Punch', 'Kick', 'Knee', 'Elbow'];
let score = 0;
let round = 1;
let strikesLeft = 28;
let totalRounds = 5;
let playerKnockdowns = 0;
let aiKnockdowns = 0;
let playerTotalPoints = 0;
let aiTotalPoints = 0;
let gameOver = false;
let playerMoves = [];  // Track the player's last moves
let comboMoves = [];

// The rules of the game
function getWinner(playerMove, aiMove) {
    const winningConditions = {
        'Punch': ['Knee'], // Punch beats Knee
        'Kick': ['Punch', 'Elbow'], // Kick beats Punch and Elbow
        'Knee': ['Elbow', 'Kick'], // Knee beats Elbow and Kick
        'Elbow': ['Punch'] // Elbow beats Punch
    };
    
    if (playerMove === aiMove) {
        return 'tie';
    } else if (winningConditions[playerMove].includes(aiMove)) {
        return 'win';
    } else {
        return 'lose';
    }
}

// AI Counterattack logic based on player's repeated moves
function aiCounter(playerMove) {
    const lastTwoMoves = playerMoves.slice(-2); // Get the last two moves

    if (lastTwoMoves[0] === 'Punch' && lastTwoMoves[1] === 'Punch') {
        return ['Kick', 'Elbow'][Math.floor(Math.random() * 2)]; // Counter with Kick or Elbow
    } else if (lastTwoMoves[0] === 'Kick' && lastTwoMoves[1] === 'Kick') {
        return 'Knee'; // Counter with Knee
    } else if (lastTwoMoves[0] === 'Knee' && lastTwoMoves[1] === 'Knee') {
        return 'Punch'; // Counter with Punch
    } else if (lastTwoMoves[0] === 'Elbow' && lastTwoMoves[1] === 'Elbow') {
        return ['Kick', 'Knee'][Math.floor(Math.random() * 2)]; // Counter with Kick or Knee
    } else {
        return moves[Math.floor(Math.random() * moves.length)]; // Random AI move if no special counter
    }
}

// Update the score based on result and moves
function updateScore(playerMove, result) {
    const points = {
        'Punch': 25,
        'Kick': 12,
        'Knee': 12,
        'Elbow': 25
    };

    if (result === 'win') {
        score += points[playerMove]; // Add points for a win
        gsap.fromTo("#ai", { backgroundColor: "#ff4444" }, { backgroundColor: "#f3a805", duration: 0.2, yoyo: true, repeat: 1 });
    } else if (result === 'lose') {
        gsap.fromTo("#player", { backgroundColor: "#0400ff" }, { backgroundColor: "#f3a805", duration: 0.2, yoyo: true, repeat: 1 });
        if (playerMove === 'Punch' || playerMove === 'Elbow') {
            score -= 5; // Deduct 12 points for Punch and Elbow loss
        } else {
            score -= 25; // Deduct 25 points for Kick and Knee loss
        }    
    }
}

// Check for knockdowns and knockouts
function checkForKnockdowns() {
    const playerBoard = document.getElementById('player-board');
    const aiBoard = document.getElementById('ai-board');

    if (score >= 100) {       
        aiKnockdowns++;
        score = 0;
        aiBoard.innerHTML = `Knockdown! (${aiKnockdowns})`;
        if (aiKnockdowns < 3) {
            gsap.to("#ai", { rotate: 90, duration: 2, yoyo: true, repeat: 1 });
        }
        else if (aiKnockdowns === 3) {
            gsap.to("#player", { rotate: 90, duration: 2 });
            aiBoard.innerHTML = `AI KO'd!`;
            endGame('Player Wins by Knockout!');
            document.getElementById('restart-btn').style.display = 'block'; // Show the restart button
        }
    } else if (score <= -100) {      
        playerKnockdowns++;
        score = 0;
        playerBoard.innerHTML = `Knockdown! (${playerKnockdowns})`;
        if (playerKnockdowns < 3) {
            gsap.to("#player", { rotate: -90, duration: 2, yoyo: true, repeat: 1 });
        }
        else if (playerKnockdowns === 3) {
            gsap.to("#player", { rotate: -90, duration: 2 });
            playerBoard.innerHTML = `Player KO'd!`;
            endGame('AI Wins by Knockout!');
            document.getElementById('restart-btn').style.display = 'block'; // Show the restart button
        }
    }
}


// Play the game
function playGame(playerMove) {
    if (gameOver || round > totalRounds) {
        return; // Game over, no more rounds
    }

    // Track the player's moves
    playerMoves.push(playerMove);

    // AI move and counter logic
    const aiMove = aiCounter(playerMove);

    // Determine the winner
    const result = getWinner(playerMove, aiMove);

    // Update the score
    updateScore(playerMove, result);

    // Check for knockdowns and reset score if needed
    checkForKnockdowns();

    // Display the result
    const resultElement = document.getElementById('result');
    let resultText = `Player - ${playerMove}. AI - ${aiMove}. `;
    if (result === 'win') {
        resultText += ` Player landed ${playerMove}! `;
    } else if (result === 'lose') {
        resultText += ` AI landed ${aiMove}! `;
    } else {
        resultText += "Blocked!";
    }
    resultElement.innerHTML += `<br>${resultText}`;

    // Update the scoreboard
    document.getElementById('scoreboard').innerHTML = `Score: ${score}`;

    // Update the strike count
    strikesLeft--;
    if (strikesLeft > 0) {
        document.getElementById('round-info').innerHTML = `Round ${round} | Strikes left: ${strikesLeft}`;
    } else {
        // Handle end of round logic here
        endRound();
    }

    resetAnimations();
    
    // Show player move animation
    if (playerMove === 'Punch') {
        gsap.to("#player", { x: 50, rotate: 15, duration: 0.5, yoyo: true, repeat: 1 });
    } else if (playerMove === 'Kick') {
        gsap.to("#player", { x: 70, rotate: -15, duration: 0.5, yoyo: true, repeat: 1 });
    } else if (playerMove === 'Knee') {
        gsap.to("#player", { rotate: -15, duration: 0.5, yoyo: true, repeat: 1 });
    } else if (playerMove === 'Elbow') {
        gsap.to("#player", { rotate: 15, duration: 0.5, yoyo: true, repeat: 1 });
    }

    // Show ai move animation
    if (aiMove === 'Punch') {
        gsap.to("#ai", { x: -50, rotate: -15, duration: 0.5, yoyo: true, repeat: 1 });
    } else if (aiMove === 'Kick') {
        gsap.to("#ai", { x: -70, rotate: 15, duration: 0.5, yoyo: true, repeat: 1 });
    } else if (aiMove === 'Knee') {
        gsap.to("#ai", { rotate: 15, duration: 0.5, yoyo: true, repeat: 1 });
    } else if (aiMove === 'Elbow') {
        gsap.to("#ai", { rotate: -15, duration: 0.5, yoyo: true, repeat: 1 });
    }
}

function resetAnimations() {
    gsap.set("#player", { clearProps: "all" });
    gsap.set("#ai", { clearProps: "all" });
}

// End the round and update points
function endRound() {
    const resultElement = document.getElementById('result');
    const playerPointsElement = document.getElementById('player-points');
    const aiPointsElement = document.getElementById('ai-points');

    if (aiKnockdowns > 0 && playerKnockdowns > 0 && aiKnockdowns === playerKnockdowns ) {
        playerTotalPoints += 10;
        aiTotalPoints += 10;
    } else if (aiKnockdowns > playerKnockdowns) {
        playerTotalPoints += 10;
        aiTotalPoints += 8;
    } else if (aiKnockdowns < playerKnockdowns) {
        playerTotalPoints += 8;
        aiTotalPoints += 10;           
    } else if (aiKnockdowns > 0 && playerKnockdowns > 0 && aiKnockdowns > playerKnockdowns) {
        playerTotalPoints += 10;
        aiTotalPoints += 8;             
    } else if (aiKnockdowns > 0 && playerKnockdowns > 0 && aiKnockdowns < playerKnockdowns) {
        playerTotalPoints += 8;
        aiTotalPoints += 10;    
    } else if (score > 0) {
        playerTotalPoints += 10;
        aiTotalPoints += 9;
    } else if (score < 0) {
        playerTotalPoints += 9;
        aiTotalPoints += 10;
    } else if (score = 0) {
        playerTotalPoints += 9;
        aiTotalPoints += 9;
    }    

    // Update points display
    playerPointsElement.innerHTML = `Player <br><br> Points: ${playerTotalPoints}`;
    aiPointsElement.innerHTML = `AI <br><br> Points: ${aiTotalPoints}`;

    // Reset knockdowns for the next round
    playerKnockdowns = 0;
    aiKnockdowns = 0;

    // Reset for the next round
    score = 0;
    strikesLeft = 28;
    round++;

    if (round > totalRounds) {
        endGame(); // End the game if all rounds are done
    } else {
        document.getElementById('round-info').innerHTML = `Round ${round} | Strikes left: 28`;
        resultElement.innerHTML = ''; // Clear result for new round

        // Clear knockdown messages
        document.getElementById('player-board').innerHTML = '';
        document.getElementById('ai-board').innerHTML = '';
    }
}
    
// End the game and determine winner
function endGame(message = '') {
    gameOver = true;
    const finalResultElement = document.getElementById('final-result');
    if (message) {
        finalResultElement.innerHTML = message;
        disableButtons();
        return;
    }

    if (playerTotalPoints > aiTotalPoints) {
        finalResultElement.innerHTML = 'Player Wins the Fight!';
    } else if (aiTotalPoints > playerTotalPoints) {
        finalResultElement.innerHTML = 'AI Wins the Fight!';
    } else {
        finalResultElement.innerHTML = 'The Fight is a Draw!';
    }

    disableButtons();
    document.getElementById('restart-btn').style.display = 'block'; // Show the restart button
}

function disableButtons() {
    document.getElementById('punch-btn').disabled = true;
    document.getElementById('kick-btn').disabled = true;
    document.getElementById('knee-btn').disabled = true;
    document.getElementById('elbow-btn').disabled = true;
}

function restartGame() {
    // Reset all game variables
    score = 0;
    strikesLeft = 28;
    round = 1;
    gameOver = false;
    playerKnockdowns = 0;
    aiKnockdowns = 0;
    playerTotalPoints = 0;
    aiTotalPoints = 0;

    resetAnimations();

    // Update UI
    document.getElementById('round-info').innerHTML = 'Round 1 | Strikes left: 28';
    document.getElementById('scoreboard').innerHTML = 'Score: 0';
    document.getElementById('final-result').innerHTML = '';
    document.getElementById('result').innerHTML = '';
    document.getElementById('player-points').innerHTML = 'Player<br><br> Points: 0';
    document.getElementById('ai-points').innerHTML = 'AI<br><br> Points: 0';
    document.getElementById('player-board').innerHTML = '';
    document.getElementById('ai-board').innerHTML = '';

    // Hide the restart button and enable action buttons
    document.getElementById('restart-btn').style.display = 'none';
    document.getElementById('punch-btn').disabled = false;
    document.getElementById('kick-btn').disabled = false;
    document.getElementById('knee-btn').disabled = false;
    document.getElementById('elbow-btn').disabled = false;
}

// Disable strike buttons after knockout or game end
function disableButtons() {
    document.getElementById('punch-btn').disabled = true;
    document.getElementById('kick-btn').disabled = true;
    document.getElementById('knee-btn').disabled = true;
    document.getElementById('elbow-btn').disabled = true;
}

// Add selected moves to combo (max 4)
function selectMove(move) {
    if (comboMoves.length < 4) {
        comboMoves.push(move);
        updateComboDisplay();
    }
    if (comboMoves.length === 4) {
        document.getElementById('confirm-btn').style.display = 'inline-block';
    }
}

// Update the display to show selected combo
function updateComboDisplay() {
    document.getElementById('combo-moves').innerText = "Selected Moves: " + comboMoves.join(', ');
}

// Execute the combo using GSAP timeline
function executeCombo() {
    const timeline = gsap.timeline();

    // Loop through combo and add each move animation to the timeline
    comboMoves.forEach((move) => {
        timeline.to("#player", { onComplete: () => playGame(move) });
    });

    // After the combo executes reset moves
    timeline.call(() => {
        resetCombo();
    });

    const resultElement = document.getElementById('result');
    resultElement.innerHTML = ''; // Clear result for new round
}

// Reset the combo and UI after executing the combo
function resetCombo() {
    comboMoves = [];
    document.getElementById('combo-moves').innerText = "Setup combo: None";
    document.getElementById('confirm-btn').style.display = 'none';
}