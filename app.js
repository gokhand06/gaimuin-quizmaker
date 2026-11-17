'use strict';
/* UI for the quiz. The formula engine (parse / generate / fmt …) lives in engine.js.
   All interface text is in the I18N table below (en / ja). */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('fqm.' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('fqm.' + k, JSON.stringify(v)); } catch { alert(T('storeFail')); } },
  };
  const copy = o => JSON.parse(JSON.stringify(o));
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fmtTime = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  const toNum = s => { s = String(s).replace(/[０-９．]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/[−－]/g, '-').replace(/[^0-9.\-]/g, ''); return s === '' ? NaN : Number(s); };
  const isRight = (q, v) => v != null && Math.abs(v - q.answer) < 1e-9 * Math.max(1, Math.abs(q.answer));
  const DEFAULT_EXAM = '証券外務員';
  const HUES = [211, 142, 28, 280, 340, 174, 48, 255, 12, 95];

  /* ================= text (English / 日本語) ================= */
  const I18N = {
    en: {
      'theme.auto': 'Match system', 'theme.light': 'Light mode', 'theme.dark': 'Night mode',
      'nav.practice': 'Practice', 'nav.test': 'Test', 'nav.import': 'AI Import', 'nav.editor': 'Templates', 'nav.sheet': 'Formulas',
      'practice.h': 'Practice', 'practice.p': 'Pick an exam and topics. Every question comes with fresh numbers.',
      storeFail: 'Could not save to browser storage. Use Export to keep your templates.',
      examCount: (n, c) => `${n} question types · ${c} categories`,
      'cat.h': 'Categories', 'cat.all': 'All / none', 'cat.sw': 'Turn the whole category on / off', uncat: 'Other',
      'mode.type': 'Type the answer', 'mode.mc': '5択 Multiple choice',
      session: (c, t) => `This session ${c} / ${t}` + (t ? ` · ${Math.round(c / t * 100)}%` : ''),
      resetScores: 'Reset scores', confirmReset: 'Reset all scores?',
      noTopics: 'No topics selected. Turn on at least one topic in the categories.', tplProblem: 'This template has a problem: ',
      next: 'Next question', again: 'Same type, new numbers', giveup: 'Show me the answer', check: 'Check answer', yourAnswer: 'Your answer',
      ok: '○ Correct', ng: v => `× Incorrect — your answer ${v}`, sol: 'SOLUTION', ans: 'Answer',
      'test.h': 'Test', 'test.p': 'Build a mock test. Answers and solutions are shown only at the end.',
      'test.s0': 'Exam', 'test.s1': 'Topics', 'test.s2': 'Number of questions', 'test.s3': 'Answer style', 'test.start': 'Start test', 'test.none': 'Select at least one topic.',
      qof: (i, n) => `Question ${i} of ${n}`, back: 'Back', tnext: 'Next', finish: 'Finish test', finishNow: 'Finish now', quit: 'Quit test', goto: k => `Go to question ${k}`,
      quitConfirm: 'Quit this test? Your answers will be lost.', unanswered: n => `${n} question(s) are unanswered. Finish anyway?`,
      correct: (c, n) => `${c} / ${n} correct`, timeLine: (t, s) => `Time ${t} · about ${s} sec per question`,
      retry: n => `Retry the ${n} I missed`, newtest: 'New test', review: 'Review', yourAns: 'Your answer: ', correctAns: 'Correct: ',
      'imp.h': 'AI Import', 'imp.p': 'Turn a question you found into a ready-to-practise question type — no building by hand.',
      'imp.s1': 'Copy the prompt', 'imp.s1d': 'It teaches the AI this app\'s question format and lists your current exams and categories.',
      'imp.copy': 'Copy prompt', 'imp.copied': 'Copied ✓', 'imp.copyFail': 'Copy failed — open "Show prompt" and copy it by hand.', 'imp.show': 'Show prompt',
      'imp.s2': 'Ask the AI', 'imp.s2d': 'Paste the prompt into ChatGPT, Claude, Gemini or similar. Under it, paste the question you found (with its answer or formula if you have them). A screenshot works too.',
      'imp.s3': 'Paste the AI\'s reply', 'imp.s3d': 'Paste the whole reply, or drop / choose the file it gave you. Exported template files work too.',
      'imp.ph': 'Paste the AI\'s reply here…', 'imp.file': 'Choose file', 'imp.check': 'Check', 'imp.clear': 'Clear',
      'imp.found': n => `Found ${n} question type(s). Check the samples, then add them.`, 'imp.new': 'New', 'imp.update': 'Replaces existing',
      'imp.add': n => `Add ${n} to my questions`, 'imp.added': n => `Added ${n} question type(s). They're ready to practise.`, 'imp.go': 'Practise now',
      'imp.none': 'No question data found. Make sure you pasted the AI\'s full reply.', 'imp.parse': 'The reply is not valid data: ',
      'imp.skip': 'This one has a problem and will be skipped. Paste this message back to the AI and ask it to fix the template:',
      'imp.notObj': 'This entry is not a template object.', roll: '↻ Roll new numbers',
      'ed.new': '＋ New template', 'ed.export': 'Export', 'ed.import': 'Import', 'ed.savedHint': 'Saved in this browser. Export now and then to keep a backup file.',
      'ed.editT': 'Edit template', 'ed.newT': 'New template', 'ed.topic': 'Topic (shown as the title)', 'ed.exam': 'Exam', 'ed.cat': 'Category', 'ed.unit': 'Answer unit',
      'ed.optional': 'optional', 'ed.question': 'Question', 'ed.qph': 'Type the question here, then drop bubbles where the numbers go…',
      'ed.qhint': 'Click a bubble on the right to insert it at the cursor, or drag it into place. Bubbles can be dragged around and removed with Backspace. Start a line with | to make a table row (cells separated by |).',
      'ed.rule': 'Rule for the numbers', 'ed.rulePh': 'e.g. 総資産 > 総負債', 'ed.ruleHint': 'Numbers are re-rolled until this is true. Join rules with "and".',
      'ed.save': 'Save template', 'ed.dup': 'Duplicate', 'ed.del': 'Delete', 'ed.preview': 'LIVE PREVIEW',
      'ed.bubbles': 'Bubbles', 'ed.bubblesSub': 'click to insert · drag to place', 'ed.numbers': 'Numbers', 'ed.numbersSub': 'new random value in every question',
      'ed.nameNum': 'Name, e.g. 株価', 'ed.from': 'From', 'ed.to': 'To', 'ed.step': 'Step', 'ed.showAs': 'Show as', 'ed.list': '…or pick from a list', 'ed.addNum': '＋ Add a number',
      'ed.steps': 'Formula steps', 'ed.stepsSub': 'top to bottom · the last step is the answer', 'ed.stepName': 'Step name, e.g. PER',
      'ed.label': 'Display name (optional)', 'ed.labelPh': 'shown instead of the name · any characters', 'ed.note': 'Explanation (optional)', 'ed.notePh': 'why this step · shown under it',
      'ed.rounding': 'Rounding', 'ed.none': 'None', 'ed.decimals': 'Decimals kept', 'ed.addStep': '＋ Add a step', 'ed.remove': 'Remove',
      'ed.help': 'How formulas work',
      'ed.helpHtml': '<p>Each step is <code>name = formula</code>. A later step can use an earlier step\'s name. <b>The last step is the answer.</b></p><p>You can use <code>+ - * /</code> (or <code>× ÷</code>), brackets, <code>10%</code>, <code>floor() ceil() round() abs() min() max()</code>, and <code>if(condition, a, b)</code> for fee tables, e.g. <code>if(約定代金 &lt;= 10000000, 約定代金 × 0.7% + 12500, 約定代金 × 0.575% + 25000)</code>.</p><p>Names can be Japanese or English, without spaces (use _).</p>',
      'ed.chipsEmpty': 'Name a number below and its bubble appears here.', 'ed.pvEmpty': 'Write a question and at least one formula step to see a sample here.',
      'ed.unk': 'No number or step has this name', 'ed.copyMade': 'Copy created — edit it and press Save.', 'ed.copySuffix': ' (copy)', 'ed.savedOk': 'Saved ✓',
      'ed.delConfirm': n => `Delete the template "${n}"?`,
      'err.topic': 'Give the template a topic name.', 'err.stepName': 'Every formula step needs a name.',
      'err.name': n => `"${n}" can't be used as a name. Use letters, kanji, digits or _ only — no spaces or symbols.`,
      'err.dup': n => `The name "${n}" is used twice.`, 'err.unknown': l => 'The question uses a bubble that does not exist: ' + l,
      'sheet.h': 'Formulas', 'sheet.p': e => `Every formula used by your ${e} templates, on one page.`,
    },
    ja: {
      'theme.auto': 'システムに合わせる', 'theme.light': 'ライトモード', 'theme.dark': 'ナイトモード',
      'nav.practice': '練習', 'nav.test': 'テスト', 'nav.import': 'AIインポート', 'nav.editor': 'テンプレート', 'nav.sheet': '公式集',
      'practice.h': '練習', 'practice.p': '試験と分野を選んでください。毎回新しい数字で出題されます。',
      storeFail: 'ブラウザに保存できませんでした。エクスポートでテンプレートを保存してください。',
      examCount: (n, c) => `${n}種類の問題・${c}カテゴリ`,
      'cat.h': 'カテゴリ', 'cat.all': 'すべて / 解除', 'cat.sw': 'カテゴリ全体をオン / オフ', uncat: 'その他',
      'mode.type': '答えを入力', 'mode.mc': '5択',
      session: (c, t) => `今回 ${c} / ${t}` + (t ? `・${Math.round(c / t * 100)}%` : ''),
      resetScores: '成績をリセット', confirmReset: 'すべての成績をリセットしますか？',
      noTopics: '分野が選択されていません。カテゴリから1つ以上選んでください。', tplProblem: 'このテンプレートに問題があります: ',
      next: '次の問題', again: '同じ形式・別の数字', giveup: '答えを見る', check: '答え合わせ', yourAnswer: '答え',
      ok: '○ 正解', ng: v => `× 不正解 — あなたの答え ${v}`, sol: '解き方', ans: '答',
      'test.h': 'テスト', 'test.p': '模擬テストを作成します。答えと解き方は最後にまとめて表示されます。',
      'test.s0': '試験', 'test.s1': '出題範囲', 'test.s2': '問題数', 'test.s3': '解答方式', 'test.start': 'テスト開始', 'test.none': '分野を1つ以上選んでください。',
      qof: (i, n) => `第${i}問 / 全${n}問`, back: '戻る', tnext: '次へ', finish: 'テスト終了', finishNow: 'ここで終了', quit: 'テストをやめる', goto: k => `第${k}問へ`,
      quitConfirm: 'テストをやめますか？解答は失われます。', unanswered: n => `未解答が${n}問あります。終了しますか？`,
      correct: (c, n) => `${n}問中 ${c}問正解`, timeLine: (t, s) => `時間 ${t}・1問あたり約${s}秒`,
      retry: n => `間違えた${n}問に再挑戦`, newtest: '新しいテスト', review: '振り返り', yourAns: 'あなたの答え: ', correctAns: '正解: ',
      'imp.h': 'AIインポート', 'imp.p': '見つけた問題を、手作業なしで練習できる問題形式に変換します。',
      'imp.s1': 'プロンプトをコピー', 'imp.s1d': 'このアプリの問題形式と、現在の試験・カテゴリをAIに伝える指示文です。',
      'imp.copy': 'プロンプトをコピー', 'imp.copied': 'コピーしました ✓', 'imp.copyFail': 'コピーできませんでした。「プロンプトを表示」から手動でコピーしてください。', 'imp.show': 'プロンプトを表示',
      'imp.s2': 'AIに依頼', 'imp.s2d': 'ChatGPT・Claude・Geminiなどにプロンプトを貼り付け、その下に見つけた問題（あれば答えや公式も）を貼り付けます。スクリーンショットでもOKです。',
      'imp.s3': 'AIの回答を貼り付け', 'imp.s3d': '回答をそのまま貼り付けるか、受け取ったファイルをドロップ／選択してください。エクスポートしたファイルも使えます。',
      'imp.ph': 'ここにAIの回答を貼り付け…', 'imp.file': 'ファイルを選択', 'imp.check': '確認する', 'imp.clear': 'クリア',
      'imp.found': n => `${n}件の問題形式が見つかりました。サンプルを確認して追加してください。`, 'imp.new': '新規', 'imp.update': '既存を上書き',
      'imp.add': n => `${n}件を追加する`, 'imp.added': n => `${n}件の問題形式を追加しました。すぐに練習できます。`, 'imp.go': '練習する',
      'imp.none': '問題データが見つかりませんでした。AIの回答全体を貼り付けたか確認してください。', 'imp.parse': 'データの形式が正しくありません: ',
      'imp.skip': 'この形式には問題があるため追加されません。このメッセージをAIに貼り付けて修正を依頼してください:',
      'imp.notObj': 'このデータはテンプレートの形式ではありません。', roll: '↻ 数字を引き直す',
      'ed.new': '＋ 新規テンプレート', 'ed.export': 'エクスポート', 'ed.import': 'インポート', 'ed.savedHint': 'このブラウザに保存されます。時々エクスポートしてバックアップしてください。',
      'ed.editT': 'テンプレートを編集', 'ed.newT': '新規テンプレート', 'ed.topic': 'テーマ（問題のタイトル）', 'ed.exam': '試験', 'ed.cat': 'カテゴリ', 'ed.unit': '答えの単位',
      'ed.optional': '任意', 'ed.question': '問題文', 'ed.qph': '問題文を入力し、数字の位置にバブルをドロップ…',
      'ed.qhint': '右のバブルをクリックするとカーソル位置に挿入、ドラッグで好きな位置に配置できます。バブルはドラッグで移動、Backspaceで削除できます。| で始まる行は表の行になります（セルは | で区切ります）。',
      'ed.rule': '数字の条件', 'ed.rulePh': '例: 総資産 > 総負債', 'ed.ruleHint': 'この条件を満たすまで数字を引き直します。複数の条件は and でつなぎます。',
      'ed.save': '保存', 'ed.dup': '複製', 'ed.del': '削除', 'ed.preview': 'プレビュー',
      'ed.bubbles': 'バブル', 'ed.bubblesSub': 'クリックで挿入・ドラッグで配置', 'ed.numbers': '数値', 'ed.numbersSub': '出題ごとにランダムな値になります',
      'ed.nameNum': '名前（例: 株価）', 'ed.from': '最小', 'ed.to': '最大', 'ed.step': '刻み', 'ed.showAs': '表示', 'ed.list': '…またはリストから選ぶ', 'ed.addNum': '＋ 数値を追加',
      'ed.steps': '計算式', 'ed.stepsSub': '上から順に計算・最後の式が答え', 'ed.stepName': '式の名前（例: PER）',
      'ed.label': '表示名（任意）', 'ed.labelPh': '名前の代わりに表示・記号も使えます', 'ed.note': '説明（任意）', 'ed.notePh': 'このステップの理由・ステップの下に表示',
      'ed.rounding': '端数処理', 'ed.none': 'なし', 'ed.decimals': '残す桁数', 'ed.addStep': '＋ 式を追加', 'ed.remove': '削除',
      'ed.help': '計算式の書き方',
      'ed.helpHtml': '<p>各ステップは <code>名前 = 式</code> です。後のステップでは前のステップの名前を使えます。<b>最後のステップが答えになります。</b></p><p>使えるもの: <code>+ - * /</code>（<code>× ÷</code> も可）、かっこ、<code>10%</code>、<code>floor() ceil() round() abs() min() max()</code>、手数料表などには <code>if(条件, 真の値, 偽の値)</code>。例: <code>if(約定代金 &lt;= 10000000, 約定代金 × 0.7% + 12500, 約定代金 × 0.575% + 25000)</code></p><p>名前は日本語・英語どちらでも使えます。スペースは使えません（_ を使ってください）。</p>',
      'ed.chipsEmpty': '下で数値に名前を付けるとバブルが表示されます。', 'ed.pvEmpty': '問題文と計算式を1つ以上入力すると、ここにサンプルが表示されます。',
      'ed.unk': 'この名前の数値・式はありません', 'ed.copyMade': '複製しました。編集して保存してください。', 'ed.copySuffix': '（コピー）', 'ed.savedOk': '保存しました ✓',
      'ed.delConfirm': n => `テンプレート「${n}」を削除しますか？`,
      'err.topic': 'テーマ名を入力してください。', 'err.stepName': 'すべての計算式に名前が必要です。',
      'err.name': n => `「${n}」は名前に使えません。文字・漢字・数字・_ のみ使えます（スペースや記号は不可）。`,
      'err.dup': n => `名前「${n}」が2回使われています。`, 'err.unknown': l => '問題文に存在しないバブルがあります: ' + l,
      'sheet.h': '公式集', 'sheet.p': e => `${e}のテンプレートで使われている公式の一覧です。`,
    },
  };
  let lang = LS.get('lang', /^ja/.test(navigator.language || '') ? 'ja' : 'en');
  function T(k, ...a) { const d = I18N[lang][k] ?? I18N.en[k]; return d == null ? k : typeof d === 'function' ? d(...a) : d; }

  /* ================= data ================= */
  const migrate = t => { if (!t.category) t.category = t.title || ''; if (!t.exam) t.exam = DEFAULT_EXAM; delete t.title; return t; };
  let templates = LS.get('templates', []);
  const removed = LS.get('removed', []);
  for (const b of window.BUILTIN_TEMPLATES || []) if (!templates.some(t => t.id === b.id) && !removed.includes(b.id)) templates.push(copy(b));
  templates.forEach(migrate);
  const saveTemplates = () => LS.set('templates', templates);
  saveTemplates();
  let stats = LS.get('stats', {}), mc = LS.get('mc', false);
  const legacyIds = names => templates.filter(t => names.includes(t.theme)).map(t => t.id); // old versions stored topic names
  let off = LS.get('offIds', null) || legacyIds(LS.get('off', []));
  let testOff = LS.get('testOffIds', null) || legacyIds(LS.get('testOff', []));
  const session = { c: 0, t: 0 };
  const exams = () => [...new Set(templates.map(t => t.exam))];
  let exam = LS.get('exam', null);
  const fixExam = () => { if (!exams().includes(exam)) exam = exams()[0] || DEFAULT_EXAM; };
  fixExam();
  const setExam = e => { exam = e; LS.set('exam', e); openCat.p = openCat.t = undefined; $('#brandSub').textContent = exam; };
  const inExam = () => templates.filter(t => t.exam === exam);
  const catKey = t => t.category || '';
  const catsOf = list => [...new Set(list.map(catKey))];
  const catLabel = c => c || T('uncat');
  const record = (theme, right) => { const s = stats[theme] || (stats[theme] = { c: 0, t: 0 }); s.t++; if (right) s.c++; LS.set('stats', stats); };
  const openCat = { p: undefined, t: undefined };

  /* ================= shared rendering ================= */
  function questionHTML(tpl, q) {
    const fill = s => esc(s).replace(/\{([^}]+)\}/g, (m, n) => (n = n.trim()) in q.env ? '<b>' + fmt(q.env[n], q.fm[n]) + '</b>' : '<span class="bad">' + m + '</span>');
    let html = '', rows = [];
    const flush = () => {
      if (!rows.length) return;
      const w = Math.max(...rows.map(r => r.length));
      rows.forEach(r => { while (r.length < w) r.push(''); });
      html += '<table>' + rows.map((r, i) => '<tr>' + r.map(c => i === 0 && rows.length > 1 ? '<th>' + fill(c) + '</th>' : '<td>' + fill(c) + '</td>').join('') + '</tr>').join('') + '</table>';
      rows = [];
    };
    for (const line of String(tpl.text || '').split('\n')) {
      if (line.trim().startsWith('|')) rows.push(line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim()));
      else { flush(); html += '<div>' + (fill(line) || '&nbsp;') + '</div>'; }
    }
    flush();
    return html;
  }
  function solutionHTML(tpl, q) {
    return `<div class="sol"><div class="sol-h">${T('sol')}</div>` + q.steps.map(s => {
      const rounded = s.round && s.round !== 'none', changed = rounded && Math.abs(s.raw - s.val) > 1e-12;
      // "name = formula / = numbers / = result", skipping a line that only repeats the one above it
      const lines = [esc(s.names)];
      if (s.nums !== s.names) lines.push(esc(s.nums));
      const plain = fmtRaw(s.val, s.format);
      if (changed) lines.push(`${fmtRaw(s.raw, s.format)} → <b>${fmt(s.val, s.format)}</b>`);
      else if (s.nums !== plain) lines.push(`<b>${plain}</b>`);
      else lines[lines.length - 1] = `<b>${lines[lines.length - 1]}</b>`;
      if (rounded) lines[lines.length - 1] += `<span class="note">(${roundLabel(s.round, s.d)})</span>`;
      return `<div class="step"><div class="f">${esc(s.label || s.name)} = ${lines[0]}</div>` + lines.slice(1).map((l, i) => `<div class="${i === lines.length - 2 ? 'r' : 'n'}">= ${l}</div>`).join('') +
        (s.note ? `<div class="why">${esc(s.note)}</div>` : '') + '</div>';
    }).join('') + `<div class="final">${T('ans')} <b>${fmt(q.answer, q.format)}</b> ${esc(tpl.unit || '')}</div></div>`;
  }
  const headHTML = tpl => `<h2 class="theme">${esc(tpl.theme)}</h2>${tpl.category ? `<span class="group">${esc(tpl.category)}</span>` : ''}`;
  function mcChoices(q) {
    const d = q.d == null ? (Number.isInteger(q.answer) ? 0 : 2) : q.d, set = new Set([q.answer]);
    for (const m of shuffle([0.5, 0.8, 0.9, 0.95, 1.05, 1.1, 1.2, 1.25, 1.5, 2])) { if (set.size >= 5) break; set.add(roundTo(q.answer * m, 'round', d)); }
    return [...set].sort((a, b) => a - b);
  }
  // answer area: 5 choice buttons or a typed-answer box. done=true marks right / wrong.
  function answerHTML(tpl, q, choices, sel, raw, withCheck, done) {
    const unit = esc(tpl.unit || '');
    if (mc) return `<div class="mcs">${choices.map(v => {
      const cls = done ? (v === q.answer ? 'right' : v === sel ? 'wrong' : '') : (sel === v ? 'sel' : '');
      return `<button class="opt ${cls}" data-v="${v}" ${done ? 'disabled' : ''}>${fmt(v, q.format)} <small>${unit}</small></button>`;
    }).join('')}</div>`;
    return `<form class="ansform"><div class="ansbox"><input class="ans" inputmode="decimal" autocomplete="off" placeholder="${T('yourAnswer')}" value="${esc(raw || '')}" ${done ? 'disabled' : ''}><span class="unit">${unit}</span></div>${withCheck ? `<button class="primary big" ${done ? 'disabled' : ''}>${T('check')}</button>` : ''}</form>`;
  }
  const modeSeg = () => `<div class="seg sm"><button data-mode="type" class="${mc ? '' : 'on'}">${T('mode.type')}</button><button data-mode="mc" class="${mc ? 'on' : ''}">${T('mode.mc')}</button></div>`;
  const setMode = m => { mc = m === 'mc'; LS.set('mc', mc); };

  // big exam cards
  function examsHTML() {
    return `<div class="exams">${exams().map(e => {
      const l = templates.filter(t => t.exam === e);
      return `<button class="exam ${e === exam ? 'on' : ''}" data-exam="${esc(e)}"><span class="ico">${esc([...e][0] || '?')}</span><span><b>${esc(e)}</b><small>${T('examCount', l.length, catsOf(l).length)}</small></span></button>`;
    }).join('')}</div>`;
  }
  // category accordion with a switch per category and a toggle per topic. ctx: 'p' practice, 't' test
  const getOff = ctx => ctx === 'p' ? off : testOff;
  const setOff = (ctx, l) => { if (ctx === 'p') { off = l; LS.set('offIds', l); } else { testOff = l; LS.set('testOffIds', l); } };
  function pickerHTML(ctx, scores) {
    const list = inExam(), cats = catsOf(list), offL = getOff(ctx);
    if (openCat[ctx] === undefined) openCat[ctx] = cats[0];
    return `<div class="cath"><b>${T('cat.h')}</b><button class="link" data-pall="${ctx}">${T('cat.all')}</button></div>` + cats.map((c, ci) => {
      const ts = list.filter(t => catKey(t) === c), on = ts.filter(t => !offL.includes(t.id)).length, open = openCat[ctx] === c;
      return `<div class="cat ${open ? 'open' : ''}" style="--h:${HUES[ci % HUES.length]}">
        <div class="catrow"><button class="cbtn" data-cat="${esc(c)}" data-ctx="${ctx}" aria-expanded="${open}"><span class="dotc"></span><span class="cn">${esc(catLabel(c))}</span><span class="cc">${on}/${ts.length}</span><span class="chev">›</span></button>
        <button class="sw ${on === ts.length ? 'on' : on ? 'part' : ''}" data-csw="${esc(c)}" data-ctx="${ctx}" role="switch" aria-checked="${on === ts.length}" title="${T('cat.sw')}"></button></div>
        ${open ? `<div class="catbody">${ts.map(t => { const s = stats[t.theme]; return `<button class="trow ${offL.includes(t.id) ? '' : 'on'}" data-tid="${esc(t.id)}" data-ctx="${ctx}"><span class="ck"></span><span class="tn">${esc(t.theme)}</span>${scores && s && s.t ? `<small>${s.c}/${s.t}</small>` : ''}</button>`; }).join('')}</div>` : ''}
      </div>`;
    }).join('');
  }
  function pickerClick(b) { // returns true when the click belonged to the picker
    const ctx = b.dataset.ctx || b.dataset.pall; if (!ctx) return false;
    const curOff = getOff(ctx), ids = inExam().map(t => t.id);
    const turn = (list, on) => setOff(ctx, on ? curOff.filter(id => !list.includes(id)) : [...new Set(curOff.concat(list))]);
    if (b.dataset.pall) turn(ids, ids.some(id => curOff.includes(id)));
    else if (b.dataset.cat != null) openCat[ctx] = openCat[ctx] === b.dataset.cat ? null : b.dataset.cat;
    else if (b.dataset.csw != null) { const l = inExam().filter(t => catKey(t) === b.dataset.csw).map(t => t.id); turn(l, l.some(id => curOff.includes(id))); }
    else if (b.dataset.tid) turn([b.dataset.tid], curOff.includes(b.dataset.tid));
    else return false;
    return true;
  }

  /* ================= practice ================= */
  let cur = null; // {tpl, q, choices, done, user, raw} | {tpl, err}
  function renderPractice() {
    $('#pexams').innerHTML = examsHTML();
    $('#cats').innerHTML = pickerHTML('p', true);
    $('#ptool').innerHTML = `${modeSeg()}<span class="scorepill">${T('session', session.c, session.t)}</span><button class="link" id="resetStats">${T('resetScores')}</button>`;
  }
  let firstId = null; // shown first after an AI import
  function nextQuestion(same) {
    let tpl = same && cur ? templates.find(t => t.id === cur.tpl.id) : firstId ? templates.find(t => t.id === firstId) : null;
    firstId = null;
    if (!tpl) {
      let pool = inExam().filter(t => !off.includes(t.id));
      if (pool.length > 1 && cur) pool = pool.filter(t => t.id !== cur.tpl.id);
      tpl = pool[Math.random() * pool.length | 0];
    }
    if (!tpl) cur = null;
    else try { const q = generate(tpl); cur = { tpl, q, choices: mcChoices(q), done: false, user: null, raw: '' }; }
    catch (e) { cur = { tpl, err: e.message }; }
    renderCard();
    const top = $('#card').getBoundingClientRect().top; // bring a new question into view if we were scrolled down to the last solution
    if (top < 70) window.scrollBy(0, top - 80);
  }
  function renderCard() {
    const box = $('#card');
    if (!cur) { box.innerHTML = `<p class="mut">${T('noTopics')}</p>`; return; }
    if (cur.err) { box.innerHTML = `${headHTML(cur.tpl)}<div class="alert">${T('tplProblem')}${esc(cur.err)}</div><div class="actions"><button class="primary" id="next">${T('next')}</button></div>`; return; }
    const { tpl, q, choices, done, user, raw } = cur, right = isRight(q, user);
    box.innerHTML = `${headHTML(tpl)}<div class="q">${questionHTML(tpl, q)}</div>${answerHTML(tpl, q, choices, user, raw, true, done)}` +
      (!done ? `<div class="actions"><button class="link" id="giveup">${T('giveup')}</button></div>` :
        (user == null ? '' : `<div class="verdict ${right ? 'ok' : 'ng'}">${right ? T('ok') : T('ng', fmt(user))}</div>`) + solutionHTML(tpl, q) +
        `<div class="actions"><button class="primary big" id="next">${T('next')}</button><button class="secondary big" id="again">${T('again')}</button></div>`);
    // focus without scrolling, so the question stays where it is when the solution appears
    if (done) $('#next').focus({ preventScroll: true }); else { const a = $('#card .ans'); if (a) a.focus({ preventScroll: true }); }
  }
  function finish(userVal) { // number, or null when the answer was just revealed
    if (!cur || cur.done || cur.err) return;
    cur.done = true; cur.user = userVal;
    if (userVal != null) { const r = isRight(cur.q, userVal); record(cur.tpl.theme, r); session.t++; if (r) session.c++; }
    renderCard(); renderPractice();
  }
  $('#practice').addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.exam != null) { setExam(t.dataset.exam); renderPractice(); nextQuestion(false); }
    else if (pickerClick(t)) { renderPractice(); if (!cur) nextQuestion(false); }
    else if (t.dataset.mode) { setMode(t.dataset.mode); renderPractice(); renderCard(); }
    else if (t.id === 'next') nextQuestion(false);
    else if (t.id === 'again') nextQuestion(true);
    else if (t.id === 'giveup') finish(null);
    else if (t.dataset.v != null) finish(+t.dataset.v);
    else if (t.id === 'resetStats' && confirm(T('confirmReset'))) { stats = {}; session.c = session.t = 0; LS.set('stats', stats); renderPractice(); }
  });
  $('#practice').addEventListener('input', e => { if (e.target.classList.contains('ans') && cur) cur.raw = e.target.value; });
  $('#practice').addEventListener('submit', e => { e.preventDefault(); const v = toNum($('#card .ans').value); if (!isNaN(v)) finish(v); });
  document.addEventListener('keydown', e => { // 1–5 picks a choice in 5択 practice
    if (curTab !== 'practice' || !mc || !cur || cur.done || cur.err || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    const k = +e.key; if (k >= 1 && k <= cur.choices.length) finish(cur.choices[k - 1]);
  });

  /* ================= test maker ================= */
  let test = null, testN = LS.get('testN', 10), clock = null;
  const el = $('#test');
  function buildTest(tpls, n) {
    const pool = shuffle(tpls.slice()), items = [];
    for (let i = 0, tries = 0; items.length < n && tries < n * 4; i++, tries++) {
      const tpl = pool[i % pool.length];
      try { const q = generate(tpl); items.push({ tpl, q, choices: mcChoices(q), ans: null, raw: '' }); } catch { /* skip broken template */ }
    }
    if (!items.length) return;
    test = { items: shuffle(items), i: 0, start: Date.now(), done: false, secs: 0 };
    clearInterval(clock);
    clock = setInterval(() => { const c = $('#clock'); if (c && test && !test.done) c.textContent = fmtTime(Math.round((Date.now() - test.start) / 1000)); }, 1000);
  }
  function renderTest() {
    if (!test) return renderSetup();
    if (test.done) return renderResult();
    const { items, i } = test, it = items[i], last = i === items.length - 1;
    el.innerHTML = `<div class="tbar"><span>${T('qof', i + 1, items.length)}</span><span id="clock">${fmtTime(Math.round((Date.now() - test.start) / 1000))}</span></div>
      <div class="prog"><i style="width:${(i + 1) / items.length * 100}%"></i></div>
      <article class="card qcard">${headHTML(it.tpl)}<div class="q">${questionHTML(it.tpl, it.q)}</div>${answerHTML(it.tpl, it.q, it.choices, it.ans, it.raw, false, false)}</article>
      <div class="actions"><button class="secondary big" data-act="prev" ${i ? '' : 'disabled'}>${T('back')}</button>${last ? `<button class="primary big" data-act="finish">${T('finish')}</button>` : `<button class="primary big" data-act="tnext">${T('tnext')}</button>`}</div>
      <div class="dots">${items.map((x, k) => `<button class="dot ${k === i ? 'cur' : ''} ${x.ans != null ? 'done' : ''}" data-go="${k}" title="${T('goto', k + 1)}">${k + 1}</button>`).join('')}</div>
      <div class="actions">${last ? '' : `<button class="link" data-act="finish">${T('finishNow')}</button>`}<button class="link" data-act="quit">${T('quit')}</button></div>`;
    const a = $('.ans', el); if (a) a.focus();
  }
  function renderSetup() {
    const n = inExam().filter(t => !testOff.includes(t.id)).length;
    el.innerHTML = `<div class="hero"><h1>${T('test.h')}</h1><p>${T('test.p')}</p></div>
      <div class="card setup">
        <div class="sblock"><div class="lab"><span>1</span>${T('test.s0')}</div>${examsHTML()}</div>
        <div class="sblock"><div class="lab"><span>2</span>${T('test.s1')}</div><div class="cats">${pickerHTML('t', false)}</div></div>
        <div class="sblock"><div class="lab"><span>3</span>${T('test.s2')}</div>
          <div class="stepper"><button data-act="minus" aria-label="−">−</button><input id="tn" inputmode="numeric" value="${testN}"><button data-act="plus" aria-label="+">＋</button></div>
          <div class="presets">${[5, 10, 20, 30].map(x => `<button class="sm ${x === testN ? 'secondary' : ''}" data-n="${x}">${x}</button>`).join('')}</div></div>
        <div class="sblock"><div class="lab"><span>4</span>${T('test.s3')}</div>${modeSeg()}</div>
        <button class="primary big" data-act="start" ${n ? '' : 'disabled'}>${T('test.start')}</button>
        ${n ? '' : `<div class="mut">${T('test.none')}</div>`}
      </div>`;
  }
  function renderResult() {
    const { items, secs } = test, c = items.filter(x => x.ok).length, wrong = items.length - c, pct = Math.round(c / items.length * 100);
    el.innerHTML = `<div class="card result"><div class="ring" style="--p:${pct}"><b>${pct}%</b></div><h2>${T('correct', c, items.length)}</h2>
        <p class="mut">${T('timeLine', fmtTime(secs), Math.round(secs / items.length))}</p>
        <div class="actions">${wrong ? `<button class="primary big" data-act="retry">${T('retry', wrong)}</button>` : ''}<button class="${wrong ? 'secondary' : 'primary'} big" data-act="newtest">${T('newtest')}</button></div></div>
      <h3 class="revh">${T('review')}</h3>` +
      items.map((x, k) => `<details class="card rev ${x.ok ? 'ok' : 'ng'}" ${x.ok ? '' : 'open'}><summary><span class="mark">${x.ok ? '○' : '×'}</span><span class="rt">Q${k + 1} · ${esc(x.tpl.theme)}</span>
        <span class="ra">${T('yourAns')}${x.ans == null ? '—' : fmt(x.ans)}${x.ok ? '' : '<br>' + T('correctAns') + fmt(x.q.answer, x.q.format) + ' ' + esc(x.tpl.unit || '')}</span></summary>
        <div class="body"><div class="q">${questionHTML(x.tpl, x.q)}</div>${solutionHTML(x.tpl, x.q)}</div></details>`).join('');
  }
  function finishTest() {
    const blank = test.items.filter(x => x.ans == null).length;
    if (blank && !confirm(T('unanswered', blank))) return;
    test.done = true; test.secs = Math.round((Date.now() - test.start) / 1000); clearInterval(clock);
    for (const x of test.items) { x.ok = isRight(x.q, x.ans); record(x.tpl.theme, x.ok); }
    renderTest(); window.scrollTo(0, 0);
  }
  const setN = v => { testN = Math.min(100, Math.max(1, Math.round(v) || 1)); LS.set('testN', testN); };
  el.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    const act = t.dataset.act;
    if (t.dataset.exam != null) { setExam(t.dataset.exam); renderSetup(); }
    else if (pickerClick(t)) renderSetup();
    else if (t.dataset.n) { setN(+t.dataset.n); renderSetup(); }
    else if (act === 'minus' || act === 'plus') { setN(testN + (act === 'plus' ? 1 : -1)); renderSetup(); }
    else if (t.dataset.mode) { setMode(t.dataset.mode); renderTest(); }
    else if (act === 'start') { setN(toNum($('#tn').value)); buildTest(inExam().filter(x => !testOff.includes(x.id)), testN); renderTest(); }
    else if (act === 'prev') { test.i--; renderTest(); }
    else if (act === 'tnext') { test.i++; renderTest(); }
    else if (t.dataset.go != null) { test.i = +t.dataset.go; renderTest(); }
    else if (t.dataset.v != null) { test.items[test.i].ans = +t.dataset.v; renderTest(); }
    else if (act === 'finish') finishTest();
    else if (act === 'quit') { if (confirm(T('quitConfirm'))) { test = null; clearInterval(clock); renderTest(); } }
    else if (act === 'newtest') { test = null; renderTest(); }
    else if (act === 'retry') { const w = test.items.filter(x => !x.ok); buildTest(w.map(x => x.tpl), w.length); renderTest(); }
  });
  el.addEventListener('input', e => {
    if (e.target.id === 'tn') { const v = toNum(e.target.value); if (!isNaN(v)) setN(v); return; }
    if (!e.target.classList.contains('ans') || !test) return;
    const it = test.items[test.i], v = toNum(e.target.value);
    it.raw = e.target.value; it.ans = isNaN(v) ? null : v;
    const d = $('.dot.cur', el); if (d) d.classList.toggle('done', it.ans != null);
  });
  el.addEventListener('submit', e => { e.preventDefault(); if (test.i < test.items.length - 1) { test.i++; renderTest(); } else finishTest(); });

  /* ================= AI import ================= */
  let impText = '', impItems = null, impMsg = '';
  const imp = $('#import');
  function buildPrompt() {
    const F = '```', byExam = {};
    for (const t of templates) ((byExam[t.exam] = byExam[t.exam] || {})[t.category || '-'] = byExam[t.exam][t.category || '-'] || []).push(`${t.theme} [${t.id}]`);
    const existing = Object.entries(byExam).map(([e, cats]) => `- Exam "${e}"\n` + Object.entries(cats).map(([c, l]) => `  - Category "${c}": ${l.join(', ')}`).join('\n')).join('\n') || '(none yet)';
    const ex = ['stock-per', 'stock-ukewatashi-buy'].map(id => (window.BUILTIN_TEMPLATES || []).find(t => t.id === id)).filter(Boolean).map(b => {
      const o = { id: b.id, exam: b.exam, category: b.category, theme: b.theme, unit: b.unit, text: String(b.text).split('\n'), vars: b.vars, steps: b.steps };
      if (b.condition) o.condition = b.condition;
      return o;
    });
    const json = JSON.stringify(ex, null, 2).replace(/\{\n([^{}[\]]*?)\n\s*\}/g, (m, inner) => '{ ' + inner.trim().split(/\n\s*/).join(' ') + ' }');
    return `You are helping me add a new calculation-question type to my exam practice app (a drill for the Japanese 証券外務員 exam and similar exams).
The app stores each question type as a JSON "template". Every time I practise, it picks new random numbers, calculates the answer with the template's formula steps, and shows the solution step by step.

YOUR TASK: convert the question I paste at the end into template(s).
- Reply with ONE ${F}json code block containing a JSON ARRAY of templates, and nothing else. No comments inside the JSON.
- If my input contains several different kinds of question, make one template per kind. The same kind with different numbers = one template.

TEMPLATE FIELDS
- "id": short unique id: lowercase English letters, digits and hyphens (e.g. "bond-yield-simple"). Do NOT reuse an id from the existing list below unless I ask you to update that template.
- "exam": exam name. Use one from the existing list if it fits.
- "category": chapter / group inside the exam (e.g. 株式, 債券, 投資信託, 税制). Reuse an existing category when it fits; otherwise make a short new one in Japanese.
- "theme": topic name shown as the question title (e.g. "PER", "最終利回り"). Keep it short.
- "unit": unit of the answer ("円", "%", "倍", "年", "株" …), or "".
- "text": the question as an ARRAY OF LINES, in Japanese, worded like the original. Put {name} where a changing number goes (name = a var or step name). Numbers fixed by rules or law (消費税10%, 額面100円につき, 365日 …) stay as plain text. Keep the rounding instruction (e.g. 小数第3位以下を切り捨てる). A line starting with "|" is a table row with cells separated by "|"; the first row of a table is its header.
- "vars": the random input numbers. Each is
    {"name": …, "min": …, "max": …, "step": …, "format": "plain" or "jp"}
  or, to pick from a fixed list, {"name": …, "choices": [1.2, 1.5, 2], "format": "plain"}.
  name: Japanese or English; letters, kanji, digits and _ only (no spaces, no symbols). Choose realistic ranges around the original values and a step that gives clean numbers (prices 10, share counts 100 or 1000, rates 0.1 …). Store values in base units (3億6,000万円 → 360000000) and use "format": "jp" for big yen amounts and share counts so they display as 3億6,000万. If the original states amounts in 百万円 or 億円 units, you may keep that unit in the text and store the small number.
- "steps": the calculation, in order. Each is {"name": …, "expr": …, "round": "none", "decimals": 0, "format": "plain", "label": "…", "note": "…"} (label and note are optional).
  A step may use vars and EARLIER steps by name. The LAST step is the answer. Split the work into the intermediate steps a student would write, because every step is shown in the solution.
  round: "none" | "floor" (切り捨て) | "round" (四捨五入) | "ceil" (切り上げ). decimals = decimal places KEPT. Examples: 小数第3位以下を切り捨て → "floor", 2 · 小数点第2位以下を切り捨て → "floor", 1 · 円未満切り捨て → "floor", 0. Round intermediate steps only where the exam does.
  format: "plain" (1,000) | "jp" (3億6,000万) | "pct" (shows a fraction as a percentage: 0.20315 → 20.315%). pct is display only — when a percentage answer must be rounded, compute it ×100 instead (like the examples).
  label: heading shown in the solution instead of the name. Any characters, e.g. "1株当たり取得価額（総平均法）".
  note: one short sentence shown under the step that explains WHY — the rule, which bracket applies, what is excluded.
- "condition" (optional): an expression that must be true, otherwise the numbers are re-rolled. Use it to avoid unrealistic or negative results (e.g. "売却価格 > 購入価格", "約定代金 > 1000000 and 約定代金 <= 30000000").

MAKE THE SOLUTION EXPLAIN ITSELF
The app shows each step as: label (or name) = formula with names / = the same with numbers / = result, then the note. So:
- Keep names short and clean, because they appear inside formulas. Put long descriptions in "label", and the rule or reasoning in "note".
- Write formulas the way the textbook does (e.g. 固定費 ÷ 限界利益率, 損益分岐点 ÷ 売上高 × 100), so the solution matches what the student learns.
- Use min(a, b, c, d) / max(…) with several arguments instead of nesting them.
- Don't add steps that only copy a number. Exception: a value the student must notice is NOT used — add it as a step whose label starts with "参考：" and whose note says why it is excluded.

EXPRESSION SYNTAX (expr and condition)
Numbers, names, + - * / (× ÷ also work), parentheses, percent literals (10%, 0.575%), floor() ceil() round() abs() min() max() (min/max take any number of arguments), comparisons > < >= <= == !=, "and", "or", and if(condition, valueIfTrue, valueIfFalse) for fee tables and brackets (nest if() for 3 or more rows). Nothing else: no ^, no other functions, no strings.

CHECK BEFORE ANSWERING
1. Every {name} in "text" is a var or step name, and every name used in an expression exists. Names use only letters, kanji, kana, digits and _, and don't start with a digit.
2. With the ORIGINAL question's numbers, your steps give the original answer (when the answer is known).
3. The JSON is valid: double quotes, no trailing commas, no comments.

EXISTING EXAMS, CATEGORIES AND QUESTION TYPES [id]
${existing}

EXAMPLE OUTPUT (two existing templates)
${F}json
${json}
${F}

THE QUESTION TO CONVERT:
`;
  }
  function extractTemplates(text) { // accepts the AI reply (code fences, extra prose) or an exported file
    const blocks = [...text.matchAll(/```[a-zA-Z]*[^\S\n]*\n?([\s\S]*?)```/g)].map(m => m[1]);
    const out = []; let lastErr = null;
    for (const s of blocks.length ? blocks : [text]) {
      const a = s.search(/[[{]/), b = Math.max(s.lastIndexOf(']'), s.lastIndexOf('}'));
      if (a < 0 || b <= a) continue;
      const body = s.slice(a, b + 1);
      let data;
      try { data = JSON.parse(body); }
      catch (e) { try { data = JSON.parse(body.replace(/[“”]/g, '"').replace(/,\s*([\]}])/g, '$1')); } catch { lastErr = e; continue; } }
      if (!Array.isArray(data)) data = data && Array.isArray(data.templates) ? data.templates : [data];
      out.push(...data);
    }
    if (!out.length && lastErr) throw lastErr;
    return out;
  }
  function normalizeImported(o, i) {
    if (!o || typeof o !== 'object' || Array.isArray(o)) throw new Error(T('imp.notObj'));
    const str = v => v == null ? '' : String(v).trim();
    const fmtOf = v => v === 'jp' || v === 'pct' ? v : 'plain';
    return {
      id: str(o.id).replace(/\s+/g, '-') || 'ai-' + Date.now().toString(36) + i,
      exam: str(o.exam) || exam, category: str(o.category || o.title), theme: str(o.theme || o.topic), unit: str(o.unit),
      text: Array.isArray(o.text) ? o.text.join('\n') : String(o.text || ''), condition: str(o.condition),
      vars: (Array.isArray(o.vars) ? o.vars : []).map(v => ({ name: str(v.name), min: v.min ?? '', max: v.max ?? '', step: v.step ?? 1, choices: Array.isArray(v.choices) ? v.choices.join(', ') : str(v.choices), format: fmtOf(v.format) })),
      steps: (Array.isArray(o.steps) ? o.steps : []).map(s => ({ name: str(s.name), expr: str(s.expr || s.formula), round: ['floor', 'round', 'ceil'].includes(s.round) ? s.round : 'none', decimals: +s.decimals || 0, format: fmtOf(s.format), ...(str(s.label) && { label: str(s.label) }), ...(str(s.note) && { note: str(s.note) }) })),
    };
  }
  function runCheck() {
    impMsg = ''; impItems = null;
    if (!impText.trim()) return;
    let list;
    try { list = extractTemplates(impText); } catch (e) { impMsg = `<div class="alert">${T('imp.parse')}${esc(e.message)}</div>`; return; }
    if (!list.length) { impMsg = `<div class="alert">${T('imp.none')}</div>`; return; }
    impItems = list.map((o, i) => {
      let t = null, q = null, err = null;
      try { t = normalizeImported(o, i); q = validate(t, true); } catch (e) { err = e.message; }
      if (!t) t = { id: '', theme: String(o && o.theme || '?'), exam: '', category: '' };
      return { t, q, err, include: !err, exists: templates.some(x => x.id === t.id) };
    });
  }
  function impOutHTML() {
    if (!impItems) return impMsg;
    const n = impItems.filter(x => x.include && !x.err).length;
    return `<div class="impsum">${T('imp.found', impItems.length)}</div>` + impItems.map((x, i) => `<div class="card impitem ${x.err ? 'bad' : ''}">
        <div class="ih"><input type="checkbox" data-inc="${i}" ${x.include ? 'checked' : ''} ${x.err ? 'disabled' : ''}><b>${esc(x.t.theme || '?')}</b>
          ${x.t.exam ? `<span class="badge">${esc(x.t.exam)} › ${esc(catLabel(x.t.category))}</span>` : ''}${x.err ? '' : `<span class="badge ${x.exists ? 'upd' : 'new'}">${T(x.exists ? 'imp.update' : 'imp.new')}</span>`}</div>
        ${x.err ? `<div class="alert">${T('imp.skip')}\n${esc(x.err)}</div>` : `<div class="pv">${headHTML(x.t)}<div class="q">${questionHTML(x.t, x.q)}</div>${solutionHTML(x.t, x.q)}</div>`}
      </div>`).join('') +
      `<div class="actions"><button class="secondary big" data-act="reroll">${T('roll')}</button><button class="primary big" data-act="add" ${n ? '' : 'disabled'}>${T('imp.add', n)}</button></div>`;
  }
  function renderImport() {
    imp.innerHTML = `<div class="hero"><h1>${T('imp.h')}</h1><p>${T('imp.p')}</p></div>
      <div class="card istep"><div class="lab"><span>1</span>${T('imp.s1')}</div><p class="mut">${T('imp.s1d')}</p>
        <div class="actions"><button class="primary big" data-act="copy">${T('imp.copy')}</button></div>
        <details class="help"><summary>${T('imp.show')}</summary><textarea class="prompt" readonly>${esc(buildPrompt())}</textarea></details></div>
      <div class="card istep"><div class="lab"><span>2</span>${T('imp.s2')}</div><p class="mut">${T('imp.s2d')}</p></div>
      <div class="card istep"><div class="lab"><span>3</span>${T('imp.s3')}</div><p class="mut">${T('imp.s3d')}</p>
        <textarea id="paste" class="paste" spellcheck="false" placeholder="${T('imp.ph')}">${esc(impText)}</textarea>
        <div class="actions"><button class="primary big" data-act="check">${T('imp.check')}</button><button class="secondary big" data-act="file">${T('imp.file')}</button><button class="link" data-act="clear">${T('imp.clear')}</button></div>
        <input type="file" id="impFile" accept=".json,.txt,.md,.js" hidden></div>
      <div id="impOut">${impOutHTML()}</div>`;
  }
  const refreshImpOut = () => { $('#impOut').innerHTML = impOutHTML(); };
  async function copyText(s) {
    try { await navigator.clipboard.writeText(s); return true; }
    catch { const ta = document.createElement('textarea'); ta.value = s; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch { /* ignore */ } ta.remove(); return ok; }
  }
  const loadFile = f => f.text().then(txt => { impText = txt; $('#paste').value = txt; runCheck(); refreshImpOut(); });
  imp.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    const act = b.dataset.act;
    if (act === 'copy') { const ok = await copyText(buildPrompt()); b.textContent = T(ok ? 'imp.copied' : 'imp.copyFail'); setTimeout(() => { b.textContent = T('imp.copy'); }, 2500); }
    else if (act === 'check') { runCheck(); refreshImpOut(); $('#impOut').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else if (act === 'file') $('#impFile').click();
    else if (act === 'clear') { impText = ''; impItems = null; impMsg = ''; renderImport(); }
    else if (act === 'reroll') { impItems.forEach(x => { if (!x.err) try { x.q = generate(x.t); } catch { /* keep old sample */ } }); refreshImpOut(); }
    else if (act === 'add') {
      const sel = impItems.filter(x => x.include && !x.err);
      for (const x of sel) { const i = templates.findIndex(t => t.id === x.t.id); if (i >= 0) templates[i] = x.t; else templates.push(x.t); }
      saveTemplates();
      setExam(sel[0].t.exam); openCat.p = catKey(sel[0].t); cur = null; firstId = sel[0].t.id;
      impText = ''; impItems = null;
      impMsg = `<div class="okmsg">${T('imp.added', sel.length)}</div><div class="actions"><button class="primary big" data-act="go">${T('imp.go')}</button></div>`;
      renderImport();
    }
    else if (act === 'go') { impMsg = ''; showTab('practice'); }
  });
  imp.addEventListener('input', e => { if (e.target.id === 'paste') impText = e.target.value; });
  imp.addEventListener('change', e => {
    if (e.target.dataset.inc != null) { impItems[+e.target.dataset.inc].include = e.target.checked; refreshImpOut(); }
    else if (e.target.id === 'impFile' && e.target.files[0]) loadFile(e.target.files[0]);
  });
  imp.addEventListener('dragover', e => { if (e.target.id === 'paste' && e.dataTransfer.types.includes('Files')) { e.preventDefault(); e.target.classList.add('drop'); } });
  imp.addEventListener('dragleave', e => { if (e.target.id === 'paste') e.target.classList.remove('drop'); });
  imp.addEventListener('drop', e => { if (e.target.id === 'paste' && e.dataTransfer.files[0]) { e.preventDefault(); e.target.classList.remove('drop'); loadFile(e.dataTransfer.files[0]); } });

  /* ================= formula sheet ================= */
  function renderSheet() {
    const list = inExam();
    $('#sheet').innerHTML = `<div class="hero"><h1>${T('sheet.h')}</h1><p>${T('sheet.p', esc(exam))}</p></div>` + catsOf(list).map(c => `<h2 class="sgh">${esc(catLabel(c))}</h2><div class="sheetgrid">` +
      list.filter(t => catKey(t) === c).map(t => {
        let body;
        try { body = t.steps.map(s => `<div class="step"><span class="f">${esc(s.label || s.name)} = ${esc(rd(parse(s.expr), null, {}, true).s)}</span>${s.round && s.round !== 'none' ? `<div class="note">${roundLabel(s.round, +s.decimals || 0)}</div>` : ''}${s.note ? `<div class="why">${esc(s.note)}</div>` : ''}</div>`).join(''); }
        catch (e) { body = `<div class="alert">${esc(e.message)}</div>`; }
        return `<div class="card"><h3>${esc(t.theme)}</h3>${body}</div>`;
      }).join('') + '</div>').join('');
  }

  /* ================= template editor ================= */
  const blank = () => ({ id: '', exam, category: '', theme: '', text: '', unit: '', condition: '', vars: [{ name: '', min: 1, max: 10, step: 1, choices: '', format: 'plain' }], steps: [{ name: '', expr: '', round: 'none', decimals: 0, format: 'plain', label: '', note: '' }] });
  let draft = blank(), lastFocus = null, savedRange = null, dragSrc = null, msg = '', pvTimer = null;
  const ed = $('#editor');
  const allNames = () => [...draft.vars, ...draft.steps].map(x => String(x.name).trim());
  const hueAt = i => HUES[i % HUES.length];
  const opt = (v, cur, label) => `<option value="${v}" ${(cur || '') === v || (!cur && (v === 'plain' || v === 'none')) ? 'selected' : ''}>${label}</option>`;
  const inp = (k, v, ph, extra = '') => `<input data-k="${k}" value="${esc(v)}" placeholder="${esc(ph)}" ${extra}>`;
  function pillHTML(name) { // a coloured bubble for a number / step name
    const i = allNames().indexOf(name), isStep = i >= draft.vars.length;
    return `<span class="pill ${i < 0 ? 'unk' : ''} ${isStep ? 'fx' : ''}" style="--h:${i < 0 ? 0 : hueAt(i)}" contenteditable="false" draggable="true" data-n="${esc(name)}"${i < 0 ? ` title="${T('ed.unk')}"` : ''}>${esc(name)}</span>`;
  }
  const textToHTML = t => String(t).split(/(\{[^}\n]+\})/).map(p => /^\{[^}\n]+\}$/.test(p) ? pillHTML(p.slice(1, -1).trim()) : esc(p).replace(/\n/g, '<br>')).join('');
  function richText(node = $('#qrich')) {
    let s = '';
    node.childNodes.forEach(n => {
      if (n.nodeType === 3) s += n.textContent.replace(/ /g, ' ');
      else if (n.nodeName === 'BR') s += '\n';
      else if (n.classList && n.classList.contains('pill')) s += '{' + n.dataset.n + '}';
      else if (n.nodeType === 1) { if (s && !s.endsWith('\n')) s += '\n'; s += richText(n); if (!s.endsWith('\n')) s += '\n'; }
    });
    return s;
  }
  function tail() { const rt = $('#qrich'), l = rt.lastChild; if (l && l.nodeType === 1 && l.classList.contains('pill')) rt.appendChild(document.createElement('br')); }
  function renderRich() { const rt = $('#qrich'); if (!rt) return; rt.innerHTML = textToHTML(draft.text); tail(); }
  function syncRich() { tail(); draft.text = richText().replace(/\n+$/, ''); schedulePreview(); }
  function insertPill(name, range) {
    const rt = $('#qrich');
    if (!range || !rt.contains(range.startContainer)) {
      range = document.createRange(); range.selectNodeContents(rt); range.collapse(false);
      if (rt.lastChild && rt.lastChild.nodeName === 'BR') { range.setStartBefore(rt.lastChild); range.collapse(true); }
    }
    const inside = (range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentNode).closest('.pill');
    if (inside) { range.setStartAfter(inside); range.collapse(true); }
    range.deleteContents();
    const tmp = document.createElement('div'); tmp.innerHTML = pillHTML(name);
    const pill = tmp.firstChild; range.insertNode(pill);
    const r = document.createRange(); r.setStartAfter(pill); r.collapse(true);
    rt.focus(); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
    syncRich();
  }
  function rangeAt(x, y) {
    if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(x, y); if (!p) return null; const r = document.createRange(); r.setStart(p.offsetNode, p.offset); r.collapse(true); return r; }
    return document.caretRangeFromPoint ? document.caretRangeFromPoint(x, y) : null;
  }
  function tplListHTML() {
    let html = '', last = null;
    for (const e of exams()) for (const c of catsOf(templates.filter(t => t.exam === e))) {
      const g = `${e} › ${catLabel(c)}`;
      if (g !== last) { html += `<div class="gh">${esc(g)}</div>`; last = g; }
      html += templates.filter(t => t.exam === e && catKey(t) === c).map(t => `<button class="${t.id === draft.id ? 'on' : ''}" data-act="open" data-id="${esc(t.id)}">${esc(t.theme)}</button>`).join('');
    }
    return html;
  }

  function renderEditor() {
    const d = draft, nv = d.vars.length;
    ed.innerHTML = `
<aside class="tl card">
  <button class="primary" data-act="new">${T('ed.new')}</button>
  <div class="tlist">${tplListHTML()}</div>
  <div class="io"><button class="secondary sm" data-act="export">${T('ed.export')}</button><button class="secondary sm" data-act="import">${T('ed.import')}</button></div>
  <div class="hint">${T('ed.savedHint')}</div>
</aside>
<div class="center">
  <div class="card">
    <h2 class="ct">${T(d.id ? 'ed.editT' : 'ed.newT')}</h2>
    <div class="grid2">
      <div class="field"><label>${T('ed.topic')}</label>${inp('theme', d.theme, 'PER')}</div>
      <div class="field"><label>${T('ed.unit')}</label>${inp('unit', d.unit, '倍 / % / 円')}</div>
      <div class="field"><label>${T('ed.exam')}</label>${inp('exam', d.exam, DEFAULT_EXAM, 'list="dlExam"')}</div>
      <div class="field"><label>${T('ed.cat')}</label>${inp('category', d.category, '株式', 'list="dlCat"')}</div>
    </div>
    <datalist id="dlExam">${exams().map(e => `<option value="${esc(e)}">`).join('')}</datalist>
    <datalist id="dlCat">${[...new Set(templates.map(catKey).filter(Boolean))].map(c => `<option value="${esc(c)}">`).join('')}</datalist>
    <div class="field"><label>${T('ed.question')}</label>
      <div id="qrich" class="rich" contenteditable="true" spellcheck="false" data-ph="${T('ed.qph')}"></div>
      <div class="hint">${T('ed.qhint')}</div></div>
    <div class="field"><label>${T('ed.rule')}<span class="opt-tag">${T('ed.optional')}</span></label>${inp('condition', d.condition, T('ed.rulePh'), 'data-ins="expr"')}
      <div class="hint">${T('ed.ruleHint')}</div></div>
    <div class="actions"><button class="primary big" data-act="save">${T('ed.save')}</button><button class="secondary big" data-act="dup">${T('ed.dup')}</button>${d.id ? `<button class="danger big" data-act="del">${T('ed.del')}</button>` : ''}</div>
    <div id="emsg">${msg}</div>
  </div>
  <div class="card pv"><div class="pvh"><span>${T('ed.preview')}</span><button class="link" data-act="roll">${T('roll')}</button></div><div id="preview"></div></div>
</div>
<aside class="side">
  <div class="card pal"><h3>${T('ed.bubbles')}<small>${T('ed.bubblesSub')}</small></h3><div id="chips"></div></div>
  <div class="card"><h3>${T('ed.numbers')}<small>${T('ed.numbersSub')}</small></h3>
    ${d.vars.map((v, i) => `<div class="vr" style="--h:${hueAt(i)}">
      <div class="vh">${inp(`vars.${i}.name`, v.name, T('ed.nameNum'))}<button class="x" data-act="rmv" data-i="${i}" title="${T('ed.remove')}">×</button></div>
      <div class="vg"><label>${T('ed.from')}${inp(`vars.${i}.min`, v.min ?? '', '')}</label><label>${T('ed.to')}${inp(`vars.${i}.max`, v.max ?? '', '')}</label><label>${T('ed.step')}${inp(`vars.${i}.step`, v.step ?? '', '')}</label>
        <label>${T('ed.showAs')}<select data-k="vars.${i}.format">${opt('plain', v.format, '1,000')}${opt('jp', v.format, '億/万')}${opt('pct', v.format, '%')}</select></label></div>
      <label class="wide">${T('ed.list')}${inp(`vars.${i}.choices`, v.choices ?? '', '1.2, 1.5, 2')}</label></div>`).join('')}
    <button class="secondary sm addb" data-act="addv">${T('ed.addNum')}</button></div>
  <div class="card"><h3>${T('ed.steps')}<small>${T('ed.stepsSub')}</small></h3>
    ${d.steps.map((s, i) => `<div class="vr" style="--h:${hueAt(nv + i)}">
      <div class="vh">${inp(`steps.${i}.name`, s.name, T('ed.stepName'))}<button class="x" data-act="rms" data-i="${i}" title="${T('ed.remove')}">×</button></div>
      <div class="eq">=${inp(`steps.${i}.expr`, s.expr, '株価 ÷ 1株当たり純利益', 'data-ins="expr"')}</div>
      <label class="wide">${T('ed.label')}${inp(`steps.${i}.label`, s.label ?? '', T('ed.labelPh'))}</label>
      <label class="wide">${T('ed.note')}${inp(`steps.${i}.note`, s.note ?? '', T('ed.notePh'))}</label>
      <div class="vg three"><label>${T('ed.rounding')}<select data-k="steps.${i}.round">${opt('none', s.round, T('ed.none'))}${opt('floor', s.round, '切り捨て')}${opt('round', s.round, '四捨五入')}${opt('ceil', s.round, '切り上げ')}</select></label>
        <label>${T('ed.decimals')}${inp(`steps.${i}.decimals`, s.decimals ?? 0, '')}</label>
        <label>${T('ed.showAs')}<select data-k="steps.${i}.format">${opt('plain', s.format, '1,000')}${opt('jp', s.format, '億/万')}${opt('pct', s.format, '%')}</select></label></div></div>`).join('')}
    <button class="secondary sm addb" data-act="adds">${T('ed.addStep')}</button>
    <details class="help"><summary>${T('ed.help')}</summary>${T('ed.helpHtml')}</details></div>
</aside>`;
    msg = '';
    renderChips(); renderRich(); livePreview();
  }
  function renderChips() {
    const names = allNames().filter(Boolean);
    $('#chips').innerHTML = names.map(n => pillHTML(n)).join('') || `<span class="hint">${T('ed.chipsEmpty')}</span>`;
  }
  function normalized() {
    const d = copy(draft);
    d.theme = d.theme.trim(); d.exam = String(d.exam || '').trim() || DEFAULT_EXAM; d.category = String(d.category || '').trim();
    d.vars = d.vars.filter(v => String(v.name).trim()); d.steps = d.steps.filter(s => String(s.name).trim() || String(s.expr).trim());
    d.vars.forEach(v => { v.name = v.name.trim(); });
    d.steps.forEach(s => {
      s.name = String(s.name).trim(); s.decimals = +s.decimals || 0;
      for (const k of ['label', 'note']) { s[k] = String(s[k] || '').trim(); if (!s[k]) delete s[k]; }
    });
    return d;
  }
  function validate(d, strict) { // used by the editor and by AI import
    if (strict && !d.theme) throw new Error(T('err.topic'));
    const seen = new Set();
    for (const n of [...d.vars, ...d.steps].map(x => x.name)) {
      if (!n) throw new Error(T('err.stepName'));
      if (!NAME_RE.test(n) || /^\d+(\.\d+)?$/.test(n) || n in FN || n === 'and' || n === 'or') throw new Error(T('err.name', n));
      if (seen.has(n)) throw new Error(T('err.dup', n));
      seen.add(n);
    }
    const q = generate(d);
    const unknown = [...String(d.text).matchAll(/\{([^}]+)\}/g)].map(m => m[1].trim()).filter(n => !(n in q.env));
    if (unknown.length) throw new Error(T('err.unknown', unknown.join(', ')));
    return q;
  }
  function livePreview() {
    const box = $('#preview'); if (!box) return;
    const d = normalized();
    if (!d.text.trim() || !d.steps.some(s => s.expr.trim())) { box.innerHTML = `<p class="hint">${T('ed.pvEmpty')}</p>`; return; }
    try { const q = validate(d, false); box.innerHTML = `${headHTML({ theme: d.theme || T('ed.topic'), category: d.category })}<div class="q">${questionHTML(d, q)}</div>${solutionHTML(d, q)}`; }
    catch (e) { box.innerHTML = `<div class="alert">${esc(e.message)}</div>`; }
  }
  const schedulePreview = () => { clearTimeout(pvTimer); pvTimer = setTimeout(livePreview, 250); };
  function download(name, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  ed.addEventListener('input', e => {
    if (e.target.id === 'qrich') { syncRich(); return; }
    const k = e.target.dataset.k; if (!k) return;
    const path = k.split('.'); let o = draft;
    while (path.length > 1) o = o[path.shift()];
    const old = String(o[path[0]] ?? '').trim(), now = e.target.value.trim();
    const taken = allNames().filter(n => n === old).length > 1; // another item has the old name → don't touch its bubbles
    o[path[0]] = e.target.value;
    if (/name$/.test(k)) {
      if (old && now && old !== now && !taken) { // renaming follows through to the question and the formulas
        draft.text = draft.text.split('{' + old + '}').join('{' + now + '}');
        const re = new RegExp('(?<![\\p{L}\\p{N}_])' + old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}\\p{N}_])', 'gu');
        draft.steps.forEach(s => { s.expr = String(s.expr).replace(re, now); });
        draft.condition = String(draft.condition || '').replace(re, now);
        $$('[data-ins="expr"]', ed).forEach(x => { const p = x.dataset.k.split('.'); x.value = p.length === 1 ? draft[p[0]] : draft[p[0]][p[1]][p[2]]; });
      }
      renderChips(); renderRich();
    }
    schedulePreview();
  });
  ed.addEventListener('focusin', e => { if (e.target.dataset.ins === 'expr') lastFocus = e.target; });
  ed.addEventListener('focusout', e => { // typed {tags} turn into bubbles when you leave the box
    if (e.target.id === 'qrich' && [...e.target.childNodes].some(n => n.nodeType === 3 && /\{[^}\n]+\}/.test(n.textContent))) renderRich();
  });
  document.addEventListener('selectionchange', () => {
    const rt = $('#qrich'), s = getSelection();
    if (rt && s.rangeCount && rt.contains(s.anchorNode)) { savedRange = s.getRangeAt(0).cloneRange(); lastFocus = rt; }
  });
  ed.addEventListener('keydown', e => { if (e.target.id === 'qrich' && e.key === 'Enter') { e.preventDefault(); document.execCommand('insertLineBreak'); } });
  ed.addEventListener('paste', e => { if (e.target.closest('#qrich')) { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')); } });
  ed.addEventListener('dragstart', e => {
    const p = e.target.closest && e.target.closest('.pill'); if (!p) return;
    e.dataTransfer.setData('text/plain', '{' + p.dataset.n + '}'); e.dataTransfer.setData('application/x-fqm', p.dataset.n);
    e.dataTransfer.effectAllowed = 'copyMove'; dragSrc = p.closest('#qrich') ? p : null;
  });
  ed.addEventListener('dragend', () => { dragSrc = null; const rt = $('#qrich'); if (rt) rt.classList.remove('drop'); });
  ed.addEventListener('dragover', e => {
    const rt = e.target.closest && e.target.closest('#qrich'); if (!rt) return;
    e.preventDefault(); e.dataTransfer.dropEffect = dragSrc ? 'move' : 'copy'; rt.classList.add('drop');
    const r = rangeAt(e.clientX, e.clientY); if (r) { const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
  });
  ed.addEventListener('dragleave', e => { if (e.target.id === 'qrich') e.target.classList.remove('drop'); });
  ed.addEventListener('drop', e => {
    const rt = e.target.closest && e.target.closest('#qrich'); if (!rt) return;
    e.preventDefault(); rt.classList.remove('drop');
    const name = e.dataTransfer.getData('application/x-fqm'), r = rangeAt(e.clientX, e.clientY);
    if (name) { const src = dragSrc; insertPill(name, r); if (src) { src.remove(); syncRich(); } }
    else if (r) { r.insertNode(document.createTextNode(e.dataTransfer.getData('text/plain'))); syncRich(); }
  });
  ed.addEventListener('click', e => {
    const chip = e.target.closest('#chips .pill');
    if (chip) {
      const f = lastFocus && document.contains(lastFocus) ? lastFocus : null;
      if (f && f.dataset.ins === 'expr') { f.focus(); f.setRangeText(chip.dataset.n, f.selectionStart, f.selectionEnd, 'end'); f.dispatchEvent(new Event('input', { bubbles: true })); }
      else insertPill(chip.dataset.n, savedRange);
      return;
    }
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act, i = +b.dataset.i;
    if (act === 'new') { draft = blank(); renderEditor(); }
    else if (act === 'open') { draft = Object.assign(blank(), copy(templates.find(t => t.id === b.dataset.id))); draft.condition = draft.condition || ''; renderEditor(); }
    else if (act === 'addv') { draft.vars.push(blank().vars[0]); renderEditor(); }
    else if (act === 'adds') { draft.steps.push(blank().steps[0]); renderEditor(); }
    else if (act === 'rmv') { draft.vars.splice(i, 1); renderEditor(); }
    else if (act === 'rms') { draft.steps.splice(i, 1); renderEditor(); }
    else if (act === 'roll') livePreview();
    else if (act === 'dup') { draft.id = ''; draft.theme += T('ed.copySuffix'); msg = `<div class="okmsg">${T('ed.copyMade')}</div>`; renderEditor(); }
    else if (act === 'save') {
      const d = normalized();
      try { validate(d, true); } catch (err) { $('#emsg').innerHTML = `<div class="alert">${esc(err.message)}</div>`; return; }
      if (!d.id) d.id = 't' + Date.now().toString(36);
      const idx = templates.findIndex(t => t.id === d.id);
      if (idx >= 0) templates[idx] = d; else templates.push(d);
      saveTemplates(); draft = Object.assign(blank(), copy(d));
      msg = `<div class="okmsg">${T('ed.savedOk')}</div>`; renderEditor();
    }
    else if (act === 'del') {
      if (!confirm(T('ed.delConfirm', draft.theme))) return;
      templates = templates.filter(t => t.id !== draft.id);
      if ((window.BUILTIN_TEMPLATES || []).some(t => t.id === draft.id)) { removed.push(draft.id); LS.set('removed', removed); }
      saveTemplates(); fixExam(); draft = blank(); renderEditor();
    }
    else if (act === 'export') download('quiz-templates-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(templates, null, 2));
    else if (act === 'import') showTab('import');
  });

  /* ================= tabs + language ================= */
  let curTab = 'practice';
  const RENDER = { practice: () => { renderPractice(); renderCard(); }, test: renderTest, import: renderImport, editor: renderEditor, sheet: renderSheet };
  function showTab(tab) {
    curTab = tab;
    $$('#nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    $$('main > section').forEach(s => { s.hidden = s.id !== tab; });
    fixExam(); $('#brandSub').textContent = exam;
    if (tab === 'practice' && (!cur || cur.done || cur.err || cur.tpl.exam !== exam || !templates.includes(cur.tpl))) { renderPractice(); nextQuestion(false); }
    else RENDER[tab]();
    window.scrollTo(0, 0);
  }
  function applyLang() {
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach(x => { x.textContent = T(x.dataset.i18n); });
    $$('#lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === lang));
    $$('#theme button').forEach(b => { b.title = T('theme.' + b.dataset.set); b.setAttribute('aria-label', b.title); });
  }
  $('#nav').addEventListener('click', e => { if (e.target.dataset.tab) showTab(e.target.dataset.tab); });
  $('#lang').addEventListener('click', e => {
    const l = e.target.dataset.lang; if (!l || l === lang) return;
    lang = l; LS.set('lang', l); applyLang(); RENDER[curTab]();
  });

  // Light / Night mode. 'auto' follows the system setting.
  let theme = LS.get('theme', 'auto');
  function applyTheme() {
    if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme; else delete document.documentElement.dataset.theme;
    $$('#theme button').forEach(b => { b.classList.toggle('on', b.dataset.set === theme); b.setAttribute('aria-pressed', b.dataset.set === theme); });
  }
  $('#theme').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; theme = b.dataset.set; LS.set('theme', theme); applyTheme(); });

  applyTheme();
  applyLang();
  showTab('practice');
})();
