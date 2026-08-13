const questions = [
  { question: 'What do we call learners at BRIGHTCODERS?', answers: ['Little Heroes', 'Super Teachers', 'Bright Stars'], correct: 0 },
  { question: 'Which value means asking questions and exploring?', answers: ['Kindness', 'Curiosity', 'Courage'], correct: 1 },
  { question: 'What is our school motto?', answers: ['Learn today, lead tomorrow', 'For future, for better', 'Dream big always'], correct: 1 }
];
let current = 0;
const question = document.getElementById('question');
const answers = document.getElementById('answers');
const result = document.getElementById('game-result');
function showQuestion() {
  const item = questions[current]; result.textContent = ''; question.textContent = item.question; answers.innerHTML = '';
  item.answers.forEach((answer, index) => { const button = document.createElement('button'); button.className = 'answer'; button.textContent = answer; button.onclick = () => { result.textContent = index === item.correct ? 'Correct — you are a bright hero!' : 'Nice try! Choose a new question and keep learning.'; }; answers.appendChild(button); });
}
document.getElementById('next-question').onclick = () => { current = (current + 1) % questions.length; showQuestion(); };
document.querySelector('.menu-button').onclick = () => document.querySelector('.nav').classList.toggle('open');
showQuestion();

document.getElementById('admission-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = document.getElementById('form-message');
  message.textContent = 'Sending your enquiry…';
  try {
    const response = await fetch(`${window.APP_CONFIG.API_URL}/api/applications`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parent_name: form.elements[0].value, email: form.elements[1].value, learner_age: Number(form.elements[2].value) })
    });
    if (!response.ok) throw new Error('Unable to submit');
    form.reset(); message.textContent = 'Thank you! We will be in touch soon.';
  } catch { message.textContent = 'We could not send your enquiry. Please try again shortly.'; }
});
