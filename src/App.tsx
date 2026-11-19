import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X, Globe, Moon, Sun, Volume2, VolumeX, Home, BookOpen, FlaskConical, Link as LinkIcon, ChevronRight, ChevronLeft, CheckCircle, XCircle, RotateCcw, User, LogOut } from 'lucide-react';

/* 
  ==========================================
  📊 學生學習歷程追蹤設定 (GOOGLE SHEETS 串接)
  請將您在 Google 試算表部署取得的「網頁應用程式網址 (https://script.google.com/macros/s/....../exec)」
  貼在下方引號中，系統就會自動將學生每一次登入的停留時間、點擊數與測驗成績獨立寫入您的試算表！
  ==========================================
*/
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx2K9a0Ru4WCbOYaYrxEhtdC_-qXQaxsuLm6NvVM5rrZ9NzbHckhmdFGKIdpnigKuFnKg/exec"; 

// ==========================================
// DATA & CONTENT (Bilingual Dictionary)
// ==========================================
const dict = {
  en: {
    brand: "GRADE Explorer",
    toggleLang: "中/EN",
    toggleTheme: "Theme",
    readAloud: "Read Aloud",
    stopReading: "Stop",
    logout: "Logout",
    login: {
      title: "Welcome to GRADE Learning",
      subtitle: "Please enter your details to begin your session.",
      group: "Group (e.g., G1)",
      studentId: "Student ID (e.g., 113212599)",
      name: "Name",
      start: "Start Learning"
    },
    menu: {
      overview: "0. Course Overview",
      topic1: "1. Intro to GRADE",
      topic2: "2. Risk of Bias",
      topic3: "3. Inconsistency",
      topic4: "4. Indirectness",
      topic5: "5. Imprecision",
      topic6: "6. Publication Bias",
      topic7: "7. Summary of Findings",
      lab: "Interactive Lab",
      resources: "External Resources"
    },
    footer: {
      version: "Version: 2026.04.28 © All Rights Reserved.",
      architect: "Architect: Prof. Wen-Chun Liao"
    },
    common: {
      overview: "Overview",
      highlights: "Highlights",
      details: "Detailed Explanation",
      cards: "Flip Cards",
      wrapup: "Wrap-up",
      quiz: "Knowledge Quiz",
      prev: "Previous Page",
      next: "Next Page",
      retry: "Retry",
      read: "Read",
      total: "Total",
      correct: "Correct",
      answered: "Answered"
    },
    lab: {
      title: "Interactive Lab",
      act1: { title: "1. OIS Concept", desc: "Understand OIS.", ctrlRate: "Control Event Rate", rrr: "Relative Risk Reduction (%)", result: "Required Sample Size:" },
      act2: { title: "2. CI Threshold Simulator", desc: "Adjust CI bounds against an important threshold.", lower: "Lower Bound", upper: "Upper Bound", result: "Decision:" },
      act3: { title: "3. RoB 2 Classification", desc: "Select the correct domain for 'Lack of Blinding'.", opt1: "Randomization", opt2: "Deviations from Interventions", opt3: "Missing Outcome Data" },
      act4: { title: "4. Funnel Plot Simulator", desc: "Click to add studies and observe small-study effects.", add: "Add Study", reset: "Reset" }
    },
    topics: [
      {
        id: 'overview',
        title: "0. Course Overview",
        overview: "Welcome to the GRADE system learning module. This course provides a systematic and transparent approach to grading the certainty of evidence and strength of recommendations.",
        highlights: ["Evaluates Certainty of Evidence and Recommendation Strength.", "Evidence-to-Decision (EtD) framework is crucial.", "High certainty ≠ Strong recommendation."],
        details: "The Grading of Recommendations Assessment, Development and Evaluation (GRADE) approach provides a transparent system for rating the certainty of evidence and strength of recommendations.\n\nIt is vital to distinguish between 'Certainty of Evidence' and 'Strength of Recommendation'. Completing the GRADE assessment does not automatically yield a clinical recommendation. Reviewers must use the Evidence-to-Decision (EtD) framework, which considers benefits and harms, patient values, resource use, equity, acceptability, and feasibility. High certainty of evidence does not necessarily equal a strong recommendation.\n\nThe official updated guidance can be found in the GRADE Book (book.gradepro.org).",
        img: { 
          url: "https://i.ibb.co/Wv8NY7YX/page6-flowchart.jpg",
          file: "page6-flowchart.jpg", 
          text: "Schematic view of GRADE's process for developing recommendations" 
        },
        cards: [
          { f: "What is the initial GRADE rating for an RCT?", b: "High Certainty (⊕⊕⊕⊕)" },
          { f: "Does High Certainty guarantee a Strong Recommendation?", b: "No. Recommendations require the EtD framework (values, resources, feasibility)." }
        ],
        wrapup: "Understanding the foundational starting points of GRADE and the role of the EtD framework is crucial.",
        quiz: [
          { q: "Which framework is used to move from evidence to a clinical recommendation?", opts: ["CONSORT", "PRISMA", "Evidence-to-Decision (EtD)", "STROBE"], ans: 2, exp: "The EtD framework is essential for making recommendations." },
          { q: "What does GRADE stand for?", opts: ["General Rating of Data Evaluation", "Grading of Recommendations, Assessment, Development and Evaluations", "Global Review of Academic Data Evidence", "Grading Research and Data Efficacy"], ans: 1, exp: "It stands for Grading of Recommendations, Assessment, Development and Evaluations." }
        ]
      },
      {
        id: 'topic1',
        title: "1. Intro to GRADE",
        overview: "The GRADE system classifies evidence certainty into four levels: High, Moderate, Low, and Very Low. Note the shift from 'Quality' to 'Certainty'.",
        highlights: ["High: True effect is similar to estimated effect.", "Moderate: True effect is close, but may be different.", "ROBINS-I allows observational studies to start High."],
        details: "In modern GRADE methodology, we refer to the 'Certainty of Evidence'. 'High' certainty means the authors have a lot of confidence that the true effect is similar to the estimated effect. 'Moderate' suggests the true effect is probably close, but there is a possibility that it is substantially different.\n\nWhile traditional rules state RCTs start at High and observational studies start at Low, the use of advanced tools like ROBINS-I for non-randomized interventions allows observational studies to start at High certainty, pending thorough evaluation of confounding and selection bias.\n\nThe overall GRADE certainty rating is usually determined by taking the lowest certainty from all critical outcomes.",
        img: [
          { 
            url: "https://i.ibb.co/Y7FzyZdw/image-certainty.png",
            file: "image_certainty.png", 
            text: "GRADE Certainty Levels and Initial Ratings" 
          },
          { 
            url: "https://i.ibb.co/ZpBJp6pD/image-GRADE-approach.jpg", 
            file: "image-GRADE-approach.jpg", 
            text: "GRADE’s approach to rating evidence" 
          }
        ],
        cards: [
          { f: "Define 'Moderate Certainty' Evidence", b: "Confidence that true effect lies close to the estimate, but may differ substantially." },
          { f: "If using ROBINS-I, where do observational studies start?", b: "They can start at High Certainty, prior to downgrading for biases." }
        ],
        wrapup: "Certainty reflects our confidence that the true effect lies within a specific range or threshold.",
        quiz: [
          { q: "Using traditional initial ratings (without ROBINS-I), observational studies start at what level?", opts: ["High", "Moderate", "Low", "Very Low"], ans: 2, exp: "Traditionally, they start at Low certainty." },
          { q: "If the true effect is probably markedly different, what is the level?", opts: ["High", "Moderate", "Low", "Very Low"], ans: 3, exp: "This describes Very Low certainty evidence." }
        ]
      },
      {
        id: 'topic2',
        title: "2. Risk of Bias",
        overview: "Risk of bias evaluates limitations in study design. Modern assessments use tools like RoB 2.",
        highlights: ["RoB 2 assesses 5 specific domains.", "Evaluate deviations from intended interventions.", "Sensitivity analysis results can hint at robust findings."],
        details: "Risk of bias (RoB) is the first domain for downgrading. Modern RCT evaluation relies on tools like the Cochrane RoB 2, which assesses five domains: bias arising from the randomization process, bias due to deviations from intended interventions, bias due to missing outcome data, bias in measurement of the outcome, and bias in selection of the reported result.\n\nIn observational studies, limitations frequently involve flawed measurement and failure to control for confounding. \n\nWhen transitioning from RoB assessments to a GRADE rating, if sensitivity analyses show that removing high-risk studies does not change the overall result, confidence in the effect may remain high, and downgrading might not be necessary.",
        img: [
          { 
            url: "https://i.ibb.co/b5c3mXrh/Risk-of-bias.jpg",
            file: "risk of bias.jpg", 
            text: "Follow bias through the trial" 
          }
        ],
        cards: [
          { f: "Name two domains from the RoB 2 tool.", b: "Randomization process, Missing outcome data, etc." },
          { f: "What does it imply if results remain the same after sensitivity analysis?", b: "Biases are unlikely to lower confidence in the overall effect." }
        ],
        wrapup: "Assess Risk of Bias systematically using validated tools (RoB 2, ROBINS-I) before downgrading.",
        quiz: [
          { q: "Which tool is the modern standard for assessing RoB in RCTs?", opts: ["Newcastle-Ottawa", "RoB 2", "STROBE", "PRISMA"], ans: 1, exp: "RoB 2 evaluates five specific domains for RCTs." },
          { q: "If biases are likely to lower confidence in the effect, how many levels do you downgrade?", opts: ["0", "1 or 2", "3", "4"], ans: 1, exp: "Serious limitations warrant a 1-level downgrade; very serious warrant 2." }
        ]
      },
      {
        id: 'topic3',
        title: "3. Inconsistency",
        overview: "Inconsistency occurs when studies yield widely differing estimates of effect that cannot be explained.",
        highlights: ["I² and non-overlapping CIs are clues, not absolute rules.", "Focus on unexplained variance.", "Explore a priori subgroup hypotheses."],
        details: "Reviewers should consider rating down for inconsistency when point estimates vary widely across studies. While a high I² statistic (e.g., > 70%) or non-overlapping Confidence Intervals (CIs) are strong visual and statistical clues, they should not trigger an automatic downgrade.\n\nThe core issue is whether the variance is *unexplained* and whether it changes our conclusion about the effect size or clinical importance. Before downgrading, it is imperative to look for explanations through a priori subgroup analyses (e.g., differences in populations or interventions). Note: Just because I² decreases after subgrouping does not automatically mean heterogeneity is properly explained.",
        img: [
          { 
            url: "https://i.ibb.co/97SC3Sx/direction-and-heterogeneity.png",
            file: "direction-and-heterogeneity.png", 
            text: "Direction and magnitude both matter" 
          }
        ],
        cards: [
          { f: "Is a high I² (>70%) an automatic reason to downgrade?", b: "No. It is a clue; you must check if the variance is unexplained and affects clinical conclusions." },
          { f: "Why check CI overlap in a forest plot?", b: "Non-overlapping CIs visually suggest inconsistency among study results." }
        ],
        wrapup: "Always seek to explain inconsistency clinically or methodologically before deciding to downgrade.",
        quiz: [
          { q: "If Confidence Intervals across studies do NOT overlap, this indicates:", opts: ["High precision", "Low Risk of Bias", "Potential Inconsistency", "Publication Bias"], ans: 2, exp: "Non-overlapping CIs are a visual indicator of potential inconsistency." },
          { q: "Which is the most appropriate approach to heterogeneity in GRADE?", opts: ["Always downgrade if I² > 50%", "Ignore it if p > 0.05", "Evaluate if unexplained variance changes clinical conclusions", "Only use fixed-effect models"], ans: 2, exp: "The focus is on unexplained variance and clinical impact." }
        ]
      },
      {
        id: 'topic4',
        title: "4. Indirectness",
        overview: "Indirectness refers to how well the available evidence matches the target clinical PICO question.",
        highlights: ["Degree of match with target PICO.", "Use of Surrogate Outcomes.", "Just because studies differ doesn't mean it's indirectness."],
        details: "Evidence is direct when it directly answers the target health care question. Indirectness occurs when there are discrepancies between the PICO of the available research and the target PICO. \n\nDifferences in populations might include applying data from adults to pediatric guidelines. Importantly, studies being different from *each other* is a matter of inconsistency; indirectness is about studies being different from the *target clinical question*.\n\nAnother critical form of indirectness is the use of surrogate outcomes (like cholesterol levels or tumor size) instead of patient-important outcomes (like mortality or quality of life). If the association between the surrogate and the patient-important outcome is uncertain, the certainty must be downgraded.",
        img: null,
        cards: [
          { f: "What is a Surrogate Outcome?", b: "A laboratory or physical sign used as a substitute for a clinically meaningful patient outcome." },
          { f: "What is the core question for evaluating indirectness?", b: "Does the existing evidence adequately match the target PICO?" }
        ],
        wrapup: "Ensure the evidence directly matches your Population, Intervention, Comparator, and Outcomes. If not, downgrade.",
        quiz: [
          { q: "Which of the following is a surrogate outcome?", opts: ["All-cause mortality", "Quality of Life score", "Blood pressure reduction", "Hospital admission rate"], ans: 2, exp: "Blood pressure is a surrogate for cardiovascular events/mortality." },
          { q: "If studies are very different from EACH OTHER, this is primarily an issue of:", opts: ["Indirectness", "Inconsistency", "Imprecision", "Risk of Bias"], ans: 1, exp: "Differences BETWEEN studies is Inconsistency. Differences from the TARGET question is Indirectness." }
        ]
      },
      {
        id: 'topic5',
        title: "5. Imprecision",
        overview: "Imprecision assesses whether data is robust enough to support a confident decision, utilizing Important Effect Thresholds.",
        highlights: ["Do not automatically downgrade if CI crosses 1 or 0.", "Set and justify Important Effect Thresholds.", "Avoid arbitrary '300/400' hard sample size rules."],
        details: "Modern GRADE methodology rejects the simplified rule of automatically downgrading just because a 95% CI crosses the null value (0 for MD, 1 for RR/OR). The core judgment revolves around 'Important Effect Thresholds'.\n\nReviewers must first define clinical thresholds for what constitutes an important benefit or harm. For example, if the Mean Difference (MD) is 0.2 and the CI is -1 to 1.4 (crossing 0), but the threshold for clinical importance is ±3, the entire CI lies within the 'no important difference' zone. Therefore, you do NOT downgrade for imprecision, despite crossing the null.\n\nConversely, if an MD is -3.5 (CI -6 to -1, not crossing 0), it might span both a 'trivial' effect and a 'highly important' effect. This uncertainty in decision-making warrants a downgrade. Furthermore, the old '300 events / 400 sample size' rule is merely a historical heuristic. Actual Optimal Information Size depends on expected effect, baseline risk, and power.",
        img: [
          { 
            url: "https://i.ibb.co/pv6X5W2r/imprecision.png",
            file: "imprecision.png", 
            text: "Does the CI cross a meaningful threshold?" 
          }
        ],
        cards: [
          { f: "Should you automatically downgrade if the 95% CI crosses the null value?", b: "No. You must evaluate it against predefined Important Effect Thresholds." },
          { f: "If a CI does NOT cross the null, is precision guaranteed to be adequate?", b: "No. The CI might still span both trivial and highly important effect ranges." }
        ],
        wrapup: "Imprecision is about decision-making uncertainty. Always define your clinical thresholds first.",
        quiz: [
          { q: "What is the primary factor in judging imprecision in modern GRADE?", opts: ["Whether sample size > 400", "Whether CI crosses the null value", "The relationship of the CI to Important Effect Thresholds", "Whether p < 0.05"], ans: 2, exp: "Thresholds dictate whether the uncertainty affects clinical decisions." },
          { q: "If a CI crosses 0, but remains entirely within the boundaries of 'trivial' effect thresholds, you should:", opts: ["Downgrade 1 level", "Downgrade 2 levels", "Not downgrade", "Upgrade 1 level"], ans: 2, exp: "If the decision (that there is no important effect) remains unchanged, precision is adequate." }
        ]
      },
      {
        id: 'topic6',
        title: "6. Publication Bias",
        overview: "Publication bias threatens validity, often detected through small-study effects in funnel plots. A symmetric funnel suggests low publication bias; asymmetry suggests possible bias or small-study effects- interpret in the context of heterogeneity and study characteristics",
        highlights: ["Funnel plots show symmetry/asymmetry.", "Asymmetry suggests small-study effects, not a definite diagnosis of bias.", "Egger's test requires at least 10 studies."],
        details: "Publication bias occurs when studies with 'negative' or uninteresting results remain unpublished, skewing the overall evidence base. While Funnel Plots are the primary visual tool used, modern methodology describes them in terms of 'symmetry' or 'asymmetry' rather than definitively diagnosing publication bias.\n\nAsymmetry suggests 'small-study effects', which could stem from actual publication bias, but also true heterogeneity, or methodological flaws in smaller studies. Conversely, a symmetrical plot lowers suspicion but does not entirely rule out publication bias. Statistical tests, such as Egger's test, can provide quantitative assessment but generally require a minimum of 10 studies to have sufficient statistical power. A non-significant Egger's test with fewer studies does not guarantee the absence of bias.",
        img: [
          { 
            url: "https://i.ibb.co/TDtSpgCR/Funnel-plot.jpg", 
            file: "Funnel-plot.jpg", 
            text: "Funnel Plot Assessment" 
          }
        ],
        cards: [
          { f: "Does a symmetrical funnel plot guarantee no publication bias?", b: "No. It lowers the suspicion, but cannot definitively rule it out." },
          { f: "Asymmetry in a funnel plot is an indicator of what broader phenomenon?", b: "Small-study effects (which may or may not be caused by publication bias)." }
        ],
        wrapup: "Be cautious when interpreting funnel plots. Asymmetry points to small-study effects, requiring further investigation.",
        quiz: [
          { q: "Asymmetry in a funnel plot is best described initially as:", opts: ["Definitive publication bias", "Small-study effects", "Data fabrication", "Inconsistency"], ans: 1, exp: "Asymmetry indicates small-study effects, which has multiple potential causes including pub bias." },
          { q: "What is the minimum number of studies generally required to confidently use the Egger test?", opts: ["3", "5", "10", "20"], ans: 2, exp: "At least 10 studies are required for sufficient statistical power." }
        ]
      },
      {
        id: 'topic7',
        title: "7. Summary of Findings",
        overview: "The Summary of Findings (SoF) table transparently presents outcomes, effects, and certainty, requiring robust footnotes.",
        highlights: ["The SoF table is the final, user-friendly output of GRADE.", "Footnotes must explicitly justify threshold choices and downgrades.", "Transparency is the hallmark of a high-quality SoF."],
        details: "The Summary of Findings (SoF) table, or Evidence Profile (EP), is the culmination of the GRADE process. It provides a concise summary of the key findings, including the PICO information, relative and absolute effects, and the final certainty rating for up to seven patient-important outcomes.\n\nThe most critical component of a high-quality SoF table is its footnotes. It is unacceptable for reviewers to simply write 'serious' when downgrading. Teaching applications and practical guidelines demand explicit justifications for transparency:\n- Which specific biases (from RoB 2) affected the result?\n- What specific 'Important Effect Threshold' was chosen for Imprecision?\n- What was the exact clinical logic that led to a 1 or 2 level downgrade?\nClear, transparent explanations ensure that decision-makers understand the true nature of the evidence certainty.",
        img: [
          { 
            url: "https://i.ibb.co/Z733n6v/So-Fs.png", 
            file: "sof_table_1_en.png", 
            text: "Summary of Findings (SoF) Table Example" 
          },
          { 
            url: "https://i.ibb.co/x8DJF9YW/EP.png", 
            file: "EP.png", 
            text: "Evidence Profile (EP) and Footnotes Example" 
          }
        ],
        cards: [
          { f: "How many outcomes are recommended at most in an SoF table?", b: "Up to 7 patient-important outcomes." },
          { f: "What critical information must footnotes for imprecision include?", b: "Explicit justification of predefined Important Effect Thresholds and decision logic." }
        ],
        wrapup: "The SoF table distills complex assessments into actionable information; always maintain high transparency in footnotes.",
        quiz: [
          { q: "Which footnote style best meets modern GRADE requirements in an SoF table?", opts: ["Imprecision: Serious - downgraded 1 level", "Imprecision: CI crossed predefined ±3 clinical threshold, causing decision uncertainty - downgraded 1 level", "Imprecision: Sample size < 400 - downgraded 1 level", "Imprecision: p > 0.05 - downgraded 1 level"], ans: 1, exp: "You must explicitly state the threshold used and the decision logic." },
          { q: "What is the most critical component for maintaining transparency in a high-quality SoF table?", opts: ["Table color scheme", "Length of PICO", "Detailed and logically justified Footnotes", "Including more than 10 outcomes"], ans: 2, exp: "Footnotes are the core for explaining all upgrading/downgrading judgments, ensuring process transparency." }
        ]
      }
    ]
  },
  tw: {
    brand: "GRADE 實證探索平台",
    toggleLang: "中/EN",
    toggleTheme: "切換主題",
    readAloud: "語音導讀",
    stopReading: "停止導讀",
    logout: "登出",
    login: {
      title: "歡迎來到 GRADE 互動學習平台",
      subtitle: "請輸入您的基本資料以開始學習並記錄歷程。",
      group: "組別 (例如：G1)",
      studentId: "學號 (例如：113212599)",
      name: "姓名",
      start: "開始學習"
    },
    menu: {
      overview: "0. 課程總覽",
      topic1: "1. GRADE 概論",
      topic2: "2. 偏差風險 (RoB)",
      topic3: "3. 不一致性 (Inconsistency)",
      topic4: "4. 間接性 (Indirectness)",
      topic5: "5. 不精確性 (Imprecision)",
      topic6: "6. 發表偏差 (Publication Bias)",
      topic7: "7. 總結結果表格 (SoF)",
      lab: "互動實驗室",
      resources: "外部學習資源"
    },
    footer: {
      version: "版本: 2026.04.28 © 版權所有",
      architect: "課程架構設計：廖玟君 教授 (Prof. Wen-Chun Liao)"
    },
    common: {
      overview: "核心概念",
      highlights: "學習重點",
      details: "詳細解說",
      cards: "翻翻卡練習",
      wrapup: "單元總結",
      quiz: "隨堂測驗",
      prev: "上一頁",
      next: "下一頁",
      retry: "重新練習",
      read: "已讀",
      total: "總數",
      correct: "答對",
      answered: "已作答"
    },
    lab: {
      title: "GRADE 互動實驗室",
      act1: { title: "1. 最佳資訊量 (OIS) 模擬器", desc: "調整對照組事件率與預期相對風險降低率 (RRR)，觀察所需樣本數變化。", ctrlRate: "對照組事件發生率 (CER)", rrr: "預期相對風險降低比例 (RRR %)", result: "預估所需總樣本數 (OIS):" },
      act2: { title: "2. 信賴區間與臨床門檻模擬器", desc: "調整 95% CI 上下界，觀察其與臨床重要門檻 (0.75 ~ 1.25) 的關係。", lower: "95% CI 下界 (Lower Bound)", upper: "95% CI 上界 (Upper Bound)", result: "GRADE 降級決策：" },
      act3: { title: "3. RoB 2 偏差領域分類挑戰", desc: "請問「研究過程中缺乏盲法 (Lack of Blinding) 導致照護差異」屬於 RoB 2 的哪個領域？", opt1: "隨機分配過程產生的偏差", opt2: "偏離預期介入措施產生的偏差", opt3: "結果數據缺失產生的偏差" },
      act4: { title: "4. 漏斗圖 (Funnel Plot) 小樣本效應模擬", desc: "點擊新增研究，觀察點位分佈不對稱（小樣本效應）的視覺呈現。", add: "新增研究點位", reset: "重置圖表" }
    },
    topics: [
      {
        id: 'overview',
        title: "0. 課程總覽",
        overview: "歡迎來到 GRADE 系統學習模組。本課程提供一套系統化且透明的方法，協助您評估「證據確定性 (Certainty of Evidence)」與「建議強度 (Strength of Recommendations)」。",
        highlights: ["區分「證據確定性」與「臨床建議強度」。", "從證據到決策 (EtD) 框架是形成臨床建議的核心。", "高確定性證據 ≠ 強烈建議。"],
        details: "GRADE (Grading of Recommendations Assessment, Development and Evaluation) 提供了一套透明且結構化的系統，用於評估證據的確定性以及臨床建議的強度。\n\n在學習的一開始，務必釐清「證據確定性 (Certainty of Evidence)」與「建議強度 (Strength of Recommendation)」是兩個截然不同的階段。完成 GRADE 的證據評級後，並不會自動產生臨床建議。評估者必須進一步使用「從證據到決策框架 (Evidence-to-Decision, EtD)」，綜合考量利弊平衡、病患價值觀與偏好、資源使用（成本）、健康公平性、可接受度與可行性。因此，「高確定性證據」絕對不等於「強烈建議」。\n\n最新的官方方法學指引可參閱 GRADE Book (book.gradepro.org)。",
        img: { 
          url: "https://i.ibb.co/Wv8NY7YX/page6-flowchart.jpg",
          file: "page6-flowchart.jpg", 
          text: "Schematic view of GRADE's process for developing recommendations" 
        },
        cards: [
          { f: "隨機對照試驗 (RCT) 在 GRADE 中的初始評級為何？", b: "高確定性 (High Certainty, ⊕⊕⊕⊕)" },
          { f: "擁有「高確定性」的證據，就一定會給出「強烈建議」嗎？", b: "不一定。形成建議需透過 EtD 框架綜合考量價值觀、資源與可行性等因素。" }
        ],
        wrapup: "掌握 GRADE 的起評點以及 EtD 決策框架的角色，是進入實證評讀的第一步。",
        quiz: [
          { q: "從「實證評級結果」轉化為「臨床實務建議」時，必須使用哪一個核心框架？", opts: ["CONSORT", "PRISMA", "Evidence-to-Decision (EtD)", "STROBE"], ans: 2, exp: "EtD (從證據到決策) 框架是連結證據確定性與臨床建議強度的核心工具。" },
          { q: "關於證據確定性與建議強度的關係，下列敘述何者正確？", opts: ["高確定性證據必然導出強烈建議", "低確定性證據絕對不能給出任何建議", "兩者需分開評估，高確定性證據在考量成本與價值觀後，仍可能僅給出條件式（弱）建議", "GRADE 只評估證據品質，不負責建議強度"], ans: 2, exp: "證據確定性只是 EtD 框架中的一環，建議強度還需考量利弊、價值觀與成本。" }
        ]
      },
      {
        id: 'topic1',
        title: "1. GRADE 概論",
        overview: "GRADE 系統將證據確定性分為四個等級：高 (High)、中 (Moderate)、低 (Low) 與極低 (Very Low)。請注意現代術語已由「品質 (Quality)」轉變為「確定性 (Certainty)」。",
        highlights: ["高確定性：非常有信心真實效果接近估計效果。", "中確定性：真實效果可能接近估計值，但仍可能存在實質差異。", "若使用 ROBINS-I 工具，觀察性研究亦可從「高確定性」起評。"],
        details: "在現代 GRADE 方法學中，我們使用「證據確定性 (Certainty of Evidence)」一詞。『高 (High)』確定性代表作者非常有信心真實效果與研究估計的效果相近；『中 (Moderate)』確定性則表示真實效果可能接近估計效果，但仍有可能存在實質上的差異。\n\n雖然傳統規則指出：隨機對照試驗 (RCT) 從「高」起評、觀察性研究從「低」起評；但在現代 GRADE 指引中，若針對非隨機介入研究使用進階的 ROBINS-I 工具（以嚴格Target Trial 概念評估），觀察性研究也可以從「高確定性」開始起評，隨後再針對干擾因子 (Confounding) 與選擇偏差進行完整且嚴格的降級評估。\n\n在決定整體的證據確定性時，原則上是以所有「關鍵結果指標 (Critical outcomes)」中最低的那個等級作為整體的最終評級。",
        img: [
          { 
            url: "https://i.ibb.co/Y7FzyZdw/image-certainty.png",
            file: "image_certainty.png", 
            text: "GRADE 四大確定性等級與初始評級標準" 
          },
          { 
            url: "https://i.ibb.co/ZpBJp6pD/image-GRADE-approach.jpg", 
            file: "image-GRADE-approach.jpg", 
            text: "GRADE 證據評級流程圖 (GRADE’s approach to rating evidence)" 
          }
        ],
        cards: [
          { f: "請定義「中度確定性 (Moderate Certainty)」的證據", b: "對效果估計值有中度信心：真實效果可能接近估計值，但仍有可能存在實質差異。" },
          { f: "若使用 ROBINS-I 工具評估觀察性研究，初始評級應從哪裡開始？", b: "可以從「高確定性 (High)」開始起評，接著再嚴格評估干擾與選擇偏差。" }
        ],
        wrapup: "證據確定性反映了我們對於「真實效果落在特定範圍或門檻內」的信心程度。",
        quiz: [
          { q: "在傳統初始評級規則中（未使用 ROBINS-I），觀察性研究預設從哪個等級開始起評？", opts: ["高 (High)", "中 (Moderate)", "低 (Low)", "極低 (Very Low)"], ans: 2, exp: "傳統規則中，觀察性研究因缺乏隨機分配，預設從「低 (Low)」確定性起評。" },
          { q: "當評估結果顯示「真實效果很可能與估計效果有顯著差異」時，屬於哪一個確定性等級？", opts: ["高 (High)", "中 (Moderate)", "低 (Low)", "極低 (Very Low)"], ans: 3, exp: "這正是「極低 (Very Low)」確定性的標準定義。" }
        ]
      },
      {
        id: 'topic2',
        title: "2. 偏差風險 (RoB)",
        overview: "偏差風險 (Risk of Bias) 旨在評估研究設計與執行上的限制。現代 RCT 評估標準採用 Cochrane RoB 2 工具。",
        highlights: ["RoB 2 涵蓋五大特定偏差領域。", "重視「偏離預期介入措施」與「結果測量」之偏差。", "敏感度分析 (Sensitivity analysis) 可協助判斷是否需要降級。"],
        details: "偏差風險 (Risk of Bias, RoB) 是考慮降級的第一個面向。現代針對隨機對照試驗 (RCT) 的評估主要依賴 Cochrane RoB 2 工具，該工具系統性地評估五個領域：\n1. 隨機分配過程產生的偏差 (Randomization process)\n2. 偏離預期介入措施產生的偏差 (Deviations from intended interventions)\n3. 結果數據缺失產生的偏差 (Missing outcome data)\n4. 結果測量產生的偏差 (Measurement of the outcome)\n5. 選擇性報告結果產生的偏差 (Selection of the reported result)\n\n在將單篇研究的 RoB 轉換為整個結果指標 (Outcome) 的 GRADE 評級時，必須進行整體權衡。如果「敏感度分析 (Sensitivity analysis)」顯示：將高偏差風險的研究剔除後，整體效應估計值並未改變，這暗示偏差並未實質影響結果，此時我們對結果仍具信心，可能「不需要」因為偏差風險而降級。",
        img: [
          { 
            url: "https://i.ibb.co/b5c3mXrh/Risk-of-bias.jpg",
            file: "risk of bias.jpg", 
            text: "追蹤臨床試驗全程的偏差風險 (Follow bias through the trial)" 
          }
        ],
        cards: [
          { f: "請舉出 RoB 2 工具中的任兩個評估領域", b: "隨機分配過程偏差、偏離預期介入措施、數據缺失、結果測量偏差、選擇性報告。" },
          { f: "如果剔除高風險研究後的「敏感度分析」結果維持不變，代表什麼意義？", b: "代表該偏差不太會降低我們對整體效果估計的信心，可能不需降級。" }
        ],
        wrapup: "在決定降級前，請務必使用經過驗證的工具 (如 RoB 2 或 ROBINS-I) 系統性地檢視研究限制對整體結果的實質影響。",
        quiz: [
          { q: "下列何者是目前評估隨機對照試驗 (RCT) 偏差風險的現代標準工具？", opts: ["Newcastle-Ottawa Scale", "Cochrane RoB 2", "STROBE", "PRISMA"], ans: 1, exp: "Cochrane RoB 2 是目前評估 RCT 偏差風險的標準工具，包含五個核心領域。" },
          { q: "當研究存在嚴重限制，且極可能降低我們對效果估計值的信心時，GRADE 應如何處理？", opts: ["不需降級", "降 1 級或 2 級", "直接降為極低", "升 1 級"], ans: 1, exp: "嚴重限制 (Serious) 通常降 1 級；非常嚴重限制 (Very serious) 則降 2 級。" }
        ]
      },
      {
        id: 'topic3',
        title: "3. 不一致性 (Inconsistency)",
        overview: "當不同研究間產出差異極大的效果估計值，且無法找到合理解釋時，即稱為不一致性（異質性）。",
        highlights: ["I² 值過高與信賴區間不重疊是「線索」，而非自動降級的絕對鐵則。", "核心在於「無法解釋的變異」是否影響臨床決策。", "降級前應先透過事先設定的次族群分析尋找解釋。"],
        details: "當各篇研究的效果點估計值 (Point estimates) 差異很大時，評估者應考慮因「不一致性 (Inconsistency)」而降級。雖然統計上的高 I² 值（例如 > 70%）或森林圖上各研究的信賴區間 (CIs) 彼此不重疊，都是強烈的視覺與統計線索，但它們「不應該」觸發自動降級。\n\n核心的判斷標準在於：這些變異是否「無法被解釋 (Unexplained)」，以及它是否會改變我們對整體效果大小或臨床重要性的結論（例如：所有研究都顯示極大好處，只是好處大小不同，且都超過臨床決策門檻，此時不一定需要降級）。\n\n在決定降級之前，必須先透過「事先設定 (a priori) 的次族群分析」（如不同族群、不同劑量）來尋找異質性的原因。請注意：即便分組後 I² 下降，仍須確認該次族群假說是否具備生物學與臨床合理性。",
        img: [
          { 
            url: "https://i.ibb.co/97SC3Sx/direction-and-heterogeneity.png",
            file: "direction-and-heterogeneity.png", 
            text: "效果的方向與幅度皆須納入考量 (Direction and magnitude both matter)" 
          }
        ],
        cards: [
          { f: "當看到 I² > 70% 時，是否應該無條件自動降級？", b: "不應該。I² 只是線索，必須評估變異是否無法解釋，以及是否影響臨床決策結論。" },
          { f: "為什麼在森林圖 (Forest plot) 中要觀察信賴區間 (CI) 是否重疊？", b: "信賴區間彼此不重疊，是暗示研究結果之間存在不一致性的重要視覺指標。" }
        ],
        wrapup: "切勿僅依賴單一統計數值（如 I²），應結合視覺化森林圖與臨床意義來綜合判斷不一致性。",
        quiz: [
          { q: "在森林圖中，若各篇研究的信賴區間 (Confidence Intervals) 彼此完全沒有重疊，這主要暗示了什麼問題？", opts: ["高精確性 (High precision)", "低偏差風險 (Low Risk of Bias)", "潛在的不一致性 (Potential Inconsistency)", "發表偏差 (Publication Bias)"], ans: 2, exp: "信賴區間不重疊是評估研究間結果不一致（異質性高）的關鍵視覺線索。" },
          { q: "在現代 GRADE 中，面對研究間的異質性，下列何種做法最為適當？", opts: ["只要 I² > 50% 就一律降級", "只要 p > 0.05 就完全忽略異質性", "評估無法解釋的變異是否跨越臨床門檻並影響決策結論", "一律改用固定效應模型 (Fixed-effect model)"], ans: 2, exp: "GRADE 強調評估無法解釋的變異是否對臨床決策產生實質影響。" }
        ]
      },
      {
        id: 'topic4',
        title: "4. 間接性 (Indirectness)",
        overview: "間接性旨在評估現有研究證據的 PICO，與我們目標臨床問題的 PICO 吻合的程度。",
        highlights: ["檢視現有證據與目標 PICO（族群、介入、比較、結果）的吻合度。", "使用替代指標 (Surrogate Outcomes) 是常見的間接性來源。", "研究「彼此不同」是不一致性；研究「與目標問題不同」才是間接性。"],
        details: "當現有研究能直接回答我們的目標健康照護問題時，該證據即具「直接性 (Directness)」。反之，當現有研究的 PICO 與我們指引或臨床問題鎖定的目標 PICO 存在落差時，就會產生「間接性 (Indirectness)」。\n\n例如在「族群 (P)」方面，將成年人的研究數據推論應用於兒童臨床指引。請特別釐清一個重要觀念：如果納入的各篇研究「彼此之間不同」，這屬於不一致性 (Inconsistency) 的範疇；如果這些研究「與我們想回答的目標臨床問題不同」，這才是間接性 (Indirectness)。\n\n另一種極為關鍵的間接性，是使用「替代結果指標 (Surrogate outcomes)」（例如：抽血的膽固醇數值、骨骼密度或腫瘤縮小程度），而非「對病患真正重要的結果指標 (Patient-important outcomes)」（例如：死亡率、骨折發生率或生活品質）。若替代指標與病患重要結果之間的關聯性不夠確定，就必須因為間接性而降級。",
        img: null,
        cards: [
          { f: "什麼是「替代結果指標 (Surrogate Outcome)」？", b: "以實驗室數據或生理徵象（如血壓、血糖值），作為臨床上對病患真正重要結果（如中風、死亡）的替代品。" },
          { f: "請區分「不一致性」與「間接性」的核心差異", b: "研究「彼此之間不同」是不一致性；現有研究「與目標臨床問題 (Target PICO) 不同」則是間接性。" }
        ],
        wrapup: "請確保證據能直接反映您的目標族群、介入、比較與對病患真正重要的結果，否則應考慮因間接性而降級。",
        quiz: [
          { q: "在評估高血壓藥物的實證時，下列何者屬於「替代結果指標 (Surrogate outcome)」？", opts: ["全因死亡率 (All-cause mortality)", "健康相關生活品質評分", "收縮壓下降毫米汞柱 (mmHg) 數值", "心肌梗塞住院率"], ans: 2, exp: "血壓數值下降本身病患無感，它是用來預測心血管事件與死亡率的「替代指標」。" },
          { q: "如果納入了 5 篇研究，這 5 篇研究的收案族群彼此差異極大，這主要屬於哪一個面向的問題？", opts: ["間接性 (Indirectness)", "不一致性 (Inconsistency)", "不精確性 (Imprecision)", "發表偏差 (Publication Bias)"], ans: 1, exp: "研究「彼此之間」的差異導致結果分歧，屬於不一致性；與「目標問題」不符才是間接性。" }
        ]
      },
      {
        id: 'topic5',
        title: "5. 不精確性 (Imprecision)",
        overview: "不精確性旨在透過「重要效果門檻 (Important Effect Thresholds)」，評估數據是否足夠支持一個確定的臨床決策。",
        highlights: ["切勿僅因 95% CI 跨越無效值 (0 或 1) 就自動降級！", "必須事先設定並清楚交代「重要效果門檻 (Thresholds)」。", "摒棄過去死板的「事件數 300 / 樣本數 400」硬性法則。"],
        details: "現代 GRADE 方法學已經明確揚棄了「只要 95% 信賴區間 (CI) 跨越無效值（MD 的 0，或 RR/OR 的 1）就自動降級」的簡化規則！評估不精確性的核心，完全圍繞著「重要效果門檻 (Important Effect Thresholds)」展開。\n\n評讀者在評估前，必須先定義多大的效果才算是具備「臨床重要益處」或「重要害處」的門檻。舉例來說：若某疼痛量表的平均差 (MD) 為 0.2 分，其 95% CI 為 -1 到 1.4 分（明顯跨越了無效值 0），但臨床上認為疼痛要改變 ±3 分以上才具臨床重要性（門檻為 ±3）。此時，整個信賴區間 (-1 ~ 1.4) 都完全落在「無臨床重要差異 (-3 ~ +3)」的區間內，我們對於「該介入沒有重要效果」的決策非常有信心，因此「不需要」因為跨越 0 而降級！\n\n反之，若 MD 為 -3.5 分，95% CI 為 -6 到 -1 分（完全沒有跨越 0，統計顯著 p < 0.05），但因為這個區間同時橫跨了「微不足道的效果 (-1)」與「極具重要性的效果 (-6)」，跨越了 -3 的門檻，導致臨床決策產生不確定性，此時反而「必須降級」！此外，過去常聽到的「300 個事件數 / 400 人樣本數」僅是歷史經驗法則，真正的最佳資訊量 (OIS) 必須視基準風險與預期效應大小而定。",
        img: [
          { 
            url: "https://i.ibb.co/FbpH1v4W/imprecision-Ch.png",
            fallbackUrl: "https://i.ibb.co/pv6X5W2r/imprecision.png",
            file: "imprecision-Ch.png", 
            text: "信賴區間是否跨越了具臨床意義的決策門檻？ (Does the CI cross a meaningful threshold?)" 
          }
        ],
        cards: [
          { f: "當 95% 信賴區間 (CI) 跨越無效值 (0 或 1) 時，應該自動降級嗎？", b: "不應該！必須檢視 CI 是否跨越事先定義的「臨床重要效果門檻 (Thresholds)」。" },
          { f: "如果 95% CI 完全沒有跨越無效值（具統計顯著），就保證精確性足夠嗎？", b: "不一定。若 CI 同時橫跨「微小效果」與「重要效果」的臨床門檻，仍需因為決策不確定而降級。" }
        ],
        wrapup: "不精確性評估的是「決策的不確定性」。請務必先定義您的臨床重要效果門檻，再檢視信賴區間落點。",
        quiz: [
          { q: "在現代 GRADE 指引中，判斷不精確性 (Imprecision) 的最核心依據為何？", opts: ["總樣本數是否大於 400 人", "95% CI 是否跨越無效值 (0 或 1)", "95% CI 與事先設定之「重要效果門檻 (Thresholds)」的相對關係", "p 值是否小於 0.05"], ans: 2, exp: "信賴區間是否跨越臨床重要門檻、進而影響臨床決策，才是判斷不精確性的核心。" },
          { q: "假設某結果指標的 95% CI 跨越了無效值 0，但整個區間完全落在「無臨床重要差異（微不足道）」的門檻範圍內，此時應如何處理？", opts: ["降 1 級", "降 2 級", "不需降級", "升 1 級"], ans: 2, exp: "因為整個 CI 都指向同一個結論（無臨床重要效果），決策並無不確定性，故不需降級。" }
        ]
      },
      {
        id: 'topic6',
        title: "6. 發表偏差 (Publication Bias)",
        overview: "發表偏差會威脅實證的有效性，通常透過漏斗圖中的「小樣本效應」來偵測。對稱的漏斗圖暗示發表偏差風險較低；不對稱則暗示可能存在發表偏差或小樣本效應，須結合異質性與研究特徵綜合判讀。",
        highlights: ["漏斗圖 (Funnel plots) 用於觀察視覺上的對稱性與不對稱性。", "圖形不對稱反映的是「小樣本效應」，不能直接斷定100%為發表偏差。", "使用 Egger's test 進行統計檢定時，通常至少需要 10 篇以上的研究。"],
        details: "當結果為「陰性（無統計顯著）」或不符合預期的研究較難被期刊接受發表時，就會產生發表偏差 (Publication Bias)，導致我們看到的整體證據高估了真實療效。雖然漏斗圖 (Funnel Plot) 是最主要的視覺評估工具，但現代方法學強調應以「對稱 (Symmetry)」或「不對稱 (Asymmetry)」來描述圖形，而非直接看圖斷定發表偏差。\n\n漏斗圖呈現不對稱，直接反映的是「小樣本效應 (Small-study effects)」——亦即小樣本研究傾向報告出較大的療效。造成小樣本效應的原因除了真正的發表偏差外，還可能包括：真實的臨床異質性（例如小研究剛好針對高風險重症患者），或是小研究本身的方法學品質較差。反之，對稱的漏斗圖雖能降低疑慮，但也不能完全排除發表偏差。此外，若要使用 Egger's test 等統計檢定，通常至少需要納入 10 篇以上的研究才具備足夠的統計檢定力 (Power)。",
        img: [
          { 
            url: "https://i.ibb.co/TDtSpgCR/Funnel-plot.jpg", 
            file: "Funnel-plot.jpg", 
            text: "漏斗圖評估與小樣本效應判讀 (Funnel Plot Assessment)" 
          }
        ],
        cards: [
          { f: "對稱的漏斗圖 (Symmetrical funnel plot) 能保證絕對沒有發表偏差嗎？", b: "不能。對稱性可降低懷疑，但無法百分之百排除發表偏差的可能性。" },
          { f: "漏斗圖呈現「不對稱 (Asymmetry)」時，最精確的初步描述現象為何？", b: "小樣本效應 (Small-study effects)，發表偏差只是造成此現象的可能原因之一。" }
        ],
        wrapup: "判讀漏斗圖時請保持謹慎，圖形不對稱指向小樣本效應，需進一步結合研究特徵與異質性來綜合推論。",
        quiz: [
          { q: "當我們在漏斗圖中觀察到明顯的不對稱 (Asymmetry) 時，最嚴謹的初步描述應為下列何者？", opts: ["確診為發表偏差", "存在小樣本效應 (Small-study effects)", "研究數據造假", "存在嚴重的不一致性"], ans: 1, exp: "不對稱直接反映的是小樣本效應，背後原因可能包含發表偏差、異質性或方法學瑕疵。" },
          { q: "若要使用 Egger's test 來檢定漏斗圖的不對稱性，一般建議至少需要幾篇以上的研究才具足夠檢定力？", opts: ["3 篇", "5 篇", "10 篇", "20 篇"], ans: 2, exp: "研究數量少於 10 篇時，統計檢定力通常不足，容易出現偽陰性。" }
        ]
      },
      {
        id: 'topic7',
        title: "7. 總結結果表格 (SoF)",
        overview: "總結結果表格 (Summary of Findings, SoF) 以透明的方式呈現研究結果、效應值與證據確定性，並高度依賴嚴謹的腳註說明。",
        highlights: ["SoF 表格是 GRADE 評估最終、最友善讀者的核心產出。", "腳註 (Footnotes) 必須明確交代門檻選擇與降級的具體臨床邏輯。", "高度的「透明度 (Transparency)」是一份高品質 SoF 表格的靈魂。"],
        details: "總結結果表格 (Summary of Findings, SoF) 或證據概況表 (Evidence Profile, EP) 是整個 GRADE 評讀流程的最終結晶。它以簡明扼要的方式，針對最多 7 個對病患重要的結果指標，呈現 PICO 資訊、相對效應與絕對效應估計值，以及最終的證據確定性評級。\n\n一份高品質 SoF 表格最關鍵的靈魂在於其「腳註 (Footnotes)」。在現代的實證教學與指引制定中，降級時若只在腳註寫下「嚴重不精確 (Serious imprecision)」是完全不及格的！為了落實 GRADE 最核心的「透明度」精神，腳註必須清楚交代：\n1. 具體是哪一個偏差領域（例如 RoB 2 的缺乏盲法）影響了結果？\n2. 評估不精確性時，明確選定了什麼數值作為「重要效果門檻 (Threshold)」？\n3. 導致降 1 級或降 2 級的確切臨床推論邏輯為何？\n唯有提供清晰、透明的腳註解釋，才能讓臨床決策者真正理解該證據確定性背後的實質內涵。",
        img: [
          { 
            url: "https://i.ibb.co/Z733n6v/So-Fs.png", 
            file: "sof_table_1_tw.png", 
            text: "總結結果表格 (SoF Table) 範例" 
          },
          { 
            url: "https://i.ibb.co/x8DJF9YW/EP.png", 
            file: "EP.png", 
            text: "詳細證據概況表 (Evidence Profile, EP) 與腳註範例" 
          }
        ],
        cards: [
          { f: "SoF 表格建議最多呈現幾個結果指標？", b: "最多 7 個對病患重要的結果指標 (Patient-important outcomes)。" },
          { f: "SoF 表格中，針對不精確性的腳註必須包含什麼關鍵資訊？", b: "必須明確交代事先設定的「重要效果門檻 (Thresholds)」數值，以及決策受影響的邏輯。" }
        ],
        wrapup: "SoF 表格將所有繁雜的評估收斂為可行動的資訊，請務必在腳註中落實高度的透明度。",
        quiz: [
          { q: "在填寫 SoF 表格的腳註時，下列何種寫法最符合現代 GRADE 的要求？", opts: ["不精確性：嚴重 (Serious) - 降一級", "不精確性：95% CI 跨越了事先設定的 ±3 分臨床重要門檻，導致決策不確定 - 降一級", "不精確性：樣本數小於 400 - 降一級", "不精確性：p 值大於 0.05 - 降一級"], ans: 1, exp: "必須具體交代使用的門檻以及決策受影響的邏輯，才能確保透明度。" },
          { q: "一份高品質的 SoF 表格，其維持「透明度」的最關鍵組成部分為何？", opts: ["表格的顏色", "PICO 的長度", "詳細且具邏輯說明的腳註 (Footnotes)", "包含超過 10 個結果指標"], ans: 2, exp: "腳註 (Footnotes) 是交代所有主觀升降級判斷的核心，確保了流程的透明度。" }
        ]
      }
    ]
  }
};


