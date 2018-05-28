/*
* A simple simon game copy
* Joelson Carvalho - 2017
*/

var Simon = (function() {
	var DEFAULT_SPEED = 0.8;
	var MAX_ROUNDS = 23;

	var gameState = {
		strict: false,
		running: false,
		userFail: false,
		sequence: [],
		userInput: [],
		colors: ['green', 'red', 'blue', 'yellow'],
		sequencePlaySpeed: DEFAULT_SPEED,
		isPlayingSequence: false,
		count: '--'
	}

	function playSequence() {
		gameState.isPlayingSequence = true;
		gameState.userFail = false;
		gameState.userInput = [];

		setTimeout(function() {
			GameAudio.playSequenceAudio(gameState.sequence);
			gameState.isPlayingSequence = false;
		}, 500);
	}

	function generateNewSequence(oldSequence) {
		var newSequence = oldSequence;
		var randomStep = Math.floor(Math.random() * 4);
		newSequence.push(randomStep);
		return newSequence;
	}

	function updateCount(count) {
		var countPanelContent = '.count-panel .count-content';

		if(Number.isInteger(count)) {
			count = (count < 10) ? '0' + count : count;
			$(countPanelContent).fadeIn(100).fadeOut(300).fadeIn(100); // Blink
			$(countPanelContent).text(count);
		}
		else if(count === '--' || count === '!!') {
			$(countPanelContent).text(count);
		}
		else {
			$(countPanelContent).empty();
		}
	}

	function toggleBtn(sequenceItem) {
		if(gameState.running) {
			$('.' + getBtnColorName(sequenceItem) + '-btn').toggleClass('active');
		}
	}

	function getBtnColorName(data) {
		return gameState.colors[data];
	}

	function getBtnColorIdx(data) {
		return gameState.colors.indexOf(data);
	}

	function deactivateBtn() {
		$('.buttons').removeClass('active');
	}


	function userWin() {
		gameState.isPlayingSequence = true;

		for(i = 0; i < 4; i++) {
			toggleBtn(i);
		}

		for(i = 0; i < MAX_ROUNDS; i++) {
			$('.count-panel .count-content').fadeOut(300).fadeIn(100); // Blink
		}

		alert('You have won this game, press start to play again...');
	}

	function handleBtn(btnColor) {
		if(canPlay()) {
			if(gameState.running && gameState.sequence.length > 0) {

				gameState.userInput.push(getBtnColorIdx(btnColor));
				var lastUserInputIdx = (gameState.userInput.length - 1);

				if(gameState.sequence[lastUserInputIdx] === gameState.userInput[lastUserInputIdx]) {
					if(gameState.sequence.length === gameState.userInput.length) {
						deactivateBtn();
						GameAudio.stopAudio();

						if(gameState.count === MAX_ROUNDS) {
							userWin();
						} else {
							updateCount(++gameState.count);
							gameState.sequencePlaySpeed += 0.2;
							gameState.sequence = generateNewSequence(gameState.sequence);
							playSequence();
						}
					}
				} else {
					alert("You have clicked in the wrong button!");

					updateCount('!!');

					gameState.userFail = true;

					GameAudio.stopAudio();

					if(gameState.strict) {
						Simon.startGame();
					} else {
						updateCount(gameState.count);
						deactivateBtn();
						playSequence();
					}
				}
			}
		}
	}

	function canPlay() {
		return gameState.running && (gameState.userFail === false) && (gameState.isPlayingSequence === false);
	}


	return {
		toggleGame: function() {
			if(gameState.running) {
				updateCount('');
				$('.start-game .slider').sliderToggle();

			} else {
				updateCount(gameState.count);
				$('.start-game .slider').sliderToggle();
			}

			deactivateBtn();
			GameAudio.stopAudio();
			gameState.running = !gameState.running;
		},

		startGame: function() {
			if(gameState.running) {
				gameState.sequence = [];
				gameState.userFail = false;
				gameState.count = 1;
				updateCount(gameState.count);
				deactivateBtn();
				GameAudio.stopAudio();
				gameState.sequence = generateNewSequence(gameState.sequence);
				playSequence();
			}
		},

		toggleStrict: function() {
			if(gameState.running) {
				gameState.strict = !gameState.strict;
				$('.strict-mode').sliderToggle();
			}
		},

		handleBtn: handleBtn,

		getGameSpeed: function() {
			return gameState.sequencePlaySpeed;
		},

		getGameScore: function() {
			return gameState.count;
		},

		canPlay: canPlay,
		toggleBtn: toggleBtn,
		getBtnColorIdx: getBtnColorIdx,
		getBtnColorName: getBtnColorName
	}
})();

var GameAudio = (function() {

	function playSequenceAudio(sequence, currentIdx) {
		currentIdx = currentIdx || 0;

		var soundUrl = getBtnSoundURL(sequence[currentIdx]);
		var currentPlaybackRate = Simon.getGameSpeed();

		Simon.toggleBtn(sequence[currentIdx]);

		playAudio(soundUrl, currentPlaybackRate, function() {
			Simon.toggleBtn(sequence[currentIdx]);

			if(currentIdx < (sequence.length - 1))
			{
				playSequenceAudio(sequence, ++currentIdx);
			}
		});
	}

	function playAudio(url, playbackRate, callback) {
		var sound = new Howl({
			src: [url],
			html5: true,
			autoplay: true,
			rate: playbackRate
		  });

		  sound.once('end', callback);
	}

	function stopAudio() {
		Howler.unload();
	}

	function getBtnSoundURL(data) {
		if(Number.isInteger(data)) {
			return 'https://s3.amazonaws.com/freecodecamp/simonSound'+ (data + 1) +'.mp3';
		} else {
			return 'https://s3.amazonaws.com/freecodecamp/simonSound'+ (Simon.getBtnColorIdx(data) + 1) +'.mp3';
		}
	}

	return {
		playSequenceAudio: playSequenceAudio,
		playAudio: playAudio,
		stopAudio: stopAudio,
		getBtnSoundURL: getBtnSoundURL
	}
})();

$(function() {
	// Slider toggle
	$.fn.sliderToggle = function() {
		var sliderIndicator = this.children();

		if(sliderIndicator.hasClass('active')) {
			sliderIndicator.removeClass('active');
			sliderIndicator.addClass('inactive');
		}
		else {
			sliderIndicator.addClass('active');
			sliderIndicator.removeClass('inactive');
		}
	};

	$('.start-game .slider').click(function() {
		Simon.toggleGame();
	});

	$('.start-btn').click(function() {
		Simon.startGame();
	});

	$('.strict-mode').click(function() {
		Simon.toggleStrict();
	});

	$('.buttons').click(function() {
		var btnColorName = extractBtnColor($(this).prop('class'));

		Simon.handleBtn(btnColorName);
	});

	$('.buttons').mousedown(function() {
		var btnColorName = extractBtnColor($(this).prop('class'));
		if(Simon.canPlay()) {
			GameAudio.playAudio(GameAudio.getBtnSoundURL(btnColorName), Simon.getGameSpeed());
		}
	});

	$('.buttons').mouseup(function() {
		if(Simon.canPlay())
			GameAudio.stopAudio();
	});

	function extractBtnColor(btnClass) {
		return btnClass.match(/^[a-z]+/)[0];
	}
});
