document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("trivia-form");
    const questionContainer = document.getElementById("question-container");
    const newPlayerButton = document.getElementById("new-player");
    const usernameInput = document.getElementById("username");
 
    // Initialize the game
    fetchQuestions();
    displayScores();
 
    // Event listeners for form submission and new player button
    form.addEventListener("submit", handleFormSubmit);
    newPlayerButton.addEventListener("click", startNewPlayer);
 
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
                ${createAnswerOptions(question.correct_answer, question.incorrect_answers, index)}
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
    function createAnswerOptions(correctAnswer, incorrectAnswers, questionIndex) {
        const allAnswers = [correctAnswer, ...incorrectAnswers].sort(
            () => Math.random() - 0.5
        );
        return allAnswers
            .map(
                (answer) => `
            <label>
                <input type="radio" name="answer${questionIndex}" value="${answer}" ${
                    answer === correctAnswer ? 'data-correct="true"' : ""
                }>
                ${answer}
            </label>
        `
            )
            .join("");
    }
 
    /**
     * Handles the trivia form submission.
     * @param {Event} event - The submit event.
     */
    function handleFormSubmit(event) {
        event.preventDefault(); // Prevents the form from submitting in the usual way
        let user = usernameInput.value.trim(); // Get the username from the input
        if (!user) {
            alert("Please enter your name!");
            return;
        }
 
        // Get all selected answers
        let answers = [];
        document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
            answers.push(input.value);
 
        });
 
        // Calculate score based on answers
        let score = calculateScore(answers);
        saveScore(user, score);
 
        displayScores();
 
        // Prepare the next question or refresh the game
        loadNewQuestion();
    }
 
    // Function to calculate score
    function calculateScore(selectedAnswers) {
        let score = 0;
        let questionElements = document.querySelectorAll("#question-container div");
 
        // Loop through all questions and check if the answer matches the correct answer
        selectedAnswers.forEach((answer, index) => {
            const correctAnswer = document.querySelector(
                `input[name="answer${index}"][data-correct="true"]`
            )?.value;
            if (answer === correctAnswer) {
                score += 1;
            }
        });
 
        return score;
    }
 
    // Function to save score
    function saveScore(user, score) {
        let scores = JSON.parse(localStorage.getItem("triviaScores")) || {};
        if (!scores[user]) {
            scores[user] = [];
        }
        scores[user].push(score);
        localStorage.setItem("triviaScores", JSON.stringify(scores));
    }
 
    // Display scores from localStorage
    function displayScores() {
        let scores = JSON.parse(localStorage.getItem("triviaScores")) || {};
        let scoreBoard = document.getElementById("score-table").getElementsByTagName('tbody')[0];
        scoreBoard.innerHTML = "";
 
        Object.keys(scores).forEach(user => {
            let userScores = scores[user].join(", ");
            let row = scoreBoard.insertRow();
            row.insertCell(0).textContent = user;
            row.insertCell(1).textContent = userScores;
        });
    }
 
    // Function to load a new question (reset UI and prepare for the next round)
    function loadNewQuestion() {
        // Reset any UI elements for the next question
        document.querySelectorAll('input[name="answer"]:checked').forEach(input => input.checked = false);
        fetchQuestions();
    }
   
 
    // Start a new player
    function startNewPlayer() {
        let user = usernameInput.value.trim();
        if (!user) {
            alert("Please enter a username to start!");
            return;
        }
 
        // Clear saved scores for the current user
        let scores = JSON.parse(localStorage.getItem("triviaScores")) || {};
        delete scores[user];
        localStorage.setItem("triviaScores", JSON.stringify(scores));
 
        alert("Welcome, " + user + "! Starting a new game...");
 
        // Reset the UI
        usernameInput.value = ''; // Clear the username input
        displayScores(); // Update the score display
        fetchQuestions(); // Load first question
    }
});
 
 