// ==========================================
// CUSTOM HOOK: Learning History & Google Sheets Sync (Session-Based)
// ==========================================
const useTracker = () => {
  const [sessionInfo, setSessionInfo] = useState({ loggedIn: false, sessionId: '', loginTime: '', group: '', studentId: '', name: '' });
  const [localHistory, setLocalHistory] = useState({ global: { time: 0, clicks: 0 }, pages: {} });
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'saved'
  const historyRef = useRef(localHistory);
  const sessionRef = useRef(sessionInfo);

  useEffect(() => { historyRef.current = localHistory; }, [localHistory]);
  useEffect(() => { sessionRef.current = sessionInfo; }, [sessionInfo]);

  const syncToGoogleSheet = useCallback(async () => {
    if (!sessionRef.current.loggedIn || !GOOGLE_SCRIPT_URL) return;
    setSyncStatus('syncing');
    try {
      const payload = {
        sessionId: sessionRef.current.sessionId,
        loginTime: sessionRef.current.loginTime,
        lastUpdateTime: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
        group: sessionRef.current.group,
        studentId: sessionRef.current.studentId,
        name: sessionRef.current.name,
        totalTimeSec: historyRef.current.global.time,
        totalClicks: historyRef.current.global.clicks,
        pagesDetail: JSON.stringify(historyRef.current.pages)
      };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err) {
      console.error("Sync error:", err);
      setSyncStatus('idle');
    }
  }, []);

  const login = (info) => {
    const now = new Date();
    const loginTimeStr = now.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    const uniqueSessionId = `${String(info.studentId).trim()}_${now.getTime()}`;
    // Reset local history so every new login session starts completely fresh
    setLocalHistory({ global: { time: 0, clicks: 0 }, pages: {} });
    setSessionInfo({
      ...info,
      loggedIn: true,
      sessionId: uniqueSessionId,
      loginTime: loginTimeStr
    });
  };

  const logout = async () => {
    // Save final progress before logging out, then wipe all local state cleanly
    await syncToGoogleSheet();
    setLocalHistory({ global: { time: 0, clicks: 0 }, pages: {} });
    setSessionInfo({ loggedIn: false, sessionId: '', loginTime: '', group: '', studentId: '', name: '' });
  };

  const updateHistory = useCallback((pageId, updates) => {
    setLocalHistory(prev => {
      const pageData = prev.pages[pageId] || { time: 0, clicks: 0, cardsRead: 0, quizCorrect: 0, quizTotal: 0 };
      return {
        global: {
          time: prev.global.time + (updates.global?.time || 0),
          clicks: prev.global.clicks + (updates.global?.clicks || 0)
        },
        pages: {
          ...prev.pages,
          [pageId]: {
            ...pageData,
            time: pageData.time + (updates.page?.time || 0),
            clicks: pageData.clicks + (updates.page?.clicks || 0),
            cardsRead: updates.page?.cardsRead !== undefined ? updates.page.cardsRead : pageData.cardsRead,
            quizCorrect: updates.page?.quizCorrect !== undefined ? updates.page.quizCorrect : pageData.quizCorrect,
            quizTotal: updates.page?.quizTotal !== undefined ? updates.page.quizTotal : pageData.quizTotal
          }
        }
      };
    });
  }, []);

  return { sessionInfo, login, logout, localHistory, updateHistory, syncToGoogleSheet, syncStatus };
};


