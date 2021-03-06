<template>
	<div class="card text-center">
		<div class="card-subitle">Správně: {{counter.correct}}, Špatně: {{counter.mistake}}</div>
		<div class="card-header">
			<div class="progress">
				<div
					class="progress-bar"
					role="progressbar"
					v-bind:style="{ width: progressPercent + '%' }"
					v-bind:aria-valuenow="progress.now"
					aria-valuemin="0"
					v-bind:aria-valuemax="progress.max"
				></div>
			</div>
		</div>
		<div class="card-body">
			<h5 class="card-title">{{ currentQuestion.text }}</h5>

			<button
				class="btn btn-primary"
				v-if="!correct && !mistake && !unknown"
				@click="submitAnswer(true);"
			>
				Ano
			</button>
			<button
				class="btn btn-primary"
				v-if="!correct && !mistake && !unknown"
				@click="submitAnswer(false);"
			>
				Ne
			</button>
			<button class="btn btn-primary" @click="nextQuestion">Další</button>
		</div>
		<div
			class="card-footer text-muted alert"
			v-bind:class="{
				'alert-success': correct,
				'alert-danger': mistake,
				'alert-warning': unknown
			}"
		>
			<span v-if="correct">Správně</span> <span v-else-if="mistake">Špatně</span>
			<span v-else-if="unknown">
				Spekulativní. Pokud jsi si jist(á) svou odpovědí, pošli mi mail na
				xlukm014@studenti.czu.cz
			</span>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { QuestionSet, Question } from '../question-set.ts';
import { deserializeMap } from '../utiliy.ts';

export default Vue.extend({
	name: 'Quiz',
	data() {
		return {
			currentQuestion: {
				text: 'Načítám...',
				answer: null
			},
			counter: {
				correct: 0,
				mistake: 0
			},
			correct: false,
			mistake: false,
			unknown: false,
			questionSet: QuestionSet,
			progress: { now: 0, max: 0 }
		};
	},
	computed: {
		progressPercent() {
			return (this.progress.now / this.progress.max) * 100;
		}
	},
	mounted() {
		const serializedAnswers = localStorage.getItem('answeredQuestions');
		const serializedCounter = localStorage.getItem('rightWrong');

		if (serializedAnswers) {
			this.questionSet = new QuestionSet(deserializeMap(serializedAnswers));
		} else {
			this.questionSet = new QuestionSet();
		}

		if (serializedCounter) {
			const counter = JSON.parse(serializedCounter);
			this.counter.correct = counter.correct;
			this.counter.mistake = counter.mistake;
		}

		this.currentQuestion = this.questionSet.getRandomUnanswered();
		this.updateProgress();
	},
	methods: {
		resetCurrentAnswer() {
			this.correct = false;
			this.mistake = false;
			this.unknown = false;
		},
		submitAnswer(answer: boolean) {
			this.resetCurrentAnswer();
			const answeredCorrectly = this.currentQuestion.answer === answer;

			if ([null, undefined].includes(this.currentQuestion.answer)) {
				this.unknown = true;
			} else if (answeredCorrectly) {
				this.correct = true;
				this.counter.correct++;
			} else {
				this.mistake = true;
				this.counter.mistake++;
			}
			this.questionSet.setAnswered(
				this.currentQuestion,
				this.unknown ? false : answeredCorrectly
			);
			localStorage.setItem('answeredQuestions', this.questionSet.getSerializedAnswered());
			localStorage.setItem('rightWrong', JSON.stringify(this.counter));
			this.updateProgress();
		},
		updateProgress() {
			this.progress = this.questionSet.getProgress();
		},
		nextQuestion(el: MouseEvent) {
			this.currentQuestion = this.questionSet.getRandomUnanswered();
			this.resetCurrentAnswer();
			el.currentTarget.blur();
		}
	}
});
</script>

<style scoped>
.card {
	max-width: 50rem;
	margin: auto;
}
</style>
