import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrading } from '../context/HybridGradingContext';
import { GradeChip } from '../components/GradeChip';
import type { Question, Quiz, QuizAttempt, Subject } from '../types';
import { supabase, isOnlineMode } from '../lib/supabase';

interface LearningModuleState {
  questions: Question[];
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  currentQuiz: Quiz | null;
  currentQuestionIndex: number;
  userAnswers: number[];
  quizStarted: boolean;
  quizCompleted: boolean;
  score: number;
  loading: boolean;
}

export const LearningModuleView: React.FC = () => {
  const { user, isOnline } = useAuth();
  const { subjects, activeStream } = useGrading();

  const [state, setState] = useState<LearningModuleState>({
    questions: [],
    quizzes: [],
    attempts: [],
    currentQuiz: null,
    currentQuestionIndex: 0,
    userAnswers: [],
    quizStarted: false,
    quizCompleted: false,
    score: 0,
    loading: true,
  });

  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [practiceMode, setPracticeMode] = useState(false);

  useEffect(() => {
    if (!isOnline || !user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }
    loadData();
  }, [isOnline, user, selectedSubject]);

  const loadData = async () => {
    if (!supabase) return;

    try {
      let questionsQuery = supabase
        .from('questions')
        .select('*')
        .eq('is_active', true);

      if (selectedSubject) {
        questionsQuery = questionsQuery.eq('subject_code', selectedSubject.toUpperCase());
      }

      const { data: questions } = await questionsQuery.limit(200);

      let quizzesQuery = supabase
        .from('quizzes')
        .select('*')
        .eq('school_id', user.school_id)
        .eq('is_published', true);

      if (selectedSubject) {
        quizzesQuery = quizzesQuery.eq('subject_code', selectedSubject.toUpperCase());
      }

      const { data: quizzes } = await quizzesQuery.order('start_at', { ascending: false });

      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('student_id', user.id)
        .order('started_at', { ascending: false });

      setState(prev => ({
        ...prev,
        questions: questions || [],
        quizzes: quizzes || [],
        attempts: attempts || [],
        loading: false,
      }));
    } catch (err) {
      console.error('[Learning] Failed to load data:', err);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const topics = useMemo(() => {
    const topicSet = new Set<string>();
    state.questions.forEach(q => {
      if (q.topic) topicSet.add(q.topic);
    });
    return Array.from(topicSet).sort();
  }, [state.questions]);

  const filteredQuestions = useMemo(() => {
    return state.questions.filter(q => {
      if (selectedTopic && q.topic !== selectedTopic) return false;
      return true;
    });
  }, [state.questions, selectedTopic]);

  const startQuiz = (quiz: Quiz) => {
    setState(prev => ({
      ...prev,
      currentQuiz: quiz,
      currentQuestionIndex: 0,
      userAnswers: new Array(quiz.questions.length).fill(-1),
      quizStarted: true,
      quizCompleted: false,
      score: 0,
    }));
  };

  const startPractice = () => {
    if (filteredQuestions.length === 0) return;
    const practiceQuestions = filteredQuestions.slice(0, 10);
    const practiceQuiz: Quiz = {
      id: 'practice',
      school_id: '',
      teacher_id: '',
      subject_code: selectedSubject,
      title: `Practice: ${selectedSubject}${selectedTopic ? ` - ${selectedTopic}` : ''}`,
      questions: practiceQuestions.map(q => q.id),
      time_limit_minutes: 0,
      max_attempts: 999,
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 365 * 86400000).toISOString(),
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    startQuiz(practiceQuiz);
    setPracticeMode(true);
  };

  const answerQuestion = (answerIndex: number) => {
    setState(prev => {
      const newAnswers = [...prev.userAnswers];
      newAnswers[prev.currentQuestionIndex] = answerIndex;
      return { ...prev, userAnswers: newAnswers };
    });
  };

  const nextQuestion = () => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: Math.min(prev.currentQuestionIndex + 1, (prev.currentQuiz?.questions.length || 0) - 1),
    }));
  };

  const prevQuestion = () => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: Math.max(prev.currentQuestionIndex - 1, 0),
    }));
  };

  const submitQuiz = async () => {
    if (!state.currentQuiz || !supabase || !user) return;

    const quiz = state.currentQuiz;
    const questions = state.questions.filter(q => quiz.questions.includes(q.id));
    let correct = 0;

    questions.forEach((q, i) => {
      if (state.userAnswers[i] === q.correct_answer) correct++;
    });

    const percentage = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

    if (!practiceMode) {
      try {
        await supabase.from('quiz_attempts').insert({
          school_id: user.school_id,
          quiz_id: quiz.id,
          student_id: user.id,
          answers: state.userAnswers,
          score: correct,
          percentage,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          time_spent_seconds: 0,
        });
      } catch (err) {
        console.error('[Learning] Failed to save attempt:', err);
      }
    }

    setState(prev => ({
      ...prev,
      quizCompleted: true,
      score: correct,
    }));
  };

  const currentQuestion = state.currentQuiz
    ? state.questions.find(q => q.id === state.currentQuiz?.questions[state.currentQuestionIndex])
    : null;

  if (!isOnline) {
    return (
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
        <div className="text-center py-12 bg-[#FEF3E2] border border-[#C2410C] rounded">
          <h2 className="text-xl font-bold text-[#C2410C] mb-2">Learning Module - Offline Mode</h2>
          <p className="text-[#5F5E5E]">Sign in online to access quizzes and practice questions.</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    return (
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-[#111111] mb-2">Student Access Required</h2>
          <p className="text-[#5F5E5E]">This module is for students only.</p>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#C2410C] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (state.quizStarted && state.currentQuiz) {
    return renderQuizInterface();
  }

  function renderQuizInterface() {
    if (!currentQuestion) return null;

    const progress = ((state.currentQuestionIndex + 1) / (state.currentQuiz?.questions.length || 1)) * 100;

    if (state.quizCompleted) {
      return (
        <div className="max-w-3xl mx-auto bg-white border border-[#DDD6C7] rounded overflow-hidden">
          <div className="bg-[#F8F3E9] border-b border-[#DDD6C7] px-4 py-4">
            <h2 className="font-headline-sm text-headline-sm text-[#111111]">Quiz Complete!</h2>
          </div>
          <div className="p-8 text-center">
            <div className="text-6xl font-bold text-[#C2410C] mb-4">{state.score}/{state.currentQuiz?.questions.length || 0}</div>
            <div className="text-2xl text-[#5F5E5E] mb-6">
              {state.currentQuiz?.questions.length ? Math.round((state.score / state.currentQuiz.questions.length) * 100) : 0}%
            </div>
            <p className="text-[#5F5E5E] mb-6">
              {state.score === state.currentQuiz?.questions.length
                ? 'Perfect score! Excellent work!'
                : state.score / (state.currentQuiz?.questions.length || 1) > 0.7
                ? 'Good job! Keep practicing to improve.'
                : 'Keep studying! Review the topics you missed.'}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setState(prev => ({ ...prev, quizStarted: false, quizCompleted: false, currentQuiz: null }))}
                className="px-6 py-3 bg-[#C2410C] text-white rounded font-semibold hover:opacity-95"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => startQuiz(state.currentQuiz!)}
                className="px-6 py-3 border border-[#C2410C] text-[#C2410C] rounded font-semibold hover:bg-[#FEF3E2]"
              >
                Retry Quiz
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto bg-white border border-[#DDD6C7] rounded overflow-hidden">
        <div className="bg-[#F8F3E9] border-b border-[#DDD6C7] px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-headline-sm text-headline-sm text-[#111111]">{state.currentQuiz?.title}</h2>
            <span className="text-sm text-[#5F5E5E]">Question {state.currentQuestionIndex + 1} of {state.currentQuiz?.questions.length}</span>
          </div>
          <div className="w-full bg-[#F2EDE3] h-2 rounded-none overflow-hidden">
            <div className="bg-[#C2410C] h-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-lg text-[#111111] mb-2">{currentQuestion.question_text}</p>
            {currentQuestion.explanation && !practiceMode && (
              <p className="text-sm text-[#5F5E5E] italic text-[#C2410C]">(Explanation shown after submission)</p>
            )}
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => answerQuestion(index)}
                disabled={state.quizCompleted}
                className={`w-full text-left p-4 rounded border-2 transition-colors ${
                  state.userAnswers[state.currentQuestionIndex] === index
                    ? 'border-[#C2410C] bg-[#FEF3E2]'
                    : 'border-[#DDD6C7] hover:border-[#C2410C] hover:bg-[#FBF8F1]'
                }`}
              >
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
              </button>
            ))}
          </div>

          {currentQuestion.explanation && state.quizCompleted && (
            <div className="mt-6 p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded">
              <h4 className="font-semibold text-[#166534] mb-1">Explanation</h4>
              <p className="text-[#166534]">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>

        <div className="bg-[#F8F3E9] border-t border-[#DDD6C7] px-4 py-3 flex items-center justify-between">
          <button
            onClick={prevQuestion}
            disabled={state.currentQuestionIndex === 0}
            className="px-4 py-2 border border-[#DDD6C7] text-[#111111] rounded hover:bg-[#F2EDE3] disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: state.currentQuiz?.questions.length || 0 }, (_, i) => (
              <button
                key={i}
                onClick={() => setState(prev => ({ ...prev, currentQuestionIndex: i }))}
                className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                  i === state.currentQuestionIndex
                    ? 'bg-[#C2410C] text-white'
                    : state.userAnswers[i] !== -1
                    ? 'bg-[#166534] text-white'
                    : 'bg-[#F2EDE3] text-[#5F5E5E] hover:bg-[#DDD6C7]'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {state.currentQuestionIndex === (state.currentQuiz?.questions.length || 0) - 1 ? (
            <button
              onClick={submitQuiz}
              className="px-6 py-2 bg-[#C2410C] text-white rounded font-semibold hover:opacity-95"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="px-6 py-2 bg-[#C2410C] text-white rounded font-semibold hover:opacity-95"
            >
              Next
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-8 font-body-md text-[#111111]">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between pb-4 sm:pb-6 border-b border-[#DDD6C7] gap-4 mb-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-[#111111] tracking-tight">Learning Module</h1>
          <p className="font-body-md text-xs sm:text-body-md text-[#5F5E5E] mt-1">
            Practice questions, take quizzes, track your progress
          </p>
        </div>
      </section>

      {/* Subject/Topic Filters */}
      <section className="bg-white border border-[#DDD6C7] rounded p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#111111] mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={e => { setSelectedSubject(e.target.value); setSelectedTopic(''); }}
              className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111111] mb-1">Topic</label>
            <select
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
              className="w-full px-3 py-2 border border-[#DDD6C7] rounded focus:outline-none focus:border-[#C2410C]"
            >
              <option value="">All Topics</option>
              {topics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={startPractice}
              disabled={filteredQuestions.length === 0}
              className="w-full px-4 py-2 bg-[#C2410C] text-white rounded font-semibold hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">quiz</span>
              Start Practice ({filteredQuestions.length} questions)
            </button>
          </div>
        </div>
      </section>

      {/* Available Quizzes */}
      <section className="mb-6">
        <h2 className="font-headline-sm text-headline-sm text-[#111111] mb-3">Available Quizzes</h2>
        {state.quizzes.length === 0 ? (
          <div className="bg-white border border-[#DDD6C7] rounded p-8 text-center text-[#5F5E5E]">
            No published quizzes available. Ask your teacher to create some!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.quizzes.map(quiz => {
              const attempt = state.attempts.find(a => a.quiz_id === quiz.id);
              return (
                <div key={quiz.id} className="bg-white border border-[#DDD6C7] rounded p-4 hover:border-[#C2410C] transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-[#111111]">{quiz.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      new Date(quiz.end_at) > new Date() ? 'bg-[#F0FDF4] text-[#166534]' : 'bg-[#F3F4F6] text-[#374151]'
                    }`}>
                      {new Date(quiz.end_at) > new Date() ? 'Active' : 'Expired'}
                    </span>
                  </div>
                  <p className="text-sm text-[#5F5E5E] mb-2">{quiz.description || 'No description'}</p>
                  <div className="flex items-center gap-4 text-xs text-[#5F5E5E] mb-3">
                    <span>{quiz.questions.length} questions</span>
                    <span>{quiz.time_limit_minutes} min</span>
                    <span>Max {quiz.max_attempts} attempts</span>
                  </div>
                  {attempt && (
                    <div className="mb-3 p-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded text-sm text-[#166534]">
                      Your best: {attempt.percentage}% ({attempt.score}/{quiz.questions.length})
                    </div>
                  )}
                  <button
                    onClick={() => startQuiz(quiz)}
                    className="w-full px-3 py-2 bg-[#C2410C] text-white rounded font-medium hover:opacity-95"
                  >
                    {attempt ? 'Retake Quiz' : 'Start Quiz'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Previous Attempts */}
      {state.attempts.length > 0 && (
        <section>
          <h2 className="font-headline-sm text-headline-sm text-[#111111] mb-3">Your Attempts</h2>
          <div className="bg-white border border-[#DDD6C7] rounded overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-[#111111] bg-[#F8F3E9] text-[10px] font-label-caps text-[#111111] uppercase tracking-wider">
                  <th className="py-2 px-3">QUIZ</th>
                  <th className="py-2 px-3 text-center">SCORE</th>
                  <th className="py-2 px-3 text-center">PERCENTAGE</th>
                  <th className="py-2 px-3 text-center">DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD6C7] font-body-sm">
                {state.attempts.slice(0, 10).map(attempt => {
                  const quiz = state.quizzes.find(q => q.id === attempt.quiz_id);
                  return (
                    <tr key={attempt.id} className="hover:bg-[#FBF8F1]">
                      <td className="py-2 px-3">{quiz?.title || 'Practice'}</td>
                      <td className="py-2 px-3 text-center font-tabular-sm">{attempt.score}/{quiz?.questions.length || '?'}</td>
                      <td className="py-2 px-3 text-center font-tabular-sm">
                        <span className={attempt.percentage >= 70 ? 'text-[#166534]' : attempt.percentage >= 50 ? 'text-[#C2410C]' : 'text-[#991B1B]'}>
                          {attempt.percentage}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center text-[#5F5E5E]">{new Date(attempt.started_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};