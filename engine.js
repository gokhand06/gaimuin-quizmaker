'use strict';
/* ================= formula engine ================= */
const FN = { floor: Math.floor, ceil: Math.ceil, round: Math.round, abs: Math.abs, min: Math.min, max: Math.max, if: null };
const PREC = { '||': 1, '&&': 2, '==': 3, '!=': 3, '>': 3, '<': 3, '>=': 3, '<=': 3, '+': 4, '-': 4, '*': 5, '/': 5 };
const SYM = { '*': '×', '/': '÷', '-': '−', '>=': '≧', '<=': '≦', '==': '=', '!=': '≠', '&&': 'かつ', '||': 'または' };
const NAME_RE = /^[\p{L}\p{N}_]+$/u;
const clean = x => Number(x.toPrecision(12));

function tokenize(src) {
  let s = String(src).replace(/[{}]/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/[−－]/g, '-').replace(/＋/g, '+')
    .replace(/（/g, '(').replace(/）/g, ')').replace(/[，、]/g, ',').replace(/％/g, '%').replace(/≦/g, '<=').replace(/≧/g, '>=');
  const out = []; let m;
  while (s.length) {
    if ((m = s.match(/^\s+/))) { /* skip */ }
    else if ((m = s.match(/^\d+(?:\.\d+)?(?![\p{L}\p{N}_])/u))) out.push({ t: 'num', v: +m[0], raw: m[0] });
    else if ((m = s.match(/^[\p{L}\p{N}_]+/u))) out.push(m[0] === 'and' ? { t: 'op', v: '&&' } : m[0] === 'or' ? { t: 'op', v: '||' } : { t: 'id', v: m[0] });
    else if ((m = s.match(/^(>=|<=|==|!=|&&|\|\||[-+*\/(),<>%=])/))) out.push({ t: 'op', v: m[0] === '=' ? '==' : m[0] });
    else throw new Error('Unexpected character "' + s[0] + '" in: ' + src);
    s = s.slice(m[0].length);
  }
  return out;
}

function parse(src) {
  const tk = tokenize(src); let i = 0;
  const isOp = v => tk[i] && tk[i].t === 'op' && tk[i].v === v;
  const level = (next, ops) => () => {
    let a = next();
    while (tk[i] && tk[i].t === 'op' && ops.includes(tk[i].v)) { const op = tk[i++].v; a = { t: 'bin', op, a, b: next() }; }
    return a;
  };
  const need = v => { if (!isOp(v)) throw new Error('Missing "' + v + '" in: ' + src); i++; };
  const primary = () => {
    const t = tk[i++];
    if (!t) throw new Error('Formula is incomplete: ' + src);
    if (t.t === 'num') { if (isOp('%')) { i++; return { t: 'num', v: t.v / 100, raw: t.raw + '%' }; } return t; }
    if (t.t === 'id') {
      if (!isOp('(')) return { t: 'var', n: t.v };
      i++;
      if (!(t.v in FN)) throw new Error('Unknown function: ' + t.v);
      const args = [];
      if (!isOp(')')) { args.push(expr()); while (isOp(',')) { i++; args.push(expr()); } }
      need(')');
      if (t.v === 'if' && args.length !== 3) throw new Error('if() needs 3 parts: if(condition, a, b)');
      return { t: 'call', f: t.v, args };
    }
    if (t.v === '(') { const e = expr(); need(')'); return e; }
    throw new Error('Unexpected "' + t.v + '" in: ' + src);
  };
  const unary = () => { if (isOp('-')) { i++; return { t: 'neg', a: unary() }; } return primary(); };
  const expr = level(level(level(level(level(unary, ['*', '/']), ['+', '-']), ['>=', '<=', '==', '!=', '>', '<']), ['&&']), ['||']);
  const e = expr();
  if (i < tk.length) throw new Error('Unexpected "' + tk[i].v + '" in: ' + src);
  return e;
}

function ev(n, env) {
  switch (n.t) {
    case 'num': return n.v;
    case 'var': if (!(n.n in env)) throw new Error('Unknown name: ' + n.n); return env[n.n];
    case 'neg': return -ev(n.a, env);
    case 'call': return n.f === 'if' ? (ev(n.args[0], env) ? ev(n.args[1], env) : ev(n.args[2], env)) : FN[n.f](...n.args.map(a => ev(a, env)));
    default: {
      const a = ev(n.a, env), b = ev(n.b, env);
      switch (n.op) {
        case '+': return a + b; case '-': return a - b; case '*': return a * b; case '/': return a / b;
        case '>': return +(a > b); case '<': return +(a < b); case '>=': return +(a >= b); case '<=': return +(a <= b);
        case '==': return +(Math.abs(a - b) < 1e-9); case '!=': return +(Math.abs(a - b) >= 1e-9);
        case '&&': return +(a && b); default: return +(a || b);
      }
    }
  }
}

