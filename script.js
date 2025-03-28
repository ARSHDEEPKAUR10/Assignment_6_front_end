/**
 * Initializes the Trivia Game when the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", function () {
	const form = document.getElementById("trivia-form");
	const questionContainer = document.getElementById("question-container");
	const newPlayerButton = document.getElementById("new-player");

	// Initialize the game
	// checkUsername(); Uncomment once completed
	fetchQuestions();
	displayScores();

	/**
	 * Fetches trivia questions from the API and displays them.
	 */
	function fetchQuestions() {
		showLoading(true); // Show loading state

		fetch("https://opentdb.com/api.php?amount=10&type=multiple")
			.then((response) => response.json())
			.then((data) => {
				displayQuestions(data.results);
				showLoading(false); // Hide loading state
			})
			.catch((error) => {
				console.error("Error fetching questions:", error);
				showLoading(false); // Hide loading state on error
			});
	}

	/**
	 * Toggles the display of the loading state and question container.
	 *
	 * @param {boolean} isLoading - Indicates whether the loading state should be shown.
	 */
	function showLoading(isLoading) {
		document.getElementById("loading-container").classList = isLoading
			? ""
			: "hidden";
		document.getElementById("question-container").classList = isLoading
			? "hidden"
			: "";
	}

	/**
	 * Displays fetched trivia questions.
	 * @param {Object[]} questions - Array of trivia questions.
	 */
	function displayQuestions(questions) {
		questionContainer.innerHTML = ""; // Clear existing questions
		questions.forEach((question, index) => {
			const questionDiv = document.createElement("div");
			questionDiv.innerHTML = `
                <p>${question.question}</p>
                ${createAnswerOptions(
					question.correct_answer,
					question.incorrect_answers,
					index
				)}
            `;
			questionContainer.appendChild(questionDiv);
		});
	}

	/**
	 * Creates HTML for answer options.
	 * @param {string} correctAnswer - The correct answer for the question.
	 * @param {string[]} incorrectAnswers - Array of incorrect answers.
	 * @param {number} questionIndex - The index of the current question.
	 * @returns {string} HTML string of answer options.
	 */
	function createAnswerOptions(
		correctAnswer,
		incorrectAnswers,
		questionIndex
	) {
		const allAnswers = [correctAnswer, ...incorrectAnswers].sort(
			() => Math.random() - 0.5
		);
		return allAnswers
			.map(
				(answer) => `
            <label>
                <input type="radio" name="answer${questionIndex}" value="_span class="hljs-subst">${answer}" ${
					answer === correctAnswer ? 'data-correct="true"' : ""
				}>
                ${answer}
            </label>
        `
			)
			.join("");
	}

	// Event listeners for form submission and new player button
	form.addEventListener("submit", handleFormSubmit);
	newPlayerButton.addEventListener("click", newPlayer);

	/**
	 * Handles the trivia form submission.
	 * @param {Event} event - The submit event.
	 */
	function handleFormSubmit(event) {
		event.preventDefault();
		//... form submission logic including setting cookies and calculating score
	}
});

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
    let nameEQ = name + "=";
    let cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i].trim();
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length);
        }
    }
    return null;
}
// Function to check username and update UI
function checkUsername() {
    const storedUsername = getCookie("username");
    if (storedUsername) {
        greeting.textContent = `Welcome back, ${storedUsername}!`;
        usernameInput.style.display = "none";
        startButton.style.display = "none";
    }
}

function calculateScore() {
    let score = 0;
    const formData = new FormData(document.getElementById("trivia-form"));

    formData.forEach((value, key) => {
        let correctAnswer = document.querySelector(`input[name="${key}"][data-correct="true"]`);
        if (correctAnswer && correctAnswer.value === value) {
            score += 1; 
        }
    });

    return score;
}
document.getElementById("trivia-form").addEventListener("submit", function (event) {
    event.preventDefault();

    let user = sessionStorage.getItem("user") || "Guest";
    let score = calculateScore(); 

    console.log(`User: ${user}, Score: ${score}`);
    saveScore(user, score);

    // Fetch new questions
    fetchTriviaQuestions();
});

function saveScore(user, score) {
    let scores = JSON.parse(localStorage.getItem("triviaScores")) || {};
    if (!scores[user]) {
        scores[user] = [];
    }
    scores[user].push(score);
    localStorage.setItem("triviaScores", JSON.stringify(scores));
}

function displayScores() {
    let scores = JSON.parse(localStorage.getItem("triviaScores")) || {};
    let scoreBoard = document.getElementById("score-board");
    scoreBoard.innerHTML = "<h3>Score History</h3>";

    Object.keys(scores).forEach(user => {
        let userScores = scores[user].join(", ");
        scoreBoard.innerHTML += `<p><strong>${user}:</strong> ${userScores}</p>`;
    });
}

// Call this function when the game starts to show previous scores
window.onload = displayScores;



