(() => {
  "use strict";

  /* ------------------------------------------------------------------
     콘텐츠: 질문 & 유형 정의
     ------------------------------------------------------------------ */

  const QUESTIONS = [
    {
      text: "새 프로젝트를 시작할 때, 당신은?",
      options: [
        { label: "요구사항과 정보 구조부터 정리한다", type: "A" },
        { label: "레퍼런스와 무드보드부터 모은다", type: "B" },
      ],
    },
    {
      text: "디자인 리뷰에서 피드백을 받으면?",
      options: [
        { label: "비주얼과 디테일이 어떻게 보일지부터 생각한다", type: "B" },
        { label: "사용자에게 어떤 영향을 줄지부터 생각한다", type: "C" },
      ],
    },
    {
      text: "작업이 막힐 때 당신의 해결 방식은?",
      options: [
        { label: "플로우와 로직을 다시 그려본다", type: "A" },
        { label: "동료나 사용자에게 물어본다", type: "C" },
      ],
    },
    {
      text: "가장 뿌듯함을 느끼는 순간은?",
      options: [
        { label: "복잡한 걸 깔끔한 구조로 정리했을 때", type: "A" },
        { label: "보자마자 '예쁘다'는 반응을 받을 때", type: "B" },
      ],
    },
    {
      text: "팀에서 당신의 역할은 주로?",
      options: [
        { label: "톤앤매너와 비주얼 완성도를 책임진다", type: "B" },
        { label: "사용자 입장을 대변하고 조율한다", type: "C" },
      ],
    },
  ];

  // 동점일 때 우선순위: A > B > C
  const TYPES = {
    A: {
      tagline: "The Architect",
      name: "구조형 설계자",
      desc: "복잡한 문제를 논리적 구조로 정리하는 걸 즐기는 당신. 정보 구조와 시스템, 일관성에서 강점을 발휘해요.",
    },
    B: {
      tagline: "The Visualist",
      name: "감각형 비주얼리스트",
      desc: "보는 순간 마음을 움직이는 디자인을 만드는 당신. 색과 타이포, 무드에 예민한 감각을 가졌어요.",
    },
    C: {
      tagline: "The Communicator",
      name: "공감형 커뮤니케이터",
      desc: "사용자와 팀 사이를 잇는 다리 역할을 하는 당신. 이야기와 공감으로 디자인을 설득해요.",
    },
  };

  const TYPE_PRIORITY = ["A", "B", "C"];

  /* ------------------------------------------------------------------
     상태 (새로고침 시 초기화 — 저장하지 않음)
     ------------------------------------------------------------------ */

  const state = {
    screen: "start", // 'start' | 'question' | 'result'
    questionIndex: 0,
    answers: [], // 선택한 type을 문항 순서대로 기록 (뒤로가기용)
  };

  /* ------------------------------------------------------------------
     DOM 참조
     ------------------------------------------------------------------ */

  const screens = {
    start: document.getElementById("screen-start"),
    question: document.getElementById("screen-question"),
    result: document.getElementById("screen-result"),
  };

  const btnStart = document.getElementById("btn-start");
  const btnBack = document.getElementById("btn-back");
  const btnRestart = document.getElementById("btn-restart");
  const btnShare = document.getElementById("btn-share");

  const questionCard = document.getElementById("question-card");
  const questionText = document.getElementById("question-text");
  const optionsEl = document.getElementById("options");
  const progressFill = document.getElementById("progress-fill");
  const progressLabel = document.getElementById("progress-label");
  const progressBar = document.getElementById("progress");

  const resultTagline = document.getElementById("result-tagline");
  const resultName = document.getElementById("result-name");
  const resultDesc = document.getElementById("result-desc");

  const toast = document.getElementById("toast");

  /* ------------------------------------------------------------------
     화면 전환
     ------------------------------------------------------------------ */

  function showScreen(name) {
    state.screen = name;
    Object.entries(screens).forEach(([key, el]) => {
      el.classList.toggle("active", key === name);
    });
  }

  /* ------------------------------------------------------------------
     질문 렌더링
     ------------------------------------------------------------------ */

  function renderQuestion(animate) {
    const index = state.questionIndex;
    const question = QUESTIONS[index];

    const draw = () => {
      questionText.textContent = question.text;
      optionsEl.innerHTML = "";

      question.options.forEach((option) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "option";
        btn.textContent = option.label;
        btn.addEventListener("click", () => handleAnswer(option.type));
        optionsEl.appendChild(btn);
      });

      const total = QUESTIONS.length;
      progressFill.style.width = `${((index + 1) / total) * 100}%`;
      progressLabel.textContent = `${index + 1} / ${total}`;
      progressBar.setAttribute("aria-valuenow", String(index + 1));

      btnBack.disabled = index === 0;
    };

    if (!animate) {
      draw();
      return;
    }

    questionCard.classList.add("is-changing");
    window.setTimeout(() => {
      draw();
      questionCard.classList.remove("is-changing");
    }, 150);
  }

  /* ------------------------------------------------------------------
     이벤트 핸들러
     ------------------------------------------------------------------ */

  function handleAnswer(type) {
    state.answers[state.questionIndex] = type;

    const isLast = state.questionIndex === QUESTIONS.length - 1;
    if (isLast) {
      window.setTimeout(showResult, 150);
    } else {
      state.questionIndex += 1;
      renderQuestion(true);
    }
  }

  function handleBack() {
    if (state.questionIndex === 0) return;
    state.questionIndex -= 1;
    renderQuestion(true);
  }

  function computeResultType() {
    const scores = { A: 0, B: 0, C: 0 };
    state.answers.forEach((type) => {
      if (type) scores[type] += 1;
    });

    return TYPE_PRIORITY.reduce((best, type) =>
      scores[type] > scores[best] ? type : best
    , TYPE_PRIORITY[0]);
  }

  function showResult() {
    const typeKey = computeResultType();
    const type = TYPES[typeKey];

    resultTagline.textContent = type.tagline;
    resultName.textContent = type.name;
    resultDesc.textContent = type.desc;

    showScreen("result");
  }

  function handleRestart() {
    state.questionIndex = 0;
    state.answers = [];
    renderQuestion(false);
    showScreen("start");
  }

  let toastTimer = null;
  function handleShare() {
    // 스코프 상 실제 공유 동작은 없음 — 시각적 피드백만 제공.
    toast.textContent = "공유 기능은 준비 중이에요";
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 1800);
  }

  /* ------------------------------------------------------------------
     초기화
     ------------------------------------------------------------------ */

  btnStart.addEventListener("click", () => {
    renderQuestion(false);
    showScreen("question");
  });
  btnBack.addEventListener("click", handleBack);
  btnRestart.addEventListener("click", handleRestart);
  btnShare.addEventListener("click", handleShare);
})();