// ==========================================
// UI COMPONENTS
// ==========================================

const Header = ({ lang, setLang, theme, setTheme, onMenuToggle, speakContent, isSpeaking, syncToGoogleSheet, syncStatus, onLogout, studentName }) => {
  const d = dict[lang];
  return (
    <header className="sticky top-0 z-50 bg-slate-50/90 dark:bg-[#022c22]/90 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-emerald-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onMenuToggle} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-emerald-900/50">
            <Menu className="w-6 h-6 dark:text-emerald-100" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-xl text-slate-800 dark:text-emerald-50 hidden sm:block">{d.brand}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {GOOGLE_SCRIPT_URL && (
            <button
              onClick={syncToGoogleSheet}
              className="px-3 py-1.5 text-xs font-bold rounded-md bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 dark:bg-teal-900/50 dark:text-teal-100 dark:border-teal-700 transition-all"
              title="手動同步學習歷程至雲端試算表"
            >
              {syncStatus === 'syncing' ? (lang === 'en' ? '⏳ Syncing...' : '⏳ 同步中...') : syncStatus === 'saved' ? (lang === 'en' ? '✅ Saved' : '✅ 已儲存') : (lang === 'en' ? '💾 Save Progress' : '💾 儲存紀錄')}
            </button>
          )}
          <button
            onClick={speakContent}
            className={`p-2 flex items-center gap-1 rounded-md transition-all ${
              isSpeaking
                ? 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200 animate-pulse'
                : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-200 hover:opacity-80'
            }`}
            title={isSpeaking ? d.stopReading : d.readAloud}
          >
            {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            <span className="hidden md:inline text-sm font-medium">{isSpeaking ? d.stopReading : d.readAloud}</span>
          </button>
          <button onClick={() => setLang(lang === 'en' ? 'tw' : 'en')} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-emerald-900/50 flex items-center gap-1 dark:text-emerald-100">
            <Globe className="w-5 h-5" /> <span className="text-sm font-medium hidden sm:inline">{d.toggleLang}</span>
          </button>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-emerald-900/50 dark:text-emerald-100" title={d.toggleTheme}>
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button
            onClick={onLogout}
            className="p-2 flex items-center gap-1 rounded-md text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-emerald-200 dark:hover:bg-red-900/40 dark:hover:text-red-300 transition-colors"
            title={`${d.logout} (${studentName})`}
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:inline text-xs font-bold">{d.logout}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const Footer = ({ lang }) => {
  const d = dict[lang];
  return (
    <footer className="bg-slate-100 dark:bg-[#011a14] py-8 mt-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-emerald-600/60">
        <div>{d.footer.version}</div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{d.footer.architect}</a>
          <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="px-3 py-1 bg-slate-200 dark:bg-emerald-900/40 rounded-md hover:opacity-80 text-slate-700 dark:text-emerald-300">Top</button>
        </div>
      </div>
    </footer>
  );
};