// Render a formula as text. names=true → with names, false → with the numbers filled in.
// When env is given, if(...) shows only the branch that was actually used.
function rd(n, env, fm, names) {
  switch (n.t) {
    case 'num': return { s: n.raw.endsWith('%') ? n.raw : fmt(n.v), p: 9 };
    case 'var': { if (names) return { s: n.n, p: 9 }; const v = env[n.n]; return { s: fmt(v, fm[n.n]), p: v < 0 ? 0 : 9 }; }
    case 'neg': { const a = rd(n.a, env, fm, names); return { s: '−' + (a.p < 9 ? '(' + a.s + ')' : a.s), p: 0 }; }
    case 'call':
      if (n.f === 'if' && env) return rd(ev(n.args[0], env) ? n.args[1] : n.args[2], env, fm, names);
      return { s: n.f + '(' + n.args.map(a => rd(a, env, fm, names).s).join(', ') + ')', p: 9 };
    default: {
      const p = PREC[n.op], a = rd(n.a, env, fm, names), b = rd(n.b, env, fm, names);
      const sa = a.p < p ? '(' + a.s + ')' : a.s;
      const sb = (b.p < p || (b.p === p && (n.op === '-' || n.op === '/'))) ? '(' + b.s + ')' : b.s;
      return { s: sa + ' ' + (SYM[n.op] || n.op) + ' ' + sb, p };
    }
  }
}

function fmt(v, format) {
  if (format === 'pct') return fmt(clean(v * 100)) + '%'; // 0.20315 → 20.315%
  if (format === 'jp' && Number.isInteger(v) && Math.abs(v) >= 10000) {
    const a = Math.abs(v), oku = Math.floor(a / 1e8), man = Math.floor((a % 1e8) / 1e4), rest = a % 1e4;
    return (v < 0 ? '−' : '') + (oku ? oku.toLocaleString('en-US') + '億' : '') + (man ? man.toLocaleString('en-US') + '万' : '') + (rest ? rest.toLocaleString('en-US') : '');
  }
  return v.toLocaleString('en-US', { maximumFractionDigits: 6 }).replace(/^-/, '−');
}
function fmtRaw(v, format) { // for unrounded intermediate results: max 4 decimals, "…" if cut
  if (format === 'pct') { const p = clean(v * 100); return Math.abs(Number(p.toFixed(4)) - p) > 1e-9 ? fmtRaw(p) + '%' : fmt(p) + '%'; }
  const r = Number(v.toFixed(4));
  return Math.abs(r - v) > 1e-9 ? r.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).replace(/^-/, '−') + '…' : fmt(v, format);
}
function roundTo(x, mode, d) {
  if (!mode || mode === 'none') return x;
  const f = 10 ** d, y = clean(x * f);
  return (mode === 'floor' ? Math.trunc(y) : mode === 'ceil' ? Math.ceil(y) : Math.round(y)) / f;
}
function roundLabel(mode, d) {
  const w = { floor: '切り捨て', round: '四捨五入', ceil: '切り上げ' }[mode];
  return d > 0 ? `小数第${d + 1}位以下${w}` : `小数点以下${w}`;
}
function sample(v) {
  const ch = String(v.choices || '').split(/[,、\s]+/).filter(x => x !== '').map(Number);
  if (ch.length) return ch[Math.random() * ch.length | 0];
  const min = +v.min, max = +v.max, step = +v.step || 1;
  if (!(max >= min)) throw new Error('Unknown range for ' + v.name + ' (min/max)');
  const n = Math.floor((max - min) / step + 1e-9);
  return clean(min + (Math.random() * (n + 1) | 0) * step);
}

// Roll numbers for a template and work out every step.
function generate(tpl) {
  if (!tpl.steps || !tpl.steps.length) throw new Error('Add at least one formula step.');
  const steps = tpl.steps.map(s => ({ s, ast: parse(s.expr) }));
  const cond = tpl.condition && tpl.condition.trim() ? parse(tpl.condition) : null;
  let lastErr = null;
  for (let k = 0; k < 500; k++) {
    const env = {}, fm = {};
    for (const v of tpl.vars || []) { env[v.name] = sample(v); fm[v.name] = v.format; }
    try {
      const out = [];
      for (const { s, ast } of steps) {
        // Later steps get the full-precision value; trimming to 12 digits here made e.g. 8500 come out as 8499.9999… → 8499.9 after 切り捨て.
        const exact = ev(ast, env), raw = clean(exact), rounded = s.round && s.round !== 'none';
        if (!isFinite(raw)) throw new Error('Division by zero in step: ' + s.name);
        const d = +s.decimals || 0, val = rounded ? roundTo(exact, s.round, d) : raw;
        out.push({ name: s.name, names: rd(ast, env, fm, true).s, nums: rd(ast, env, fm, false).s, raw, val, round: s.round, d, format: s.format, label: s.label, note: s.note });
        env[s.name] = rounded ? val : exact; fm[s.name] = s.format;
      }
      if (cond && !ev(cond, env)) continue;
      const last = out[out.length - 1];
      return { env, fm, steps: out, answer: last.val, d: last.round && last.round !== 'none' ? last.d : null, format: last.format };
    } catch (e) { if (/^Unknown/.test(e.message)) throw e; lastErr = e; }
  }
  throw new Error(lastErr ? lastErr.message : 'Could not find numbers that satisfy the condition. Widen the ranges or relax the condition.');
}

if (typeof module !== 'undefined') module.exports = { parse, generate, fmt, rd, ev };