const Sidebar = ({ isOpen, onClose, lang, currentView, setView }) => {
  const d = dict[lang];
  const menuItems = [
    { id: 'overview', label: d.menu.overview, icon: Home },
    { id: 'topic1', label: d.menu.topic1, icon: BookOpen },
    { id: 'topic2', label: d.menu.topic2, icon: BookOpen },
    { id: 'topic3', label: d.menu.topic3, icon: BookOpen },
    { id: 'topic4', label: d.menu.topic4, icon: BookOpen },
    { id: 'topic5', label: d.menu.topic5, icon: BookOpen },
    { id: 'topic6', label: d.menu.topic6, icon: BookOpen },
    { id: 'topic7', label: d.menu.topic7, icon: BookOpen },
    { id: 'lab', label: d.menu.lab, icon: FlaskConical },
    { id: 'resources', label: d.menu.resources, icon: LinkIcon }
  ];

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#022c22] shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex justify-end">
          <button onClick={onClose}><X className="w-6 h-6 text-slate-500 dark:text-emerald-400 hover:scale-110 transition-transform" /></button>
        </div>
        <nav className="px-3 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button key={item.id} onClick={() => { setView(item.id); onClose(); }} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 'text-slate-600 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/50'}`}>
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </>
  );
};

const FlipCardGallery = ({ cards, lang, updateHistory, topicId }) => {
  const d = dict[lang].common;
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState({});
  const [readCount, setReadCount] = useState(0);

  // Reset flip card state whenever switching to a different topic
  useEffect(() => {
    setIndex(0);
    setFlipped({});
    setReadCount(0);
  }, [topicId]);

  const currentCards = cards.slice(index, index + 2);

  const handleFlip = (i) => {
    if (!flipped[index + i]) {
      setReadCount(prev => prev + 1);
      updateHistory(topicId, { global: { clicks: 1 }, page: { clicks: 1, cardsRead: readCount + 1 } });
    }
    setFlipped(prev => ({ ...prev, [index + i]: !prev[index + i] }));
  };

  const next = () => { setIndex(prev => prev + 2); setFlipped({}); };
  const retry = () => { setIndex(0); setFlipped({}); setReadCount(0); };

  return (
    <div className="my-10 p-8 bg-slate-50 dark:bg-[#033c2f] rounded-2xl border border-slate-100 dark:border-emerald-800/30">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-emerald-300 flex items-center gap-2"><BookOpen className="w-5 h-5"/>{d.cards}</h3>
        <span className="text-sm font-medium text-slate-400 dark:text-emerald-600/80 bg-white dark:bg-[#022c22] px-3 py-1 rounded-full">{d.read}: {readCount} / {d.total}: {cards.length}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {currentCards.map((c, i) => (
          <div key={index + i} onClick={() => handleFlip(i)} className="perspective-1000 cursor-pointer h-56">
            <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${flipped[index + i] ? 'rotate-y-180' : ''}`}>
              <div className="absolute w-full h-full backface-hidden bg-white dark:bg-[#022c22] border-2 border-emerald-100 dark:border-emerald-800 rounded-2xl p-6 flex items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="text-lg font-bold text-slate-700 dark:text-emerald-100">{c.f}</p>
              </div>
              <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-[#034c3c] dark:to-[#023c2f] border-2 border-emerald-300 dark:border-emerald-600 rounded-2xl p-6 flex items-center justify-center text-center shadow-md">
                <p className="text-md font-medium text-emerald-900 dark:text-emerald-100">{c.b}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-end gap-3">
        {index + 2 < cards.length ? (
          <button onClick={next} className="px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 flex items-center gap-1 font-medium transition-colors">{d.next} <ChevronRight className="w-4 h-4"/></button>
        ) : (
          <button onClick={retry} className="px-5 py-2.5 border-2 border-slate-200 dark:border-emerald-800 rounded-xl hover:bg-slate-100 dark:hover:bg-[#022c22] text-slate-600 dark:text-emerald-300 flex items-center gap-1 font-medium transition-colors"><RotateCcw className="w-4 h-4"/>{d.retry}</button>
        )}
      </div>
    </div>
  );
};

const QuizGallery = ({ quiz, lang, updateHistory, topicId }) => {
  const d = dict[lang].common;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  // Reset quiz selections cleanly whenever switching to a different topic
  useEffect(() => {
    setIndex(0);
    setAnswers({});
  }, [topicId]);

  const currentQs = quiz.slice(index, index + 2);

  const handleAnswer = (qIdx, optIdx) => {
    if (answers[qIdx]) return;
    const isCorrect = optIdx === quiz[qIdx].ans;
    setAnswers(prev => ({ ...prev, [qIdx]: { selected: optIdx, isCorrect } }));
    
    let currentCorrectCount = Object.values(answers).filter(a => a.isCorrect).length;
    if (isCorrect) currentCorrectCount++;

    updateHistory(topicId, { 
      global: { clicks: 1 }, 
      page: { clicks: 1, quizCorrect: currentCorrectCount, quizTotal: quiz.length } 
    });
  };

  const next = () => setIndex(prev => prev + 2);
  const retry = () => { setIndex(0); setAnswers({}); };

  return (
    <div className="my-10 p-8 bg-white dark:bg-[#011a14] rounded-2xl shadow-sm border border-slate-100 dark:border-emerald-900/50">
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-emerald-900/30 pb-4">
        <h3 className="text-xl font-bold text-slate-800 dark:text-emerald-400">{d.quiz}</h3>
        <span className="text-sm font-medium text-slate-400 dark:text-emerald-600/80 bg-slate-50 dark:bg-[#022c22] px-3 py-1 rounded-full">{d.answered}: {Object.keys(answers).length}/{quiz.length}</span>
      </div>
      <div className="space-y-8">
        {currentQs.map((q, i) => {
          const absoluteIdx = index + i;
          const ansData = answers[absoluteIdx];
          return (
            <div key={absoluteIdx} className="space-y-4">
              <p className="font-bold text-lg text-slate-700 dark:text-emerald-50">Q{absoluteIdx + 1}. {q.q}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {q.opts.map((opt, oIdx) => {
                  let btnClass = "p-4 text-left text-sm rounded-xl border-2 transition-all duration-200 font-medium ";
                  if (!ansData) {
                    btnClass += "border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-slate-100 dark:bg-[#033c2f] dark:border-emerald-900/60 dark:hover:border-slate-500 dark:hover:bg-slate-800/60 dark:text-emerald-100";
                  } else {
                    if (oIdx === q.ans) btnClass += "bg-emerald-100 border-emerald-500 text-emerald-900 dark:bg-emerald-900/80 dark:border-emerald-400 dark:text-emerald-50 shadow-sm";
                    else if (oIdx === ansData.selected) btnClass += "bg-red-50 border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 opacity-60";
                    else btnClass += "border-slate-100 bg-slate-50 opacity-40 dark:bg-[#022c22] dark:border-emerald-900 dark:text-emerald-600";
                  }
                  return <button key={oIdx} onClick={() => handleAnswer(absoluteIdx, oIdx)} className={btnClass} disabled={!!ansData}>{opt}</button>;
                })}
              </div>
              {ansData && (
                <div className={`p-4 rounded-xl flex gap-3 text-sm font-medium animate-fadeIn ${ansData.isCorrect ? 'bg-emerald-50 text-emerald-800 dark:bg-[#034c3c] dark:text-emerald-100' : 'bg-red-50 text-red-800 dark:bg-[#3c1414] dark:text-red-200'}`}>
                  {ansData.isCorrect ? <CheckCircle className="w-5 h-5 shrink-0"/> : <XCircle className="w-5 h-5 shrink-0"/>}
                  <p>{ansData.isCorrect ? (lang==='en'?'Excellent! ':'太棒了！答對了。') : (lang==='en'?'Not quite. ':'可惜答錯了，請看解析：')} {q.exp}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-emerald-900/30">
        {index + 2 < quiz.length ? (
          <button onClick={next} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-md hover:shadow-lg flex items-center gap-1 font-medium transition-all">{d.next} <ChevronRight className="w-4 h-4"/></button>
        ) : (
          <button onClick={retry} className="px-5 py-2.5 border-2 border-slate-200 dark:border-emerald-800 rounded-xl hover:bg-slate-50 dark:hover:bg-[#022c22] text-slate-600 dark:text-emerald-300 flex items-center gap-1 font-medium transition-colors"><RotateCcw className="w-4 h-4"/>{d.retry}</button>
        )}
      </div>
    </div>
  );
};

// Safe Image Component with automatic fallback & no-referrer protection
const SafeImage = ({ src, fallbackSrc, alt }) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // 當切換單元或圖片網址 (src) 改變時，自動重置狀態
  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
  }, [src]);

  const handleImageError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
  };

  if (hasError || !currentSrc) {
    return (
      <div className="w-full h-64 bg-[#022c22] border-2 border-dashed border-emerald-700 rounded-lg flex flex-col items-center justify-center text-emerald-400 p-6 text-center">
        <p className="font-bold mb-2">Image URL Failed / Please Update URL</p>
        <p className="text-sm opacity-80">{alt}</p>
        {src && <p className="text-xs text-emerald-600 mt-2 break-all">{src}</p>}
      </div>
    );
  }

  return (
    <img 
      src={currentSrc} 
      alt={alt} 
      referrerPolicy="no-referrer"
      className="w-full rounded-lg shadow-sm"
      onError={handleImageError}
    />
  );
};

const TopicView = ({ topicData, lang, updateHistory, setView, topicList }) => {
  const d = dict[lang].common;
  const currentIndex = topicList.findIndex(t => t.id === topicData.id);
  const prevTopic = currentIndex > 0 ? topicList[currentIndex - 1] : null;
  const nextTopic = currentIndex < topicList.length - 1 ? topicList[currentIndex + 1] : null;

  return (
    <div className="animate-fadeIn pb-12">
      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-emerald-50 mb-8 border-b-4 border-emerald-500 pb-3 inline-block tracking-tight">{topicData.title}</h1>
      
      {/* Overview & Highlights */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-2 p-8 bg-white dark:bg-[#011a14] rounded-2xl shadow-sm border-l-4 border-slate-700 dark:border-emerald-500">
          <h3 className="text-lg font-bold text-slate-400 dark:text-emerald-600/80 mb-2 uppercase tracking-wider text-sm">{d.overview}</h3>
          <p className="text-slate-700 dark:text-emerald-100 leading-relaxed text-lg font-medium">{topicData.overview}</p>
        </div>
        <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-[#033c2f] dark:to-[#022c22] rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-800">
          <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center gap-2">✨ {d.highlights}</h3>
          <ul className="space-y-3">
            {topicData.highlights.map((h, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-emerald-100 font-medium">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" /> <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Details & Image */}
      <div className="mb-10 p-8 bg-white dark:bg-[#033c2f]/40 rounded-2xl shadow-sm border border-slate-100 dark:border-emerald-900/30">
        <h3 className="text-xl font-bold text-slate-800 dark:text-emerald-300 mb-6">{d.details}</h3>
        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-emerald-100/90 leading-loose whitespace-pre-line text-lg">
          {topicData.details}
        </div>
        
        {/* Updated Image Rendering to Support Multiple Images */}
        {topicData.img && (Array.isArray(topicData.img) ? topicData.img : [topicData.img]).map((imageItem, idx) => (
          <div key={idx} className="mt-10 p-2 bg-slate-100 dark:bg-[#011a14] rounded-xl border border-slate-200 dark:border-emerald-900/50">
             <SafeImage src={imageItem.url} fallbackSrc={imageItem.fallbackUrl} alt={imageItem.text} />
             <p className="text-center text-sm text-slate-500 dark:text-emerald-600/80 mt-3 font-medium">{imageItem.text}</p>
          </div>
        ))}

      </div>

      <FlipCardGallery key={`cards-${topicData.id}`} cards={topicData.cards} lang={lang} updateHistory={updateHistory} topicId={topicData.id} />

      <div className="my-10 p-8 bg-slate-800 dark:bg-emerald-900/40 border dark:border-emerald-700/50 text-white rounded-2xl shadow-lg">
        <h3 className="text-lg font-bold text-emerald-400 mb-3 uppercase tracking-widest text-sm">{d.wrapup}</h3>
        <p className="text-slate-100 dark:text-emerald-50 leading-relaxed text-xl font-medium">{topicData.wrapup}</p>
      </div>

      <QuizGallery key={`quiz-${topicData.id}`} quiz={topicData.quiz} lang={lang} updateHistory={updateHistory} topicId={topicData.id} />

      {/* Pagination */}
      <div className="flex justify-between items-center pt-10 mt-10 border-t-2 border-slate-100 dark:border-emerald-900/30">
        {prevTopic ? (
          <button onClick={() => {setView(prevTopic.id); window.scrollTo(0,0);}} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 dark:text-emerald-600/80 dark:hover:text-emerald-400 font-bold transition-colors">
            <ChevronLeft className="w-5 h-5" /> <span>{d.prev}: {prevTopic.title}</span>
          </button>
        ) : <div/>}
        {nextTopic ? (
          <button onClick={() => {setView(nextTopic.id); window.scrollTo(0,0);}} className="flex items-center gap-2 text-slate-800 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-100 font-bold transition-colors">
            <span>{d.next}: {nextTopic.title}</span> <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={() => {setView('lab'); window.scrollTo(0,0);}} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 font-bold transition-all">
            <FlaskConical className="w-5 h-5" />
            <span>{d.next}: {dict[lang].menu.lab}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

const InteractiveLab = ({ lang, setView }) => {
  const isEn = lang === 'en';
  const d = dict[lang].common;

  // ==========================================
  // Lab 1 State & Exact Formula (Guyatt 2011 / Fleiss)
  // ==========================================
  const [act1Params, setAct1Params] = useState({ cer: 0.20, rrr: 25 });
  const pC = act1Params.cer;
  const rrrDec = act1Params.rrr / 100;
  const pE = pC * (1 - rrrDec);
  const pBar = (pC + pE) / 2;
  const zAlpha = 1.96;   // Two-sided alpha = 0.05
  const zBeta = 0.8416;  // Power = 80% (beta = 0.20)

  const numerator = Math.pow(
    zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) +
    zBeta * Math.sqrt(pC * (1 - pC) + pE * (1 - pE)),
    2
  );
  const denominator = Math.pow(pC - pE, 2);
  const nPerArm = denominator > 0 ? Math.ceil(numerator / denominator) : 0;
  const totalOIS = nPerArm * 2;
  const expectedEvents = Math.round(nPerArm * (pC + pE));

  // ==========================================
  // Lab 2 State: Step 1 Threshold, Step 2 CI (MD scale -10 to +10)
  // ==========================================
  const [threshold, setThreshold] = useState(3.0);
  const [ciState, setCiState] = useState({ md: 0.5, halfWidth: 1.5 });
  const ciLower = Number((ciState.md - ciState.halfWidth).toFixed(1));
  const ciUpper = Number((ciState.md + ciState.halfWidth).toFixed(1));

  const crossesMinusT = ciLower < -threshold && ciUpper > -threshold;
  const crossesPlusT = ciLower < threshold && ciUpper > threshold;
  const crossesBothT = ciLower < -threshold && ciUpper > threshold;
  const crossesNull = ciLower < 0 && ciUpper > 0;
  const entirelyTrivial = ciLower >= -threshold && ciUpper <= threshold;

  let act2Status = { level: 0, badge: '', desc: '', color: '' };
  if (crossesBothT) {
    act2Status = {
      level: -2,
      badge: isEn ? '🔴 Downgrade 2 Levels (-2)' : '🔴 嚴重不精確：必須降兩級 (-2)',
      desc: isEn
        ? `The 95% CI (${ciLower} to ${ciUpper}) spans across BOTH the important benefit (-${threshold}) and harm (+${threshold}) thresholds.`
        : `95% CI (${ciLower} ~ ${ciUpper}) 同時跨越了重要益處 (-${threshold}) 與重要害處 (+${threshold}) 兩側門檻，臨床決策極度不確定。`,
      color: 'bg-red-50 text-red-900 border-red-400 dark:bg-[#3c1414] dark:text-red-100 dark:border-red-700'
    };
  } else if (crossesMinusT || crossesPlusT) {
    act2Status = {
      level: -1,
      badge: isEn ? '🟠 Downgrade 1 Level (-1)' : '🟠 決策不確定：必須降一級 (-1)',
      desc: isEn
        ? `${!crossesNull ? '⚠️ Trap Alert: Even though it does NOT cross 0 (statistically significant), t' : 'T'}he 95% CI (${ciLower} to ${ciUpper}) crosses the clinical threshold (${crossesMinusT ? -threshold : '+' + threshold}), spanning both trivial and important effects.`
        : `${!crossesNull ? '⚠️ 經典陷阱：雖然未跨越無效值 0 (p < 0.05 統計顯著)，但 ' : ''}95% CI (${ciLower} ~ ${ciUpper}) 跨越了您設定的臨床門檻 (${crossesMinusT ? -threshold : '+' + threshold})，同時橫跨「微小效果」與「重要效果」，故必須降級！`,
      color: 'bg-amber-50 text-amber-900 border-amber-400 dark:bg-amber-950/60 dark:text-amber-100 dark:border-amber-700'
    };
  } else if (entirelyTrivial) {
    act2Status = {
      level: 0,
      badge: isEn ? '🟢 Do NOT Downgrade (0)' : '🟢 決策確定：不需降級 (0)',
      desc: isEn
        ? `${crossesNull ? '💡 Key Concept: Even though the CI crosses 0 (p > 0.05), t' : 'T'}he entire 95% CI (${ciLower} to ${ciUpper}) lies safely inside the trivial zone (-${threshold} to +${threshold}). We are confident there is no important effect!`
        : `${crossesNull ? '💡 核心觀念：雖然 95% CI 跨越了無效值 0 (p > 0.05)，但' : ''}整個區間 (${ciLower} ~ ${ciUpper}) 完全落在「無臨床重要差異區 (-${threshold} ~ +${threshold})」內。我們非常確定它沒有重要效果，決策毫無疑問，故不需降級！`,
      color: 'bg-emerald-50 text-emerald-900 border-emerald-400 dark:bg-[#034c3c] dark:text-emerald-100 dark:border-emerald-600'
    };
  } else {
    act2Status = {
      level: 0,
      badge: isEn ? '🟢 Do NOT Downgrade (0)' : '🟢 決策確定：不需降級 (0)',
      desc: isEn
        ? `The entire 95% CI (${ciLower} to ${ciUpper}) lies beyond the clinical threshold, consistently supporting an important effect.`
        : `整個 95% CI (${ciLower} ~ ${ciUpper}) 完全落在臨床門檻外側，一致支持具臨床重要性的效果，決策非常確定！`,
      color: 'bg-emerald-50 text-emerald-900 border-emerald-400 dark:bg-[#034c3c] dark:text-emerald-100 dark:border-emerald-600'
    };
  }

  // Helper to convert value (-10 to +10) to percentage (0% to 100%)
  const valToPct = (v) => Math.max(0, Math.min(100, ((v + 10) / 20) * 100));

  // ==========================================
  // Lab 3 State: RoB Sensitivity Analysis Simulator
  // ==========================================
  const [robScenario, setRobScenario] = useState('A'); // 'A' = Robust, 'B' = Bias-driven
  const [excludeHighRoB, setExcludeHighRoB] = useState(false);
  const [robAnswer, setRobAnswer] = useState(null);

  const scenarios = {
    A: {
      name: isEn ? 'Scenario A: Robust Result' : '情境 A：結果穩健 (低風險研究佔主導)',
      studies: [
        { name: 'Smith 2021', rob: 'low', rr: 0.65, ci: [0.52, 0.78], weight: '35%' },
        { name: 'Chen 2022', rob: 'low', rr: 0.70, ci: [0.58, 0.82], weight: '30%' },
        { name: 'Davis 2023', rob: 'low', rr: 0.68, ci: [0.54, 0.82], weight: '20%' },
        { name: 'Patel 2020 (Unblinded)', rob: 'high', rr: 0.60, ci: [0.40, 0.85], weight: '8%' },
        { name: 'Gomez 2021 (High attrition)', rob: 'high', rr: 0.62, ci: [0.42, 0.88], weight: '7%' }
      ],
      pooledAll: { rr: 0.67, ci: [0.58, 0.76] },
      pooledLowOnly: { rr: 0.68, ci: [0.59, 0.77] },
      correctAns: 'no_downgrade',
      exp: isEn
        ? 'After excluding the two High RoB studies (sensitivity analysis), the pooled RR (0.68) and 95% CI (0.59–0.77) remain entirely below the clinical threshold (0.80). High RoB studies only carry 15% weight and do not alter our clinical conclusion, so we do NOT downgrade.'
        : '執行敏感度分析剔除兩篇高風險研究後，合併效應 (RR = 0.68, 95% CI: 0.59~0.77) 依然完全支持跨過臨床門檻 (RR < 0.80) 的重要益處。高風險研究僅佔 15% 權重且未改變結論，因此「不需降級」！'
    },
    B: {
      name: isEn ? 'Scenario B: Bias-Driven Result' : '情境 B：偏差主導結果 (高風險研究扭曲結論)',
      studies: [
        { name: 'Wang 2021', rob: 'low', rr: 0.96, ci: [0.82, 1.12], weight: '20%' },
        { name: 'Miller 2022', rob: 'low', rr: 0.98, ci: [0.84, 1.14], weight: '20%' },
        { name: 'Tanaka 2023', rob: 'low', rr: 0.94, ci: [0.79, 1.10], weight: '15%' },
        { name: 'Garcia 2019 (Unblinded)', rob: 'high', rr: 0.52, ci: [0.38, 0.68], weight: '25%' },
        { name: 'Kim 2020 (Allocation issue)', rob: 'high', rr: 0.55, ci: [0.41, 0.72], weight: '20%' }
      ],
      pooledAll: { rr: 0.74, ci: [0.64, 0.85] },
      pooledLowOnly: { rr: 0.96, ci: [0.86, 1.07] },
      correctAns: 'downgrade',
      exp: isEn
        ? 'When all studies are pooled, the drug looks beneficial (RR = 0.74). However, sensitivity analysis reveals that removing High RoB studies shifts the pooled RR to 0.96 (no effect)! Since our conclusion depends heavily on biased studies, we MUST downgrade for Risk of Bias.'
        : '未剔除前看似有顯著益處 (RR = 0.74)，但執行敏感度分析剔除高風險研究後，僅存的低風險研究顯示完全無效 (RR = 0.96)！這證明原本的療效是被高偏差風險研究所誇大，因此「必須針對偏差風險降級」！'
    }
  };

  const curScen = scenarios[robScenario];
  const curPooled = excludeHighRoB ? curScen.pooledLowOnly : curScen.pooledAll;
  // Convert RR (0.3 to 1.3) to percentage (0% to 100%)
  const rrToPct = (rr) => Math.max(0, Math.min(100, ((rr - 0.3) / 1.0) * 100));

  // ==========================================
  // Lab 4 State: Funnel Plot Simulator
  // ==========================================
  const [funnelMode, setFunnelMode] = useState('sym'); // 'sym' or 'asym'
  const [showMissing, setShowMissing] = useState(false);
  const [funnelStudies, setFunnelStudies] = useState([
    { x: 48, y: 15, missing: false }, { x: 52, y: 20, missing: false },
    { x: 44, y: 38, missing: false }, { x: 55, y: 42, missing: false },
    { x: 38, y: 65, missing: false }, { x: 61, y: 68, missing: false }
  ]);

  const switchFunnelMode = (mode) => {
    setFunnelMode(mode);
    setShowMissing(false);
    if (mode === 'sym') {
      setFunnelStudies([
        { x: 49, y: 14, missing: false }, { x: 52, y: 19, missing: false },
        { x: 44, y: 36, missing: false }, { x: 56, y: 40, missing: false },
        { x: 36, y: 65, missing: false }, { x: 63, y: 68, missing: false },
        { x: 28, y: 84, missing: false }, { x: 70, y: 86, missing: false }
      ]);
    } else {
      setFunnelStudies([
        { x: 48, y: 15, missing: false }, { x: 51, y: 22, missing: false },
        { x: 42, y: 40, missing: false }, { x: 46, y: 46, missing: false },
        { x: 26, y: 70, missing: false }, { x: 32, y: 78, missing: false },
        { x: 20, y: 86, missing: false }, { x: 35, y: 88, missing: false },
        // Missing unpublished negative small studies (right bottom corner)
        { x: 66, y: 72, missing: true }, { x: 74, y: 80, missing: true },
        { x: 68, y: 87, missing: true }, { x: 79, y: 89, missing: true }
      ]);
    }
  };

  const addFiveStudies = () => {
    const newPts = [];
    for (let i = 0; i < 5; i++) {
      const y = 15 + Math.random() * 75; // 15 (top/large) to 90 (bottom/small)
      const maxSpread = (y / 100) * 38;
      if (funnelMode === 'sym') {
        const offset = (Math.random() * 2 - 1) * maxSpread;
        newPts.push({ x: 50 + offset, y, missing: false });
      } else {
        // In asymmetric mode, small studies on the right (>52) tend to be missing
        const offset = (Math.random() * 2 - 1) * maxSpread;
        const x = 50 + offset;
        if (y > 55 && x > 52) {
          newPts.push({ x, y, missing: true });
        } else {
          newPts.push({ x, y, missing: false });
        }
      }
    }
    setFunnelStudies(prev => [...prev, ...newPts]);
  };

  const visiblePublishedCount = funnelStudies.filter(s => !s.missing).length;

  return (
    <div className="animate-fadeIn pb-12">
      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-emerald-50 mb-4 border-b-4 border-emerald-500 pb-3 inline-block">
        {isEn ? 'GRADE Interactive Lab' : 'GRADE 互動實驗室'}
      </h1>
      <p className="text-slate-600 dark:text-emerald-200/80 mb-8 text-lg font-medium">
        {isEn
          ? 'Hands-on simulations designed to master core statistical and methodological judgments in GRADE.'
          : '透過親手操作四個視覺化模擬器，徹底掌握 GRADE 評讀中最核心的統計公式、決策門檻與敏感度分析邏輯。'}
      </p>

      <div className="space-y-12">
        {/* ==========================================
            LAB 1: Exact OIS Calculator
           ========================================== */}
        <div className="p-8 bg-white dark:bg-[#011a14] rounded-2xl shadow-sm border border-slate-200 dark:border-emerald-900/60">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="font-extrabold text-2xl text-slate-800 dark:text-emerald-300">
              {isEn ? 'Experiment 1: Optimal Information Size (OIS) Calculator' : '實驗 1：最佳資訊量 (OIS) 嚴謹公式計算機'}
            </h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
              {isEn ? 'Topic 5: Imprecision' : '對應單元：5. 不精確性 (Imprecision)'}
            </span>
          </div>

          {/* How to Play Box */}
          <div className="mb-6 p-4 bg-slate-50 dark:bg-[#022c22] rounded-xl border-l-4 border-emerald-500 text-sm text-slate-700 dark:text-emerald-100 space-y-1">
            <p className="font-bold text-emerald-700 dark:text-emerald-300">
              {isEn ? '🎮 How to Play & Formula Source:' : '🎮 玩法說明與公式來源：'}
            </p>
            <p>
              {isEn
                ? '1. Adjust the Control Event Rate (P_c) and Relative Risk Reduction (RRR) sliders below. 2. Observe how the exact required sample size (OIS) and total events change dynamically based on standard two-sample proportions formula (Guyatt et al., J Clin Epidemiol 2011; Fleiss, α = 0.05, Power = 80%). Compare this with the outdated "300 events / 400 participants" rule!'
                : '【步驟 1】拖曳調整下方的「對照組基準事件率 (P_c)」與「預期相對風險降低率 (RRR)」。【步驟 2】觀察系統根據 GRADE 指引第 6 篇 (Guyatt 2011) 與 Fleiss 標準雙組獨立比例樣本數公式（設定雙尾 α = 0.05, 檢定力 Power = 80%）即時運算出來的「總最佳資訊量 (OIS)」與「預期總事件數」，體會為何不能死背 300/400 的硬性數字！'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-emerald-200 mb-2">
                  <span>{isEn ? 'Control Event Rate (P_c / CER):' : '對照組基準事件發生率 (P_c / CER)：'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base">{(pC * 100).toFixed(0)}% ({pC.toFixed(2)})</span>
                </div>
                <input
                  type="range" min="0.05" max="0.60" step="0.01"
                  value={act1Params.cer}
                  onChange={e => setAct1Params({ ...act1Params, cer: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>5% (Rare event)</span>
                  <span>30%</span>
                  <span>60% (Common event)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-emerald-200 mb-2">
                  <span>{isEn ? 'Expected Relative Risk Reduction (RRR):' : '預期相對風險降低比例 (RRR)：'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base">{act1Params.rrr}% (RR = {(1 - rrrDec).toFixed(2)})</span>
                </div>
                <input
                  type="range" min="10" max="50" step="5"
                  value={act1Params.rrr}
                  onChange={e => setAct1Params({ ...act1Params, rrr: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>10% (Small effect)</span>
                  <span>25% (Moderate)</span>
                  <span>50% (Large effect)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#022c22] text-xs font-mono text-slate-600 dark:text-emerald-300/90 space-y-1">
                <div className="font-bold text-slate-800 dark:text-emerald-200 mb-1">
                  {isEn ? '📐 Exact Statistical Parameters:' : '📐 即時帶入之統計公式參數：'}
                </div>
                <div>• α (two-sided) = 0.05 (Z_α/2 = 1.96), Power (1-β) = 0.80 (Z_β = 0.8416)</div>
                <div>• Control Risk (P_c) = {(pC * 100).toFixed(1)}%, Intervention Risk (P_e) = {(pE * 100).toFixed(1)}%</div>
                <div>• Formula: n_per_arm = [1.96√(2P̄(1-P̄)) + 0.8416√(P_c(1-P_c)+P_e(1-P_e))]² / (P_c - P_e)²</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-[#033c2f] border-2 border-emerald-400 dark:border-emerald-600 flex flex-col justify-center items-center text-center shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">
                  {isEn ? 'Total Required Sample Size (OIS)' : '所需總樣本數 (Total OIS)'}
                </span>
                <span className="text-4xl font-extrabold text-emerald-900 dark:text-white font-mono">
                  {totalOIS.toLocaleString()}
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-300 mt-2">
                  ({nPerArm.toLocaleString()} {isEn ? 'per arm' : '人 / 每組'})
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-teal-50 dark:bg-[#022c22] border-2 border-teal-300 dark:border-teal-700 flex flex-col justify-center items-center text-center shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 mb-2">
                  {isEn ? 'Expected Total Events' : '預估所需總事件數 (Events)'}
                </span>
                <span className="text-4xl font-extrabold text-teal-900 dark:text-emerald-200 font-mono">
                  {expectedEvents.toLocaleString()}
                </span>
                <span className="text-xs text-teal-700 dark:text-teal-400 mt-2">
                  {isEn ? 'Across both groups combined' : '兩組預期發生事件總和'}
                </span>
              </div>

              <div className="sm:col-span-2 p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
                <strong>💡 {isEn ? 'Methodological Insight:' : '方法學反思：'}</strong>{' '}
                {isEn
                  ? `When RRR is ${act1Params.rrr}% and baseline risk is ${(pC * 100).toFixed(0)}%, you need ${totalOIS.toLocaleString()} participants (${expectedEvents} events). Relying blindly on "400 participants" would be severely underpowered for small effects!`
                  : `當預期相對風險降低 ${act1Params.rrr}% 且基準風險為 ${(pC * 100).toFixed(0)}% 時，實際需要 ${totalOIS.toLocaleString()} 名受試者（約 ${expectedEvents} 個事件）。這證明如果盲目套用「大於 400 人就不降級」的舊規則，在面對小效應或低發生率時會嚴重高估證據精確度！`}
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            LAB 2: Threshold First, Then Draw CI
           ========================================== */}
        <div className="p-8 bg-white dark:bg-[#011a14] rounded-2xl shadow-sm border border-slate-200 dark:border-emerald-900/60">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="font-extrabold text-2xl text-slate-800 dark:text-emerald-300">
              {isEn ? 'Experiment 2: Clinical Threshold (MID) & 95% CI Simulator' : '實驗 2：臨床決策門檻與 95% 信賴區間模擬器'}
            </h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
              {isEn ? 'Topic 5: Imprecision' : '對應單元：5. 不精確性 (Imprecision)'}
            </span>
          </div>

          {/* How to Play Box */}
          <div className="mb-6 p-4 bg-slate-50 dark:bg-[#022c22] rounded-xl border-l-4 border-emerald-500 text-sm text-slate-700 dark:text-emerald-100 space-y-1">
            <p className="font-bold text-emerald-700 dark:text-emerald-300">
              {isEn ? '🎮 How to Play (Strict 2-Step GRADE Sequence):' : '🎮 玩法說明（請依序執行兩階段操作）：'}
            </p>
            <p>
              {isEn
                ? 'Scenario: Evaluating Mean Difference (MD) in Pain Score (Null = 0, negative = pain reduction). 【Step 1】First, define your Minimal Important Difference (MID) threshold (±T). 【Step 2】Then adjust the study Point Estimate (MD) and 95% CI Width to see if the CI crosses your predefined threshold lines!'
                : '情境：評估某止痛介入對「疼痛分數平均差 (MD，無效值為 0，負值代表疼痛減輕)」的效果。【第一階段】請先拉動滑桿，設定您認為對病患具臨床意義的「最小重要差異門檻 (±T 分)」，圖上會畫出兩條綠色門檻線。【第二階段】再調整研究的「點估計值」與「95% CI 寬度」，觀察信賴區間橫條是否跨越了您設定的門檻線！'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Step 1: Set Threshold */}
            <div className="p-5 rounded-xl bg-emerald-50/60 dark:bg-[#022c22] border-2 border-emerald-200 dark:border-emerald-800/80">
              <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">
                {isEn ? 'Step 1: Define Clinical Threshold (±MID)' : '【第一階段】先設定臨床重要效果門檻 (±T)'}
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-emerald-100 mb-2">
                <span>{isEn ? 'Important Difference Threshold:' : '臨床重要差異門檻 (Threshold)：'}</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-300 text-base">±{threshold.toFixed(1)} {isEn ? 'pts' : '分'}</span>
              </div>
              <input
                type="range" min="1.0" max="6.0" step="0.5"
                value={threshold}
                onChange={e => setThreshold(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-xs text-slate-500 dark:text-emerald-400/80 mt-2">
                {isEn
                  ? `Zone between -${threshold.toFixed(1)} and +${threshold.toFixed(1)} is defined as "No Important Difference (Trivial)".`
                  : `落在 -${threshold.toFixed(1)} 到 +${threshold.toFixed(1)} 分之間的區域，即被定義為「無臨床重要差異區 (Trivial zone)」。`}
              </p>
            </div>

            {/* Step 2: Draw CI */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#033c2f]/60 border-2 border-slate-200 dark:border-emerald-800/60 space-y-4">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-emerald-300">
                {isEn ? 'Step 2: Adjust Study 95% Confidence Interval' : '【第二階段】再繪製研究之 95% 信賴區間 (CI)'}
              </div>
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-emerald-100 mb-1">
                  <span>{isEn ? 'Point Estimate (MD):' : '點估計值 (Point Estimate MD)：'}</span>
                  <span className="font-mono text-base">{ciState.md > 0 ? `+${ciState.md.toFixed(1)}` : ciState.md.toFixed(1)}</span>
                </div>
                <input
                  type="range" min="-6.0" max="6.0" step="0.5"
                  value={ciState.md}
                  onChange={e => setCiState({ ...ciState, md: parseFloat(e.target.value) })}
                  className="w-full accent-slate-700 dark:accent-emerald-400 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-emerald-100 mb-1">
                  <span>{isEn ? '95% CI Half-Width (±):' : '95% CI 半寬度 (決定區間寬窄)：'}</span>
                  <span className="font-mono text-base">±{ciState.halfWidth.toFixed(1)} (CI: {ciLower} ~ {ciUpper})</span>
                </div>
                <input
                  type="range" min="0.5" max="6.0" step="0.5"
                  value={ciState.halfWidth}
                  onChange={e => setCiState({ ...ciState, halfWidth: parseFloat(e.target.value) })}
                  className="w-full accent-slate-700 dark:accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Visual Number Line Plot */}
          <div className="mb-6 p-6 bg-slate-50 dark:bg-[#022c22] rounded-2xl border border-slate-200 dark:border-emerald-800">
            <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-emerald-300 mb-2">
              <span>◀ {isEn ? 'Important Benefit (Pain Reduced < -T)' : '具臨床重要益處 (疼痛顯著減輕 < -T)'}</span>
              <span className="text-emerald-700 dark:text-emerald-300">{isEn ? 'Trivial / No Important Effect Zone (-T to +T)' : '無臨床重要差異區 (-T ~ +T)'}</span>
              <span>{isEn ? 'Important Harm (> +T)' : '具臨床重要害處 (> +T)'} ▶</span>
            </div>

            <div className="relative h-28 w-full bg-white dark:bg-[#011a14] rounded-xl border border-slate-200 dark:border-emerald-900 overflow-hidden my-2">
              {/* Shaded Trivial Zone between -T and +T */}
              <div
                className="absolute top-0 bottom-0 bg-emerald-100/50 dark:bg-emerald-900/30 transition-all duration-200"
                style={{
                  left: `${valToPct(-threshold)}%`,
                  width: `${valToPct(threshold) - valToPct(-threshold)}%`
                }}
              />

              {/* Null Line (0) */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-400 dark:bg-slate-500 z-10" />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white/90 dark:bg-[#011a14]/90 px-1.5 rounded">
                {isEn ? 'Null (0)' : '無效線 (0)'}
              </div>

              {/* -T Threshold Line */}
              <div
                className="absolute top-0 bottom-0 border-l-2 border-dashed border-emerald-600 dark:border-emerald-400 z-10 transition-all duration-200"
                style={{ left: `${valToPct(-threshold)}%` }}
              >
                <span className="absolute bottom-1 -translate-x-1/2 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-[#022c22] px-1.5 rounded">
                  -{threshold.toFixed(1)}
                </span>
              </div>

              {/* +T Threshold Line */}
              <div
                className="absolute top-0 bottom-0 border-l-2 border-dashed border-emerald-600 dark:border-emerald-400 z-10 transition-all duration-200"
                style={{ left: `${valToPct(threshold)}%` }}
              >
                <span className="absolute bottom-1 -translate-x-1/2 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-[#022c22] px-1.5 rounded">
                  +{threshold.toFixed(1)}
                </span>
              </div>

              {/* 95% CI Horizontal Bar */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-2 bg-slate-800 dark:bg-emerald-300 rounded-full z-20 transition-all duration-200"
                style={{
                  left: `${valToPct(ciLower)}%`,
                  width: `${Math.max(1, valToPct(ciUpper) - valToPct(ciLower))}%`
                }}
              />
              {/* Point Estimate Diamond/Dot */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-emerald-600 dark:bg-white border-2 border-white dark:border-emerald-950 z-30 shadow transition-all duration-200"
                style={{ left: `${valToPct(ciState.md)}%` }}
              />
            </div>

            {/* Scale Axis Ticks */}
            <div className="flex justify-between text-xs font-mono text-slate-400 px-1">
              <span>-10</span>
              <span>-5</span>
              <span>0 (MD)</span>
              <span>+5</span>
              <span>+10</span>
            </div>
          </div>

          {/* Dynamic Decision Output */}
          <div className={`p-5 rounded-xl border-2 transition-all ${act2Status.color}`}>
            <div className="font-extrabold text-lg mb-1">{act2Status.badge}</div>
            <p className="text-sm font-medium leading-relaxed">{act2Status.desc}</p>
          </div>
        </div>

        {/* ==========================================
            LAB 3: RoB Sensitivity Analysis Simulator
           ========================================== */}
        <div className="p-8 bg-white dark:bg-[#011a14] rounded-2xl shadow-sm border border-slate-200 dark:border-emerald-900/60">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="font-extrabold text-2xl text-slate-800 dark:text-emerald-300">
              {isEn ? 'Experiment 3: Risk of Bias (RoB) & Sensitivity Analysis Simulator' : '實驗 3：偏差風險 (RoB) 與敏感度分析決策模擬器'}
            </h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
              {isEn ? 'Topic 2: Risk of Bias' : '對應單元：2. 偏差風險 (Risk of Bias)'}
            </span>
          </div>

          {/* How to Play Box */}
          <div className="mb-6 p-4 bg-slate-50 dark:bg-[#022c22] rounded-xl border-l-4 border-emerald-500 text-sm text-slate-700 dark:text-emerald-100 space-y-1">
            <p className="font-bold text-emerald-700 dark:text-emerald-300">
              {isEn ? '🎮 How to Play (Concept over Memorization):' : '🎮 玩法說明（學概念，而非死背分類）：'}
            </p>
            <p>
              {isEn
                ? 'Core Concept: Having High RoB studies in a meta-analysis does NOT automatically trigger a downgrade! You must check study weights and perform a Sensitivity Analysis. 【Step 1】Select Scenario A or B. 【Step 2】Toggle the "Exclude High RoB Studies" button to see how the pooled diamond changes. 【Step 3】Make your GRADE judgment below!'
                : '核心觀念：分析中包含「高偏差風險 (High RoB)」的研究，不代表就必須自動降級！【步驟 1】切換「情境 A」或「情境 B」。【步驟 2】點擊「🔍 執行敏感度分析（剔除高風險研究）」開關，觀察森林圖最下方的「合併效應值 (RR)」是否改變。【步驟 3】回答下方的 GRADE 降級決策問題！'}
            </p>
          </div>

          {/* Controls: Scenario & Sensitivity Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex gap-2">
              {['A', 'B'].map(sc => (
                <button
                  key={sc}
                  onClick={() => { setRobScenario(sc); setExcludeHighRoB(false); setRobAnswer(null); }}
                  className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all ${
                    robScenario === sc
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-[#022c22] dark:text-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  {scenarios[sc].name}
                </button>
              ))}
            </div>

            <button
              onClick={() => setExcludeHighRoB(!excludeHighRoB)}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-sm border-2 transition-all flex items-center gap-2 ${
                excludeHighRoB
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 dark:bg-[#033c2f] dark:text-emerald-100 dark:border-emerald-600'
              }`}
            >
              <span>🔍 {excludeHighRoB
                ? (isEn ? 'Sensitivity Analysis ON (High RoB Excluded)' : '已開啟敏感度分析（已剔除紅字高風險研究）')
                : (isEn ? 'Run Sensitivity Analysis (Exclude High RoB)' : '點此執行敏感度分析（剔除高偏差風險研究）')}
              </span>
            </button>
          </div>

          {/* Mini Forest Plot */}
          <div className="p-5 bg-slate-50 dark:bg-[#022c22] rounded-2xl border border-slate-200 dark:border-emerald-800/80 mb-6">
            <div className="grid grid-cols-12 text-xs font-bold text-slate-500 dark:text-emerald-300/80 pb-2 border-b border-slate-200 dark:border-emerald-800">
              <div className="col-span-4">{isEn ? 'Study (RoB 2 Rating)' : '研究名稱 (RoB 2 評級)'}</div>
              <div className="col-span-5 text-center">{isEn ? 'Forest Plot (Risk Ratio, Threshold = 0.80)' : '迷你森林圖 (RR，臨床重要門檻 = 0.80)'}</div>
              <div className="col-span-3 text-right">{isEn ? 'RR (95% CI) | Weight' : '效應值 (95% CI) | 權重'}</div>
            </div>

            <div className="divide-y divide-slate-200/60 dark:divide-emerald-900/40 my-2">
              {curScen.studies.map((st, i) => {
                const isExcluded = excludeHighRoB && st.rob === 'high';
                return (
                  <div key={i} className={`grid grid-cols-12 items-center py-2.5 text-sm transition-opacity ${isExcluded ? 'opacity-25 line-through' : 'opacity-100'}`}>
                    <div className="col-span-4 flex items-center gap-2 font-medium text-slate-800 dark:text-emerald-100">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${st.rob === 'low' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="truncate">{st.name}</span>
                    </div>

                    {/* Plot Line */}
                    <div className="col-span-5 relative h-6 bg-white dark:bg-[#011a14] rounded border border-slate-200 dark:border-emerald-900/60 mx-2">
                      {/* Null RR = 1.0 line */}
                      <div className="absolute top-0 bottom-0 w-px bg-slate-400" style={{ left: `${rrToPct(1.0)}%` }} />
                      {/* Clinical Threshold RR = 0.80 dashed line */}
                      <div className="absolute top-0 bottom-0 border-l border-dashed border-emerald-500" style={{ left: `${rrToPct(0.80)}%` }} />
                      {/* Study CI */}
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-1 rounded ${st.rob === 'low' ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-red-500'}`}
                        style={{
                          left: `${rrToPct(st.ci[0])}%`,
                          width: `${Math.max(2, rrToPct(st.ci[1]) - rrToPct(st.ci[0]))}%`
                        }}
                      />
                      {/* Study Point */}
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-sm ${st.rob === 'low' ? 'bg-emerald-700 dark:bg-emerald-300' : 'bg-red-600'}`}
                        style={{ left: `${rrToPct(st.rr)}%` }}
                      />
                    </div>

                    <div className="col-span-3 text-right font-mono text-xs text-slate-600 dark:text-emerald-200">
                      {st.rr.toFixed(2)} ({st.ci[0]}–{st.ci[1]}) <span className="font-bold">[{st.weight}]</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pooled Summary Row */}
            <div className="grid grid-cols-12 items-center pt-3 border-t-2 border-slate-300 dark:border-emerald-700 font-bold text-sm text-slate-900 dark:text-white">
              <div className="col-span-4 flex items-center gap-2">
                <span>♦ {excludeHighRoB ? (isEn ? 'Pooled (Low RoB Only)' : '敏感度分析合併結果 (僅低風險)') : (isEn ? 'Pooled (All 5 Studies)' : '原始合併結果 (全部 5 篇)')}</span>
              </div>
              <div className="col-span-5 relative h-8 bg-emerald-50/70 dark:bg-[#033c2f] rounded border border-emerald-300 dark:border-emerald-700 mx-2">
                <div className="absolute top-0 bottom-0 w-px bg-slate-500" style={{ left: `${rrToPct(1.0)}%` }} />
                <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-emerald-600 dark:border-emerald-400" style={{ left: `${rrToPct(0.80)}%` }} />
                {/* Pooled CI Diamond/Bar */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-3 bg-slate-900 dark:bg-amber-300 rounded-sm transition-all duration-300"
                  style={{
                    left: `${rrToPct(curPooled.ci[0])}%`,
                    width: `${Math.max(3, rrToPct(curPooled.ci[1]) - rrToPct(curPooled.ci[0]))}%`
                  }}
                />
              </div>
              <div className="col-span-3 text-right font-mono text-xs text-emerald-800 dark:text-amber-300">
                RR {curPooled.rr.toFixed(2)} ({curPooled.ci[0]}–{curPooled.ci[1]})
              </div>
            </div>
            <div className="flex justify-center gap-6 text-[11px] text-slate-500 dark:text-emerald-400 mt-2 font-mono">
              <span>🟢 {isEn ? 'Dashed Line: Clinical Threshold (RR = 0.80)' : '綠色虛線：臨床重要益處門檻 (RR = 0.80)'}</span>
              <span>⚪ {isEn ? 'Solid Line: Null Effect (RR = 1.0)' : '灰色實線：無效線 (RR = 1.0)'}</span>
            </div>
          </div>

          {/* Decision Question for Student */}
          <div className="space-y-3">
            <p className="font-bold text-slate-800 dark:text-emerald-200 text-sm">
              {isEn
                ? `👉 Based on your Sensitivity Analysis for ${curScen.name}, should we downgrade for Risk of Bias?`
                : `👉 根據上方「${curScen.name}」的敏感度分析結果，請問您是否會因為偏差風險 (RoB) 而將 GRADE 降級？`}
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => setRobAnswer('no_downgrade')}
                className={`p-4 rounded-xl border-2 text-left font-bold text-sm transition-all ${
                  robAnswer === 'no_downgrade'
                    ? (curScen.correctAns === 'no_downgrade' ? 'bg-emerald-100 border-emerald-500 text-emerald-950 dark:bg-emerald-900/80 dark:text-white' : 'bg-red-50 border-red-400 text-red-900 dark:bg-[#3c1414] dark:text-red-200')
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-[#033c2f] dark:border-emerald-800 dark:text-emerald-100'
                }`}
              >
                {isEn ? 'Do NOT Downgrade (Result is robust to bias)' : '不需降級（剔除高風險研究後，臨床結論依然穩健不變）'}
              </button>
              <button
                onClick={() => setRobAnswer('downgrade')}
                className={`p-4 rounded-xl border-2 text-left font-bold text-sm transition-all ${
                  robAnswer === 'downgrade'
                    ? (curScen.correctAns === 'downgrade' ? 'bg-emerald-100 border-emerald-500 text-emerald-950 dark:bg-emerald-900/80 dark:text-white' : 'bg-red-50 border-red-400 text-red-900 dark:bg-[#3c1414] dark:text-red-200')
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-[#033c2f] dark:border-emerald-800 dark:text-emerald-100'
                }`}
              >
                {isEn ? 'Downgrade 1 Level (Conclusion is driven by High RoB studies)' : '必須降級（原本的有效結論主要是由高偏差風險研究所拉動）'}
              </button>
            </div>
            {robAnswer && (
              <div className={`p-4 rounded-xl flex gap-3 text-sm font-medium animate-fadeIn ${robAnswer === curScen.correctAns ? 'bg-emerald-50 text-emerald-900 dark:bg-[#034c3c] dark:text-emerald-100' : 'bg-red-50 text-red-900 dark:bg-[#3c1414] dark:text-red-200'}`}>
                {robAnswer === curScen.correctAns ? <CheckCircle className="w-5 h-5 shrink-0"/> : <XCircle className="w-5 h-5 shrink-0"/>}
                <p>
                  <strong>
                    {robAnswer === curScen.correctAns
                      ? (isEn ? 'Correct! ' : '太棒了，完全正確！')
                      : (isEn ? 'Not quite right. Please see explanation: ' : '可惜答錯了！請先點擊上方「執行敏感度分析」按鈕觀察合併結果的變化，解析如下：')}
                  </strong>
                  {curScen.exp}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            LAB 4: Annotated Funnel Plot Simulator
           ========================================== */}
        <div className="p-8 bg-white dark:bg-[#011a14] rounded-2xl shadow-sm border border-slate-200 dark:border-emerald-900/60">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="font-extrabold text-2xl text-slate-800 dark:text-emerald-300">
              {isEn ? 'Experiment 4: Funnel Plot & Small-Study Effects Simulator' : '實驗 4：漏斗圖 (Funnel Plot) 與小樣本效應視覺模擬器'}
            </h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
              {isEn ? 'Topic 6: Publication Bias' : '對應單元：6. 發表偏差 (Publication Bias)'}
            </span>
          </div>

          {/* How to Play Box */}
          <div className="mb-6 p-4 bg-slate-50 dark:bg-[#022c22] rounded-xl border-l-4 border-emerald-500 text-sm text-slate-700 dark:text-emerald-100 space-y-1">
            <p className="font-bold text-emerald-700 dark:text-emerald-300">
              {isEn ? '🎮 How to Play & Axis Guide:' : '🎮 玩法說明與座標軸判讀：'}
            </p>
            <p>
              {isEn
                ? '1. Switch between "Mode A: Symmetric" and "Mode B: Small-Study Effects (Asymmetric)". 2. Click "+ Add 5 Studies" to see how sample size (Y-axis) affects spread around the Pooled Effect (X-axis), and watch the Egger\'s test power warning when k < 10. 3. In Mode B, toggle "Show Missing Unpublished Studies" to reveal the file-drawer problem!'
                : '【步驟 1】切換「模式 A（對稱分佈）」與「模式 B（存在小樣本效應/不對稱）」。【步驟 2】點擊「➕ 新增 5 篇研究」，觀察大樣本研究（頂端）與小樣本研究（底端）的分佈差異，以及研究數 k < 10 時的 Egger\'s test 檢定力警示。【步驟 3】在模式 B 下，勾選「👁️ 顯示未發表的隱藏研究」，親眼看見右下角因為陰性結果而被鎖進抽屜 (File-drawer problem) 的小研究！'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => switchFunnelMode('sym')}
                className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all ${
                  funnelMode === 'sym'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-[#022c22] dark:text-emerald-200 dark:border-emerald-800'
                }`}
              >
                {isEn ? 'Mode A: Symmetric (No Bias)' : '模式 A：對稱分佈 (無明顯偏差)'}
              </button>
              <button
                onClick={() => switchFunnelMode('asym')}
                className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all ${
                  funnelMode === 'asym'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-[#022c22] dark:text-emerald-200 dark:border-emerald-800'
                }`}
              >
                {isEn ? 'Mode B: Asymmetric (Small-Study Effects)' : '模式 B：不對稱 (存在小樣本效應)'}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {funnelMode === 'asym' && (
                <button
                  onClick={() => setShowMissing(!showMissing)}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs border-2 transition-all ${
                    showMissing
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-red-50 text-red-700 border-red-300 dark:bg-[#3c1414] dark:text-red-200 dark:border-red-800'
                  }`}
                >
                  👁️ {showMissing
                    ? (isEn ? 'Hide Unpublished Studies' : '隱藏未發表研究')
                    : (isEn ? 'Show Missing Unpublished Studies' : '顯示未發表的隱藏研究 (抽屜問題)')}
                </button>
              )}
              <button onClick={addFiveStudies} className="px-4 py-2 bg-slate-800 text-white dark:bg-emerald-600 font-bold text-sm rounded-xl hover:opacity-90">
                ➕ {isEn ? 'Add 5 Studies' : '新增 5 篇研究'}
              </button>
              <button onClick={() => setFunnelStudies([])} className="px-3.5 py-2 border-2 border-slate-200 dark:border-emerald-800 font-bold text-sm rounded-xl text-slate-600 dark:text-emerald-300">
                {isEn ? 'Clear (k=0)' : '清空 (體驗 k<10)'}
              </button>
            </div>
          </div>

          {/* Annotated Funnel Plot Canvas */}
          <div className="relative pl-12 pr-4 pt-6 pb-10 bg-slate-50 dark:bg-[#022c22] rounded-2xl border border-slate-200 dark:border-emerald-800">
            {/* Y-Axis Label (Vertical) */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-xs font-extrabold tracking-wider text-slate-500 dark:text-emerald-400 whitespace-nowrap">
              {isEn ? 'Precision (1/SE) / Sample Size ▲' : '精確度 (1/SE) / 樣本數大小 ▲'}
            </div>

            {/* Plot Area */}
            <div className="relative w-full h-64 bg-white dark:bg-[#011a14] rounded-xl border-l-2 border-b-2 border-slate-400 dark:border-emerald-600 overflow-hidden">
              {/* Top / Bottom Y-Axis Annotations */}
              <div className="absolute left-2 top-2 text-[11px] font-bold text-slate-500 dark:text-emerald-400/80 bg-white/80 dark:bg-[#011a14]/80 px-2 py-0.5 rounded">
                ▲ {isEn ? 'Top: Large Studies (High Precision, Narrow Spread)' : '頂端：大樣本研究 (高精確度、變異小)'}
              </div>
              <div className="absolute left-2 bottom-2 text-[11px] font-bold text-slate-500 dark:text-emerald-400/80 bg-white/80 dark:bg-[#011a14]/80 px-2 py-0.5 rounded">
                ▼ {isEn ? 'Bottom: Small Studies (Low Precision, Wide Spread)' : '底端：小樣本研究 (低精確度、分散廣)'}
              </div>

              {/* SVG Pseudo 95% CI Funnel Triangle & Pooled Line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon points="50,5 12,98 88,98" fill="rgba(16, 185, 129, 0.06)" />
                {/* Left & Right 95% Pseudo CI Slopes */}
                <line x1="50" y1="5" x2="12" y2="98" stroke="#10b981" strokeWidth="0.6" strokeDasharray="2,2" />
                <line x1="50" y1="5" x2="88" y2="98" stroke="#10b981" strokeWidth="0.6" strokeDasharray="2,2" />
                {/* Central Pooled Effect Line */}
                <line x1="50" y1="0" x2="50" y2="100" stroke="#64748b" strokeWidth="0.8" strokeDasharray="3,2" />
              </svg>

              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-[#022c22] px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                {isEn ? 'Pooled Effect Line' : '合併效應中線 (Pooled Effect)'}
              </div>

              {/* Study Dots */}
              {funnelStudies.map((s, i) => {
                if (s.missing && !showMissing) return null;
                return (
                  <div
                    key={i}
                    title={s.missing ? (isEn ? 'Unpublished Negative Small Study' : '未發表的陰性小樣本研究') : (isEn ? 'Published Study' : '已發表研究')}
                    className={`absolute w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${
                      s.missing
                        ? 'border-2 border-dashed border-red-500 bg-red-500/20 animate-pulse'
                        : 'bg-slate-800 dark:bg-emerald-400 shadow-sm border border-white dark:border-slate-900'
                    }`}
                    style={{ left: `${s.x}%`, top: `${s.y}%` }}
                  />
                );
              })}
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-emerald-300 mt-3 px-2">
              <span>◀ {isEn ? 'Favors Intervention (Large Beneficial Effect)' : '利於實驗組 (療效顯著區)'}</span>
              <span className="font-extrabold text-slate-800 dark:text-white">
                {isEn ? 'X-Axis: Effect Estimate (ln OR / RR)' : '橫軸 (X 軸)：效應估計值 Effect Estimate (ln OR / RR)'}
              </span>
              <span>{isEn ? 'Favors Control / Null (Negative Results)' : '無效或利於對照組 (陰性結果區)'} ▶</span>
            </div>
          </div>

          {/* Egger's Test & Methodological Interpretation Status */}
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border text-xs font-medium ${
              visiblePublishedCount < 10
                ? 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-[#033c2f] dark:border-emerald-700 dark:text-emerald-100'
            }`}>
              <div className="font-extrabold text-sm mb-1">
                📊 {isEn ? `Published Studies Count: k = ${visiblePublishedCount}` : `目前場上已發表研究數：k = ${visiblePublishedCount} 篇`}
              </div>
              {visiblePublishedCount < 10 ? (
                <p>
                  ⚠️ {isEn
                    ? 'Warning: Because k < 10, statistical tests for asymmetry (like Egger\'s test) have very low statistical power and are NOT recommended! Click "+ Add 5 Studies" to reach k ≥ 10.'
                    : '統計檢定力警示：當納入研究數 k < 10 篇時，Egger\'s test 等統計檢定的檢定力 (Power) 過低，極易產生偽陰性，指引不建議單憑檢定 p 值判讀！請點擊「新增 5 篇研究」使 k ≥ 10。'}
                </p>
              ) : (
                <p>
                  ✅ {isEn
                    ? `With k = ${visiblePublishedCount} (≥ 10), Egger's regression test has adequate power: ${funnelMode === 'sym' ? 'p = 0.42 (No significant asymmetry detected).' : 'p = 0.008 (Significant asymmetry / small-study effects detected!).'}`
                    : `目前研究數 k = ${visiblePublishedCount} (≥ 10 篇)，具備足夠檢定力執行 Egger's 線性迴歸檢定：${funnelMode === 'sym' ? '模擬檢定結果 p = 0.42（未偵測到顯著不對稱）。' : '模擬檢定結果 p = 0.008（偵測到顯著不對稱 / 小樣本效應！）。'}`}
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#022c22] border border-slate-200 dark:border-emerald-800/60 text-xs text-slate-700 dark:text-emerald-200">
              <div className="font-extrabold text-sm mb-1">
                💡 {isEn ? 'GRADE Interpretation Reminder:' : 'GRADE 判讀核心提醒：'}
              </div>
              <p>
                {funnelMode === 'sym'
                  ? (isEn ? 'A symmetric funnel plot suggests low risk of publication bias, as small studies scatter evenly on both sides of the pooled effect.' : '對稱的漏斗圖顯示小樣本研究均勻散佈在合併效應中線兩側，暗示發表偏差風險較低。')
                  : (isEn ? 'Notice the missing bottom-right corner! Small studies with negative results often remain unpublished ("file-drawer problem"), pulling the overall pooled effect toward an exaggerated benefit.' : '請注意右下角缺了一塊！規模小且結果為陰性（無效）的研究常因難以發表而被鎖在抽屜裡，這會導致我們看到的整體合併效應被往左側拉動（高估了真實療效），此時應考慮因疑似發表偏差而降級 (-1)！')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination at bottom of Interactive Lab */}
      <div className="flex justify-between items-center pt-10 mt-10 border-t-2 border-slate-100 dark:border-emerald-900/30">
        <button onClick={() => {setView('topic7'); window.scrollTo(0,0);}} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 dark:text-emerald-600/80 dark:hover:text-emerald-400 font-bold transition-colors">
          <ChevronLeft className="w-5 h-5" /> <span>{d.prev}: {dict[lang].menu.topic7}</span>
        </button>
        <button onClick={() => {setView('resources'); window.scrollTo(0,0);}} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 font-bold transition-all">
          <LinkIcon className="w-5 h-5" />
          <span>{d.next}: {dict[lang].menu.resources}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// EXTERNAL RESOURCES VIEW
// ==========================================
const ExternalResources = ({ lang, setView }) => {
  const isEn = lang === 'en';
  const d = dict[lang].common;

  const resources = [
    {
      title: isEn ? "The GRADE Book (Official Updated Guidance)" : "GRADE Book 官方線上指南 (最新標準)",
      org: "GRADEpro / GRADE Working Group",
      desc: isEn
        ? "The most up-to-date, official methodological handbook for grading certainty of evidence, Important Effect Thresholds, and the Evidence-to-Decision (EtD) framework."
        : "最新版的 GRADE 官方方法學線上指南，詳盡涵蓋證據確定性評估、重要效果門檻 (Thresholds) 設定以及從證據到決策 (EtD) 框架的完整規範。",
      url: "https://book.gradepro.org/"
    },
    {
      title: isEn ? "The GRADE Working Group Official Website" : "GRADE 國際工作小組官方網站",
      org: "gradeworkinggroup.org",
      desc: isEn
        ? "Access foundational papers (including the JCE GRADE Guidelines series), working group updates, and international network resources."
        : "提供 GRADE 工作小組之核心發表文獻（包含 J Clin Epidemiol 系列指引論文）、工作坊資訊與全球實證網路資源。",
      url: "https://www.gradeworkinggroup.org/"
    },
    {
      title: isEn ? "GRADEpro GDT (Guideline Development Tool)" : "GRADEpro GDT 線上軟體 (製作 SoF 與 EtD 表格)",
      org: "McMaster University & Evidence Prime",
      desc: isEn
        ? "Free web-based software to create Summary of Findings (SoF) tables, Evidence Profiles (EP), and interactive Evidence-to-Decision (EtD) frameworks."
        : "由 McMaster 大學團隊開發的官方線上軟體，可免費註冊並實際演練製作「總結結果表格 (SoF)」、「證據概況表 (EP)」與 EtD 決策表。",
      url: "https://www.gradepro.org/"
    },
    {
      title: isEn ? "Risk of Bias Tools (RoB 2 & ROBINS-I)" : "Cochrane 偏差風險評估工具官網 (RoB 2 & ROBINS-I)",
      org: "riskofbias.info",
      desc: isEn
        ? "Official guidance, templates, and cribsheets for assessing Risk of Bias in randomized trials (RoB 2) and non-randomized studies of interventions (ROBINS-I)."
        : "提供評估隨機對照試驗 (RoB 2) 與非隨機介入研究 (ROBINS-I) 偏差風險的官方指導手冊、評估表單與演算法說明。",
      url: "https://www.riskofbias.info/"
    },
    {
      title: isEn ? "Cochrane Handbook for Systematic Reviews of Interventions" : "Cochrane 介入性系統性文獻回顧手冊",
      org: "Cochrane Collaboration (Chapter 14 & 15)",
      desc: isEn
        ? "See Chapter 14 (Completing 'Summary of findings' tables and grading the certainty of the evidence) and Chapter 15 (Interpreting results and drawing conclusions)."
        : "特別推薦閱讀第 14 章（完成 SoF 表格與評估證據確定性）與第 15 章（解釋結果與形成結論），為系統性文獻回顧必讀經典。",
      url: "https://training.cochrane.org/handbook"
    },
    {
      title: isEn ? "Cochrane Training: GRADE Learning Resources" : "Cochrane Training 線上訓練與數位課程",
      org: "training.cochrane.org",
      desc: isEn
        ? "Webinars, interactive modules, and recorded lectures on applying GRADE in systematic reviews and clinical practice guidelines."
        : "收錄豐富的 GRADE 線上研討會錄影 (Webinars)、互動式微課程與最新方法學演講。",
      url: "https://training.cochrane.org/"
    }
  ];

  return (
    <div className="animate-fadeIn pb-12">
      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-emerald-50 mb-4 border-b-4 border-emerald-500 pb-3 inline-block">
        {dict[lang].menu.resources}
      </h1>
      <p className="text-slate-600 dark:text-emerald-200/80 mb-8 text-lg font-medium">
        {isEn
          ? "Curated official guidelines, software tools, and methodological handbooks for advanced GRADE practice."
          : "為您精選最權威的 GRADE 官方指南、線上製表軟體 (GRADEpro) 與偏差風險評估工具網站，供課後深入探索與實作使用。"}
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {resources.map((res, idx) => (
          <a
            key={idx}
            href={res.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 bg-white dark:bg-[#011a14] rounded-2xl shadow-sm border-2 border-slate-100 dark:border-emerald-900/60 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-[#033c2f] dark:text-emerald-300">
                  {res.org}
                </span>
                <LinkIcon className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-emerald-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors mb-2">
                {res.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-emerald-200/80 leading-relaxed">
                {res.desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-emerald-900/40 flex items-center justify-between text-xs font-mono text-emerald-600 dark:text-emerald-400">
              <span className="truncate">{res.url}</span>
              <span className="font-sans font-bold flex items-center gap-1 shrink-0">
                {isEn ? "Open Link" : "前往網站"} <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Pagination at bottom of External Resources */}
      <div className="flex justify-between items-center pt-10 mt-10 border-t-2 border-slate-100 dark:border-emerald-900/30">
        <button onClick={() => {setView('lab'); window.scrollTo(0,0);}} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 dark:text-emerald-600/80 dark:hover:text-emerald-400 font-bold transition-colors">
          <ChevronLeft className="w-5 h-5" /> <span>{d.prev}: {dict[lang].menu.lab}</span>
        </button>
        <button onClick={() => {setView('overview'); window.scrollTo(0,0);}} className="px-5 py-2.5 border-2 border-slate-200 dark:border-emerald-800 rounded-xl hover:bg-slate-100 dark:hover:bg-[#022c22] text-slate-700 dark:text-emerald-300 flex items-center gap-2 font-bold transition-colors">
          <Home className="w-4 h-4" />
          <span>{isEn ? "Back to Course Overview" : "返回課程總覽"}</span>
        </button>
      </div>
    </div>
  );
};


// ==========================================
// LOGIN COMPONENT (For Session Tracking)
// ==========================================
const LoginScreen = ({ lang, onLogin }) => {
  const d = dict[lang].login;
  const [form, setForm] = useState({ group: '', studentId: '', name: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.studentId && form.name) onLogin(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#011a14] transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-[#022c22] p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-emerald-900/50 animate-fadeIn">
        <div className="flex justify-center mb-6">
           <div className="p-4 bg-emerald-50 dark:bg-[#034c3c] rounded-full">
              <User className="w-10 h-10 text-emerald-600 dark:text-emerald-300" />
           </div>
        </div>
        <h2 className="text-2xl font-extrabold text-center text-slate-800 dark:text-emerald-50 mb-2">{d.title}</h2>
        <p className="text-center text-slate-500 dark:text-emerald-600/80 mb-8 font-medium">{d.subtitle}</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
             <input required type="text" placeholder={d.group} value={form.group} onChange={e=>setForm({...form, group: e.target.value})} className="w-full p-4 font-medium border-2 border-slate-100 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none dark:bg-[#033c2f] dark:border-emerald-900/50 dark:text-emerald-100 dark:placeholder-emerald-700/50 transition-colors"/>
          </div>
          <div>
             <input required type="text" placeholder={d.studentId} value={form.studentId} onChange={e=>setForm({...form, studentId: e.target.value})} className="w-full p-4 font-medium border-2 border-slate-100 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none dark:bg-[#033c2f] dark:border-emerald-900/50 dark:text-emerald-100 dark:placeholder-emerald-700/50 transition-colors"/>
          </div>
          <div>
             <input required type="text" placeholder={d.name} value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full p-4 font-medium border-2 border-slate-100 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none dark:bg-[#033c2f] dark:border-emerald-900/50 dark:text-emerald-100 dark:placeholder-emerald-700/50 transition-colors"/>
          </div>
          <button type="submit" className="w-full p-4 mt-4 font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
            {d.start}
          </button>
        </form>
      </div>
    </div>
  );
};


// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [lang, setLang] = useState('tw'); // default to TW as requested for UI
  const [theme, setTheme] = useState('light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('overview');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const { sessionInfo, login, logout, updateHistory, syncToGoogleSheet, syncStatus } = useTracker();
  const timeIntervalRef = useRef(null);

  const handleLogout = async () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    await logout();
    setCurrentView('overview');
    window.scrollTo(0, 0);
  };

  // Stop speech & auto-sync progress to Google Sheets when user switches topic
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    if (sessionInfo.loggedIn) {
      syncToGoogleSheet();
    }
  }, [currentView, lang, sessionInfo.loggedIn, syncToGoogleSheet]);

  // Auto-sync when student closes or refreshes the browser tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      syncToGoogleSheet();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [syncToGoogleSheet]);

  // Theme application (Academic Dark Green setup)
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#011a14'; // Very dark background
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc'; // Slate 50
    }
  }, [theme]);

  // Global Time Tracking
  useEffect(() => {
    if (sessionInfo.loggedIn) {
      timeIntervalRef.current = setInterval(() => {
        updateHistory(currentView, { global: { time: 1 }, page: { time: 1 } });
      }, 1000);
      return () => clearInterval(timeIntervalRef.current);
    }
  }, [currentView, updateHistory, sessionInfo.loggedIn]);

  // TTS Functionality (Toggle Play / Stop)
  const speakContent = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    // If currently speaking, clicking again will immediately stop it
    if (isSpeaking || synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }
    
    let textToRead = "";
    const topics = dict[lang].topics;
    const currentTopic = topics.find(t => t.id === currentView);
    
    if (currentTopic) {
      textToRead = `${currentTopic.title}. ${dict[lang].common.overview}: ${currentTopic.overview} ${dict[lang].common.details}: ${currentTopic.details}`;
    } else if (currentView === 'lab') {
      textToRead = dict[lang].lab.title;
    }

    if (!textToRead) return;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    const voices = synth.getVoices();
    
    if (lang === 'en') {
      utterance.voice = voices.find(v => v.lang.includes('en-GB') && v.name.toLowerCase().includes('male')) || voices.find(v => v.lang.includes('en'));
    } else {
      utterance.voice = voices.find(v => v.lang.includes('zh-TW') && v.name.includes('Yating')) || voices.find(v => v.lang.includes('zh'));
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    synth.speak(utterance);
  };

  // Render routing
  if (!sessionInfo.loggedIn) {
    return <LoginScreen lang={lang} onLogin={login} />;
  }

  const renderView = () => {
    const topics = dict[lang].topics;
    const topicData = topics.find(t => t.id === currentView);
    if (topicData) return <TopicView key={topicData.id} topicData={topicData} lang={lang} updateHistory={updateHistory} setView={setCurrentView} topicList={topics} />;
    if (currentView === 'lab') return <InteractiveLab key="lab" lang={lang} setView={setCurrentView} />;
    if (currentView === 'resources') return <ExternalResources key="resources" lang={lang} setView={setCurrentView} />;
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      <Header
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        onMenuToggle={() => setMenuOpen(true)}
        speakContent={speakContent}
        isSpeaking={isSpeaking}
        syncToGoogleSheet={syncToGoogleSheet}
        syncStatus={syncStatus}
        onLogout={handleLogout}
        studentName={sessionInfo.name}
      />
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} lang={lang} currentView={currentView} setView={setCurrentView} />
      
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-10" onClick={() => updateHistory(currentView, { global: { clicks: 1 }, page: { clicks: 1 } })}>
        {renderView()}
      </main>

      <Footer lang={lang} />
    </div>
  );
}