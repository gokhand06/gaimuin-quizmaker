// Built-in question templates. These are loaded on first run (and any new id found here
// is added on later runs). You can add templates here by hand, in the app's Templates tab,
// or with the AI Import tab.
//
// exam / category / theme : Exam → Category → Topic (theme is the question's title)
// vars : random numbers.  {name, min, max, step, choices:"1.2,1.5,2", format:"plain"|"jp"}
//        (if "choices" is filled, min/max/step are ignored; "jp" shows 3億6,000万 style)
// steps: formulas, top to bottom. The LAST step is the answer.
//        {name, expr, round:"none"|"floor"|"round"|"ceil", decimals, format}
//        expr may use + - * / ( ) × ÷, 0.7%, and floor() ceil() round() abs() min() max() if(cond, a, b)
// text : question text. {name} inserts a number. Lines starting with | become a table row.
// condition: optional. Numbers are re-rolled until it is true (e.g. 総資産 > 総負債).
window.BUILTIN_TEMPLATES = [
  {
    id: 'bond-saishu', theme: '最終利回り', exam: '証券外務員', category: '債券', unit: '%',
    text: '利率年{利率}%、残存期間{残存期間}年、購入価格{購入価格}円の利付国債の最終利回りを求めよ。\n(注)答えは小数第3位以下を切り捨てる。',
    vars: [
      { name: '利率', min: 0.5, max: 3, step: 0.1 },
      { name: '残存期間', min: 2, max: 10, step: 1 },
      { name: '購入価格', min: 95, max: 105, step: 1 },
    ],
    steps: [{ name: '最終利回り', expr: '(利率 + (100 - 購入価格) / 残存期間) / 購入価格 * 100', round: 'floor', decimals: 2 }],
    condition: '最終利回り > 0',
  },
  {
    id: 'bond-oubosha', theme: '応募者利回り', exam: '証券外務員', category: '債券', unit: '%',
    text: '発行価額額面100円につき{発行価格}円、利率年{利率}%、償還までの期間{償還期間}年の長期国債の応募者利回りを求めよ。\n(注)答えは小数第3位以下を切り捨てる。',
    vars: [
      { name: '発行価格', min: 95, max: 105, step: 1 },
      { name: '利率', min: 0.5, max: 3, step: 0.1 },
      { name: '償還期間', choices: '5,10,20' },
    ],
    steps: [{ name: '応募者利回り', expr: '(利率 + (100 - 発行価格) / 償還期間) / 発行価格 * 100', round: 'floor', decimals: 2 }],
    condition: '応募者利回り > 0',
  },
  {
    id: 'bond-shoyu', theme: '所有期間利回り', exam: '証券外務員', category: '債券', unit: '%',
    text: '利率{利率}%の10年満期の利付国債を{購入価格}円で買い付けたところ、{所有期間}年後に{売却価格}円に値上がりしたので売却した。この場合の所有期間利回りを求めよ。\n(注)答えは小数第3位以下を切り捨てる。',
    vars: [
      { name: '利率', min: 0.5, max: 3, step: 0.1 },
      { name: '購入価格', min: 97, max: 103, step: 0.5 },
      { name: '所有期間', min: 2, max: 6, step: 1 },
      { name: '売却価格', min: 98, max: 108, step: 0.5 },
    ],
    steps: [{ name: '所有期間利回り', expr: '(利率 + (売却価格 - 購入価格) / 所有期間) / 購入価格 * 100', round: 'floor', decimals: 2 }],
    condition: '売却価格 > 購入価格',
  },
  {
    id: 'bond-chokusetsu', theme: '直接利回り', exam: '証券外務員', category: '債券', unit: '%',
    text: '利率年{利率}%、償還期間{償還期間}年、購入価格{購入価格}円の利付債券の直接利回りを求めよ。\n(注)答えは小数第3位以下を切り捨てる。',
    vars: [
      { name: '利率', min: 0.5, max: 4, step: 0.1 },
      { name: '償還期間', min: 3, max: 10, step: 1 },
      { name: '購入価格', min: 95, max: 105, step: 1 },
    ],
    steps: [{ name: '直接利回り', expr: '利率 / 購入価格 * 100', round: 'floor', decimals: 2 }],
  },
  {
    id: 'bond-keika', theme: '経過利子', exam: '証券外務員', category: '債券', unit: '円',
    text: '利率年{利率}%、額面{額面}円の上場国債を取引所取引により売り付けた場合で、経過日数が{経過日数}日であるときの経過利子を求めよ。\n(注)額面100円あたりの経過利子は小数第5位以下を切り捨てること。',
    vars: [
      { name: '利率', min: 1, max: 4, step: 0.1 },
      { name: '額面', choices: '1000000,2000000,3000000,5000000', format: 'jp' },
      { name: '経過日数', min: 5, max: 150, step: 1 },
    ],
    steps: [
      { name: '額面100円あたり経過利子', expr: '利率 * 経過日数 / 365', round: 'floor', decimals: 4 },
      { name: '経過利子', expr: '額面100円あたり経過利子 * 額面 / 100', round: 'floor', decimals: 0 },
    ],
  },
  {
    id: 'bond-ukewatashi-buy', theme: '受渡代金（債券・買い）', exam: '証券外務員', category: '債券', unit: '円',
    text: '額面{額面}円の長期利付国債を取引所取引により単価{単価}円で購入したときの受渡代金を求めよ。\n(注)経過利子は{経過利子}円、委託手数料は額面100円につき{手数料_銭}銭、消費税相当額10%を考慮すること。',
    vars: [
      { name: '額面', choices: '1000000,2000000,3000000,5000000', format: 'jp' },
      { name: '単価', min: 98, max: 106, step: 0.5 },
      { name: '経過利子', min: 1000, max: 9000, step: 100 },
      { name: '手数料_銭', choices: '20,30,40,50' },
    ],
    steps: [
      { name: '約定代金', expr: '額面 * 単価 / 100' },
      { name: '委託手数料', expr: '額面 / 100 * 手数料_銭 / 100' },
      { name: '消費税', expr: '委託手数料 * 10%', round: 'floor', decimals: 0 },
      { name: '受渡代金', expr: '約定代金 + 経過利子 + 委託手数料 + 消費税' },
    ],
  },
  {
    id: 'bond-ukewatashi-sell', theme: '受渡代金（債券・売り）', exam: '証券外務員', category: '債券', unit: '円',
    text: '額面{額面}円の長期利付国債を取引所取引により単価{単価}円で売却したときの受渡代金を求めよ。\n(注)経過利子は{経過利子}円、委託手数料は額面100円につき{手数料_銭}銭、消費税相当額は考慮しないこと。',
    vars: [
      { name: '額面', choices: '1000000,2000000,3000000,5000000', format: 'jp' },
      { name: '単価', min: 98, max: 106, step: 0.5 },
      { name: '経過利子', min: 1000, max: 9000, step: 100 },
      { name: '手数料_銭', choices: '20,30,40,50' },
    ],
    steps: [
      { name: '約定代金', expr: '額面 * 単価 / 100' },
      { name: '委託手数料', expr: '額面 / 100 * 手数料_銭 / 100' },
      { name: '受渡代金', expr: '約定代金 + 経過利子 - 委託手数料' },
    ],
  },
  {
    id: 'stock-per', theme: 'PER', exam: '証券外務員', category: '株式', unit: '倍',
    text: 'PERを求めよ。小数点第2位以下を切り捨てる。\n|発行済株式総数|総負債|当期純利益|総資産|株価\n|{発行済株式総数}株|{総負債}円|{当期純利益}円|{総資産}円|{株価}円',
    vars: [
      { name: '発行済株式総数', min: 1000000, max: 10000000, step: 1000000, format: 'jp' },
      { name: '総負債', min: 1000000000, max: 2500000000, step: 500000000, format: 'jp' },
      { name: '当期純利益', min: 100000000, max: 900000000, step: 10000000, format: 'jp' },
      { name: '総資産', min: 3000000000, max: 9000000000, step: 500000000, format: 'jp' },
      { name: '株価', min: 500, max: 3000, step: 50 },
    ],
    steps: [
      { name: '1株当たり純利益', expr: '当期純利益 / 発行済株式総数' },
      { name: 'PER', expr: '株価 / 1株当たり純利益', round: 'floor', decimals: 1 },
    ],
  },
  {
    id: 'stock-pbr', theme: 'PBR', exam: '証券外務員', category: '株式', unit: '倍',
    text: 'PBRを求めよ。小数点第2位以下を切り捨てる。\n|発行済株式総数|総負債|当期純利益|総資産|株価\n|{発行済株式総数}株|{総負債}円|{当期純利益}円|{総資産}円|{株価}円',
    vars: [
      { name: '発行済株式総数', min: 1000000, max: 10000000, step: 1000000, format: 'jp' },
      { name: '総負債', min: 1000000000, max: 2500000000, step: 500000000, format: 'jp' },
      { name: '当期純利益', min: 100000000, max: 900000000, step: 10000000, format: 'jp' },
      { name: '総資産', min: 3000000000, max: 9000000000, step: 500000000, format: 'jp' },
      { name: '株価', min: 500, max: 3000, step: 50 },
    ],
    steps: [
      { name: '純資産', expr: '総資産 - 総負債', format: 'jp' },
      { name: '1株当たり純資産', expr: '純資産 / 発行済株式総数' },
      { name: 'PBR', expr: '株価 / 1株当たり純資産', round: 'floor', decimals: 1 },
    ],
  },
  {
    id: 'stock-roe', theme: 'ROE', exam: '証券外務員', category: '株式', unit: '%',
    text: '本年3月期の自己資本利益率(ROE)を求めよ。小数点第2位以下を切り捨てる。\n|(単位:百万円)|総資本|自己資本|売上高|当期純利益\n|本年3月期|{総資本_本年}|{自己資本_本年}|{売上高_本年}|{当期純利益_本年}\n|前年3月期|{総資本_前年}|{自己資本_前年}|{売上高_前年}|{当期純利益_前年}',
    vars: [
      { name: '総資本_本年', min: 3500, max: 6000, step: 10 },
      { name: '総資本_前年', min: 3500, max: 6000, step: 10 },
      { name: '自己資本_本年', min: 1000, max: 3000, step: 100 },
      { name: '自己資本_前年', min: 1000, max: 3000, step: 100 },
      { name: '売上高_本年', min: 3000, max: 8000, step: 10 },
      { name: '売上高_前年', min: 3000, max: 8000, step: 10 },
      { name: '当期純利益_本年', min: 100, max: 600, step: 10 },
      { name: '当期純利益_前年', min: 100, max: 600, step: 10 },
    ],
    steps: [
      { name: '自己資本_期首期末平均', expr: '(自己資本_前年 + 自己資本_本年) / 2' },
      { name: 'ROE', expr: '当期純利益_本年 / 自己資本_期首期末平均 * 100', round: 'floor', decimals: 1 },
    ],
  },
  {
    id: 'stock-kenriochi', theme: '権利落相場', exam: '証券外務員', category: '株式', unit: '円',
    text: '権利付相場{権利付相場}円で1:{分割比率}の分割時の権利落相場を求めよ。(円未満切り捨て)',
    vars: [
      { name: '権利付相場', min: 600, max: 3600, step: 60 },
      { name: '分割比率', choices: '1.2,1.5,2,3' },
    ],
    steps: [{ name: '権利落相場', expr: '権利付相場 / 分割比率', round: 'floor', decimals: 0 }],
  },
  {
    id: 'stock-kenriochi-nesagari', theme: '権利落相場（値下がり）', exam: '証券外務員', category: '株式', unit: '円',
    text: '1:{分割比率}の分割を行い権利付相場が{権利付相場}円の時、権利落後の値段が{権利落後の値段}円の時いくら値下がりしたことになるか求めよ。',
    vars: [
      { name: '分割比率', choices: '1.2,1.5,2' },
      { name: '権利付相場', min: 600, max: 3000, step: 50 },
      { name: '権利落後の値段', min: 300, max: 2400, step: 10 },
    ],
    steps: [
      { name: '権利付相場換算', expr: '権利落後の値段 * 分割比率' },
      { name: '値下がり', expr: '権利付相場 - 権利付相場換算' },
    ],
    condition: '値下がり > 0 and 値下がり < 権利付相場 * 0.2',
  },
  {
    id: 'stock-evebitda', theme: 'EV/EBITDA倍率', exam: '証券外務員', category: '株式', unit: '倍',
    text: '資本金{資本金}億円、時価総額{時価総額}億円、利益剰余金{利益剰余金}億円、保有現金預金(短期有価証券を含む){現預金}億円、有利子負債{有利子負債}億円、EBITDA{EBITDA}億円の場合のEV/EBITDA倍率を求めよ。小数点第2位以下を切り捨てる。',
    vars: [
      { name: '資本金', min: 50, max: 300, step: 50 },
      { name: '時価総額', min: 500, max: 1500, step: 50 },
      { name: '利益剰余金', min: 300, max: 900, step: 100 },
      { name: '現預金', min: 30, max: 200, step: 10 },
      { name: '有利子負債', min: 200, max: 800, step: 50 },
      { name: 'EBITDA', min: 100, max: 300, step: 10 },
    ],
    steps: [
      { name: 'EV', expr: '時価総額 + 有利子負債 - 現預金' },
      { name: 'EV_EBITDA倍率', expr: 'EV / EBITDA', round: 'floor', decimals: 1 },
    ],
  },
  {
    id: 'stock-ukewatashi-buy', theme: '受渡金額（株式・買い）', exam: '証券外務員', category: '株式', unit: '円',
    text: 'A社株式を{総株数}株で成行で買い注文した。同一日に{株価1}円で{株数1}株、{株価2}円で{株数2}株成立した。このときの受け渡し金額を求めよ。(円未満切り捨て)\n|約定代金|委託手数料等\n|100万超え1,000万以下|約定代金総額×0.7%+12,500円\n|1,000万超え3,000万以下|約定代金総額×0.575%+25,000円\n・上式の算出額に消費税10%が加算される',
    vars: [
      { name: '株価1', min: 800, max: 3000, step: 10 },
      { name: '株数1', min: 1000, max: 5000, step: 1000 },
      { name: '株価2', min: 800, max: 3000, step: 10 },
      { name: '株数2', min: 1000, max: 7000, step: 1000 },
    ],
    steps: [
      { name: '総株数', expr: '株数1 + 株数2' },
      { name: '約定代金', expr: '株価1 * 株数1 + 株価2 * 株数2' },
      { name: '委託手数料', expr: 'if(約定代金 <= 10000000, 約定代金 * 0.7% + 12500, 約定代金 * 0.575% + 25000)', round: 'floor', decimals: 0 },
      { name: '消費税', expr: '委託手数料 * 10%', round: 'floor', decimals: 0 },
      { name: '受渡金額', expr: '約定代金 + (委託手数料 + 消費税)' },
    ],
    condition: '約定代金 > 1000000 and 約定代金 <= 30000000',
  },
  {
    id: 'stock-ukewatashi-sell', theme: '受渡金額（株式・売り）', exam: '証券外務員', category: '株式', unit: '円',
    text: 'A社株式を{総株数}株で成行で売り注文した。同一日に{株価1}円で{株数1}株、{株価2}円で{株数2}株成立した。このときの受け渡し金額を求めよ。(円未満切り捨て)\n|約定代金|委託手数料等\n|100万超え1,000万以下|約定代金総額×0.7%+12,500円\n|1,000万超え3,000万以下|約定代金総額×0.575%+25,000円\n・上式の算出額に消費税10%が加算される',
    vars: [
      { name: '株価1', min: 800, max: 3000, step: 10 },
      { name: '株数1', min: 1000, max: 5000, step: 1000 },
      { name: '株価2', min: 800, max: 3000, step: 10 },
      { name: '株数2', min: 1000, max: 7000, step: 1000 },
    ],
    steps: [
      { name: '総株数', expr: '株数1 + 株数2' },
      { name: '約定代金', expr: '株価1 * 株数1 + 株価2 * 株数2' },
      { name: '委託手数料', expr: 'if(約定代金 <= 10000000, 約定代金 * 0.7% + 12500, 約定代金 * 0.575% + 25000)', round: 'floor', decimals: 0 },
      { name: '消費税', expr: '委託手数料 * 10%', round: 'floor', decimals: 0 },
      { name: '受渡金額', expr: '約定代金 - (委託手数料 + 消費税)' },
    ],
    condition: '約定代金 > 1000000 and 約定代金 <= 30000000',
  },
  // ---------- 財務諸表と企業分析 / 証券税制 (from Extras/Addon 1 (revised).txt) ----------
  {
    id: "analysis-pl", exam: "証券外務員", category: "財務諸表と企業分析", theme: "損益計算書", unit: "百万円",
    text: "以下は損益計算書である。(ア)〜(エ)を順に求め、(エ)の金額を答えよ。（単位：百万円）\n|項目|金額\n|営業損益|\n|　売上高|{売上高}\n|　売上原価|{売上原価}\n|　販売費及び一般管理費|{販管費}\n|営業利益|(ア)\n|営業外損益|\n|　営業外収益|{営業外収益}\n|　営業外費用|{営業外費用}\n|経常利益|(イ)\n|特別利益|{特別利益}\n|特別損失|{特別損失}\n|税引前当期純利益|(ウ)\n|法人税、住民税及び事業税|{法人税等}\n|当期利益|(エ)",
    vars: [
      { name: "売上高", min: 80000, max: 200000, step: 1000 },
      { name: "売上原価", min: 40000, max: 120000, step: 1000 },
      { name: "販管費", min: 5000, max: 30000, step: 1000 },
      { name: "営業外収益", min: 1000, max: 15000, step: 500 },
      { name: "営業外費用", min: 500, max: 5000, step: 100 },
      { name: "特別利益", min: 0, max: 3000, step: 100 },
      { name: "特別損失", min: 0, max: 3000, step: 100 },
      { name: "法人税等", min: 3000, max: 30000, step: 500 },
    ],
    steps: [
      { name: "営業利益", label: "(ア) 営業利益", expr: "売上高 - 売上原価 - 販管費" },
      { name: "経常利益", label: "(イ) 経常利益", expr: "営業利益 + 営業外収益 - 営業外費用" },
      { name: "税引前当期純利益", label: "(ウ) 税引前当期純利益", expr: "経常利益 + 特別利益 - 特別損失" },
      { name: "当期利益", label: "(エ) 当期利益", expr: "税引前当期純利益 - 法人税等" },
    ],
    condition: "営業利益 > 0 and 法人税等 < 税引前当期純利益 * 0.5",
  },
  {
    id: "analysis-haitou-seikou", exam: "証券外務員", category: "財務諸表と企業分析", theme: "配当性向", unit: "%",
    text: "以下の会社の配当性向を求めよ。小数第三位切り捨て\n|発行済株式総数|中間配当|期末配当|資本金|資本剰余金等|当期純利益|株価\n|{発行済株式総数}株|{中間配当}円|{期末配当}円|{資本金}円|{資本剰余金等}円|{当期純利益}円|{株価}円",
    vars: [
      { name: "発行済株式総数", min: 500000000, max: 2000000000, step: 100000000, format: "jp" },
      { name: "中間配当", min: 3, max: 20, step: 1 },
      { name: "期末配当", min: 3, max: 20, step: 1 },
      { name: "資本金", min: 30000000000, max: 150000000000, step: 5000000000, format: "jp" },
      { name: "資本剰余金等", min: 30000000000, max: 150000000000, step: 5000000000, format: "jp" },
      { name: "当期純利益", min: 20000000000, max: 150000000000, step: 5000000000, format: "jp" },
      { name: "株価", min: 300, max: 3000, step: 10 },
    ],
    steps: [
      { name: "一株当たり配当金", label: "1株当たり年間配当金", expr: "中間配当 + 期末配当", note: "中間配当と期末配当を合計する" },
      { name: "配当金総額", expr: "一株当たり配当金 * 発行済株式総数", format: "jp" },
      { name: "配当性向", expr: "配当金総額 * 100 / 当期純利益", round: "floor", decimals: 2, note: "配当性向は当期純利益に対する配当金の割合（資本金・株価は使わない）" },
    ],
    condition: "配当金総額 < 当期純利益",
  },
  {
    id: "analysis-haitou-ritsu", exam: "証券外務員", category: "財務諸表と企業分析", theme: "配当率", unit: "%",
    text: "以下の会社の配当率を求めよ。小数第三位切り捨て\n|発行済株式総数|中間配当|期末配当|資本金|資本剰余金等|当期純利益|株価\n|{発行済株式総数}株|{中間配当}円|{期末配当}円|{資本金}円|{資本剰余金等}円|{当期純利益}円|{株価}円",
    vars: [
      { name: "発行済株式総数", min: 500000000, max: 2000000000, step: 100000000, format: "jp" },
      { name: "中間配当", min: 3, max: 20, step: 1 },
      { name: "期末配当", min: 3, max: 20, step: 1 },
      { name: "資本金", min: 30000000000, max: 150000000000, step: 5000000000, format: "jp" },
      { name: "資本剰余金等", min: 30000000000, max: 150000000000, step: 5000000000, format: "jp" },
      { name: "当期純利益", min: 20000000000, max: 150000000000, step: 5000000000, format: "jp" },
      { name: "株価", min: 300, max: 3000, step: 10 },
    ],
    steps: [
      { name: "一株当たり配当金", label: "1株当たり年間配当金", expr: "中間配当 + 期末配当", note: "中間配当と期末配当を合計する" },
      { name: "配当金総額", expr: "一株当たり配当金 * 発行済株式総数", format: "jp" },
      { name: "配当率", expr: "配当金総額 * 100 / 資本金", round: "floor", decimals: 2, note: "配当率は資本金に対する配当金の割合（当期純利益ではない）" },
    ],
    condition: "配当金総額 < 資本金",
  },
  {
    id: "analysis-ryudo-hiritsu", exam: "証券外務員", category: "財務諸表と企業分析", theme: "流動比率", unit: "%",
    text: "以下の場合、流動比率を求めよ。単位：百万円　小数第二位切り上げ\n|資産|金額|負債・資本|金額\n|流動資産|{流動資産}|流動負債|{流動負債}\n|固定資産|{固定資産}|固定負債|{固定負債}\n|||自己資本|{自己資本}\n|資産合計|{総資本}|負債・資本合計|{総資本}",
    vars: [
      { name: "流動資産", min: 20000, max: 40000, step: 1000 },
      { name: "固定資産", min: 50000, max: 80000, step: 1000 },
      { name: "流動負債", min: 20000, max: 40000, step: 1000 },
      { name: "固定負債", min: 20000, max: 50000, step: 1000 },
    ],
    steps: [
      { name: "自己資本", label: "自己資本（表の値）", expr: "流動資産 + 固定資産 - 流動負債 - 固定負債" },
      { name: "総資本", label: "総資本（表の値）", expr: "流動資産 + 固定資産" },
      { name: "流動比率", expr: "流動資産 * 100 / 流動負債", round: "ceil", decimals: 1, note: "流動資産 ÷ 流動負債。短期の支払能力を見る指標" },
    ],
    condition: "自己資本 >= 10000",
  },
  {
    id: "analysis-kotei-choki-tekigou", exam: "証券外務員", category: "財務諸表と企業分析", theme: "固定長期適合率", unit: "%",
    text: "以下の場合、固定長期適合率を求めよ。単位：百万円　小数第二位切り上げ\n|資産|金額|負債・資本|金額\n|流動資産|{流動資産}|流動負債|{流動負債}\n|固定資産|{固定資産}|固定負債|{固定負債}\n|||自己資本|{自己資本}\n|資産合計|{総資本}|負債・資本合計|{総資本}",
    vars: [
      { name: "流動資産", min: 20000, max: 40000, step: 1000 },
      { name: "固定資産", min: 50000, max: 80000, step: 1000 },
      { name: "流動負債", min: 20000, max: 40000, step: 1000 },
      { name: "固定負債", min: 20000, max: 50000, step: 1000 },
    ],
    steps: [
      { name: "自己資本", label: "自己資本（表の値）", expr: "流動資産 + 固定資産 - 流動負債 - 固定負債" },
      { name: "総資本", label: "総資本（表の値）", expr: "流動資産 + 固定資産" },
      { name: "長期資本", label: "長期資本（固定負債＋自己資本）", expr: "固定負債 + 自己資本" },
      { name: "固定長期適合率", expr: "固定資産 * 100 / 長期資本", round: "ceil", decimals: 1, note: "固定資産が長期の資金（固定負債＋自己資本）でまかなえているかを見る" },
    ],
    condition: "自己資本 >= 10000",
  },
  {
    id: "analysis-fusai-hiritsu", exam: "証券外務員", category: "財務諸表と企業分析", theme: "負債比率", unit: "%",
    text: "以下の場合、負債比率を求めよ。単位：百万円　小数第二位切り上げ\n|資産|金額|負債・資本|金額\n|流動資産|{流動資産}|流動負債|{流動負債}\n|固定資産|{固定資産}|固定負債|{固定負債}\n|||自己資本|{自己資本}\n|資産合計|{総資本}|負債・資本合計|{総資本}",
    vars: [
      { name: "流動資産", min: 20000, max: 40000, step: 1000 },
      { name: "固定資産", min: 50000, max: 80000, step: 1000 },
      { name: "流動負債", min: 20000, max: 40000, step: 1000 },
      { name: "固定負債", min: 20000, max: 50000, step: 1000 },
    ],
    steps: [
      { name: "自己資本", label: "自己資本（表の値）", expr: "流動資産 + 固定資産 - 流動負債 - 固定負債" },
      { name: "総資本", label: "総資本（表の値）", expr: "流動資産 + 固定資産" },
      { name: "負債合計", label: "負債合計（流動負債＋固定負債）", expr: "流動負債 + 固定負債" },
      { name: "負債比率", expr: "負債合計 * 100 / 自己資本", round: "ceil", decimals: 1, note: "分母は自己資本（総資本ではない）" },
    ],
    condition: "自己資本 >= 10000",
  },
  {
    id: "analysis-jiko-shihon-hiritsu", exam: "証券外務員", category: "財務諸表と企業分析", theme: "自己資本比率", unit: "%",
    text: "以下の場合、自己資本比率を求めよ。単位：百万円　小数第二位切り上げ\n|資産|金額|負債・資本|金額\n|流動資産|{流動資産}|流動負債|{流動負債}\n|固定資産|{固定資産}|固定負債|{固定負債}\n|||自己資本|{自己資本}\n|資産合計|{総資本}|負債・資本合計|{総資本}",
    vars: [
      { name: "流動資産", min: 20000, max: 40000, step: 1000 },
      { name: "固定資産", min: 50000, max: 80000, step: 1000 },
      { name: "流動負債", min: 20000, max: 40000, step: 1000 },
      { name: "固定負債", min: 20000, max: 50000, step: 1000 },
    ],
    steps: [
      { name: "自己資本", label: "自己資本（表の値）", expr: "流動資産 + 固定資産 - 流動負債 - 固定負債" },
      { name: "総資本", label: "総資本（＝負債・資本合計）", expr: "流動資産 + 固定資産" },
      { name: "自己資本比率", expr: "自己資本 * 100 / 総資本", round: "ceil", decimals: 1, note: "総資本のうち自己資本が占める割合" },
    ],
    condition: "自己資本 >= 10000",
  },
  {
    id: "analysis-kotei-hiritsu", exam: "証券外務員", category: "財務諸表と企業分析", theme: "固定比率", unit: "%",
    text: "以下の場合、固定比率を求めよ。単位：百万円　小数第二位切り上げ\n|資産|金額|負債・資本|金額\n|流動資産|{流動資産}|流動負債|{流動負債}\n|固定資産|{固定資産}|固定負債|{固定負債}\n|||自己資本|{自己資本}\n|資産合計|{総資本}|負債・資本合計|{総資本}",
    vars: [
      { name: "流動資産", min: 20000, max: 40000, step: 1000 },
      { name: "固定資産", min: 50000, max: 80000, step: 1000 },
      { name: "流動負債", min: 20000, max: 40000, step: 1000 },
      { name: "固定負債", min: 20000, max: 50000, step: 1000 },
    ],
    steps: [
      { name: "自己資本", label: "自己資本（表の値）", expr: "流動資産 + 固定資産 - 流動負債 - 固定負債" },
      { name: "総資本", label: "総資本（表の値）", expr: "流動資産 + 固定資産" },
      { name: "固定比率", expr: "固定資産 * 100 / 自己資本", round: "ceil", decimals: 1, note: "分母は自己資本だけ（固定負債は入れない。入れると固定長期適合率）" },
    ],
    condition: "自己資本 >= 10000",
  },
  {
    id: "analysis-genkai-rieki-ritsu", exam: "証券外務員", category: "財務諸表と企業分析", theme: "限界利益率", unit: "%",
    text: "以下の場合、限界利益率を求めよ。(注)単位：百万円、答は小数第2位切り捨て\n|売上高|変動費|利益\n|{売上高}|{変動費}|{利益}",
    vars: [
      { name: "売上高", min: 50000, max: 100000, step: 1000 },
      { name: "変動費", min: 20000, max: 80000, step: 1000 },
      { name: "利益", min: 1000, max: 20000, step: 1000 },
    ],
    steps: [
      { name: "限界利益", expr: "売上高 - 変動費" },
      { name: "限界利益率", expr: "限界利益 * 100 / 売上高", round: "floor", decimals: 1, note: "売上高のうち限界利益が占める割合。利益（6,000など）は使わない" },
    ],
    condition: "変動費 < 売上高 and 利益 < 限界利益",
  },
  {
    id: "analysis-sonekibunkiten", exam: "証券外務員", category: "財務諸表と企業分析", theme: "損益分岐点", unit: "百万円",
    text: "以下の場合、損益分岐点を求めよ。(注)単位：百万円、答は小数第2位切り捨て\n|売上高|変動費|利益\n|{売上高}|{変動費}|{利益}",
    vars: [
      { name: "売上高", min: 50000, max: 100000, step: 1000 },
      { name: "変動費", min: 20000, max: 80000, step: 1000 },
      { name: "利益", min: 1000, max: 20000, step: 1000 },
    ],
    steps: [
      { name: "限界利益", expr: "売上高 - 変動費" },
      { name: "限界利益率", expr: "限界利益 / 売上高", format: "pct" },
      { name: "固定費", expr: "売上高 - 変動費 - 利益", note: "売上高 − 変動費 − 固定費 ＝ 利益 から逆算する" },
      { name: "損益分岐点", expr: "固定費 / 限界利益率", round: "floor", decimals: 1, note: "利益がちょうど0になる売上高" },
    ],
    condition: "変動費 < 売上高 and 利益 < 限界利益",
  },
  {
    id: "analysis-sonekibunkiten-hiritsu", exam: "証券外務員", category: "財務諸表と企業分析", theme: "損益分岐点比率", unit: "%",
    text: "以下の場合、損益分岐点比率を求めよ。(注)単位：百万円、答は小数第2位切り捨て\n|売上高|変動費|利益\n|{売上高}|{変動費}|{利益}",
    vars: [
      { name: "売上高", min: 50000, max: 100000, step: 1000 },
      { name: "変動費", min: 20000, max: 80000, step: 1000 },
      { name: "利益", min: 1000, max: 20000, step: 1000 },
    ],
    steps: [
      { name: "限界利益", expr: "売上高 - 変動費" },
      { name: "限界利益率", expr: "限界利益 / 売上高", format: "pct" },
      { name: "固定費", expr: "売上高 - 変動費 - 利益", note: "売上高 − 変動費 − 固定費 ＝ 利益 から逆算する" },
      { name: "損益分岐点", expr: "固定費 / 限界利益率" },
      { name: "損益分岐点比率", expr: "損益分岐点 * 100 / 売上高", round: "floor", decimals: 1, note: "実際の売上高に対する損益分岐点の割合。低いほど安全" },
    ],
    condition: "変動費 < 売上高 and 利益 < 限界利益",
  },
  {
    id: "analysis-soushihon-kaiten-kikan", exam: "証券外務員", category: "財務諸表と企業分析", theme: "総資本回転期間", unit: "ヵ月",
    text: "総資本回転率が{総資本回転率}回 (1年決算)の場合の総資本回転期間を求めよ。小数第3位以下を四捨五入",
    vars: [
      { name: "総資本回転率", choices: "0.75,0.8,0.96,1.2,1.25,1.5,1.6,2,2.4,3,4" },
    ],
    steps: [
      { name: "年間の月数", expr: "12", note: "1年決算なので12ヵ月" },
      { name: "総資本回転期間", expr: "年間の月数 / 総資本回転率", round: "round", decimals: 2 },
    ],
  },
  {
    id: "tax-jouto-zeigaku", exam: "証券外務員", category: "証券税制", theme: "上場株式の譲渡益課税", unit: "円",
    text: "下記のとおり買付けと売却を行った。売却による所得に対する所得税及び復興特別所得税・住民税の合計金額を求めよ。(注)計算の途中で端数が生じた場合、取得価額については円未満を切り上げ、税額については、円未満を切り捨てること。\n|年月日|売買の別|単価|株数\n|本年8月|買い|{単価8月}円|{株数8月}株\n|同年9月|買い|{単価9月}円|{株数9月}株\n|同年10月|買い|{単価10月}円|{株数10月}株\n|同年11月|売り|{売却単価}円|{取得株数合計}株",
    vars: [
      { name: "単価8月", min: 2000, max: 6000, step: 100 },
      { name: "株数8月", min: 1000, max: 5000, step: 100 },
      { name: "単価9月", min: 2000, max: 6000, step: 100 },
      { name: "株数9月", min: 1000, max: 5000, step: 100 },
      { name: "単価10月", min: 2000, max: 6000, step: 100 },
      { name: "株数10月", min: 1000, max: 5000, step: 100 },
      { name: "売却単価", min: 3000, max: 7000, step: 100 },
    ],
    steps: [
      { name: "取得価額合計", label: "取得価額の合計（単価 × 株数）", expr: "単価8月 * 株数8月 + 単価9月 * 株数9月 + 単価10月 * 株数10月" },
      { name: "取得株数合計", label: "取得株数の合計", expr: "株数8月 + 株数9月 + 株数10月" },
      { name: "一株当たり取得価額", label: "1株当たり取得価額（総平均法）", expr: "取得価額合計 / 取得株数合計", round: "ceil", decimals: 0, note: "同じ銘柄を複数回買ったときは、総平均法で1株当たりの取得価額を出す" },
      { name: "売却益", label: "譲渡益", expr: "(売却単価 - 一株当たり取得価額) * 取得株数合計" },
      { name: "税率", label: "税率（所得税15%＋復興特別所得税0.315%＋住民税5%）", expr: "15% + 0.315% + 5%", format: "pct" },
      { name: "税額", expr: "売却益 * 税率", round: "floor", decimals: 0 },
    ],
    condition: "売却単価 > 一株当たり取得価額",
  },
  {
    id: "tax-souzoku-hyouka", exam: "証券外務員", category: "証券税制", theme: "上場株式の相続税評価額", unit: "円",
    text: "上場銘柄A社株式の1株当たりの7月30日の終値及び最近4ヵ月の終値の月平均額が以下のとおりである場合、当該株式の1株当たりの相続税評価額を求めよ。なお、当該株式の課税時期は7月30日とする。\n|項目|価格\n|7月30日の終値|{課税時期の終値}円\n|7月中の終値平均株価|{平均7月}円\n|6月中の終値平均株価|{平均6月}円\n|5月中の終値平均株価|{平均5月}円\n|4月中の終値平均株価|{平均4月}円",
    vars: [
      { name: "課税時期の終値", min: 4500, max: 6500, step: 10 },
      { name: "平均7月", min: 4500, max: 6500, step: 10 },
      { name: "平均6月", min: 4500, max: 6500, step: 10 },
      { name: "平均5月", min: 4500, max: 6500, step: 10 },
      { name: "平均4月", min: 4500, max: 6500, step: 10 },
    ],
    steps: [
      { name: "参考_4月の平均", label: "参考：4月の平均（使わない）", expr: "平均4月", note: "対象は課税時期の月（7月）・前月（6月）・前々月（5月）の3ヵ月だけ。4月は最も低くても対象外" },
      { name: "相続税評価額", label: "相続税評価額（4つのうち最も低い価額）", expr: "min(課税時期の終値, 平均7月, 平均6月, 平均5月)", note: "課税時期の終値と、課税時期の月以前3ヵ月間の各月の終値平均のうち、最も低い価額で評価する" },
    ],
    condition: "平均4月 < 相続税評価額",
  },
  {
    id: "tax-haitou-koujo-shotoku", exam: "証券外務員", category: "証券税制", theme: "配当控除（所得税）", unit: "円",
    text: "課税総所得金額等が{課税総所得金額等}円で、配当所得の金額が{配当所得}円(源泉所得税控除前)の所得税の配当控除の額を求めよ。(注)負債利子は無いものとする",
    vars: [
      { name: "課税総所得金額等", min: 10100000, max: 11500000, step: 100000, format: "jp" },
      { name: "配当所得", min: 200000, max: 2000000, step: 100000, format: "jp" },
    ],
    steps: [
      { name: "区切り", label: "控除率が変わる区切り", expr: "10000000", format: "jp" },
      { name: "超える額", label: "課税総所得金額等のうち1,000万円を超える額", expr: "max(課税総所得金額等 - 区切り, 0)", format: "jp" },
      { name: "超える部分の配当", label: "配当のうち1,000万円を超える部分", expr: "min(配当所得, 超える額)", format: "jp", note: "配当所得は所得のいちばん上に乗っていると考え、1,000万円を超える部分から割り当てる" },
      { name: "以下の部分の配当", label: "配当のうち1,000万円以下の部分", expr: "配当所得 - 超える部分の配当", format: "jp" },
      { name: "超える部分の控除", label: "1,000万円超の部分の控除（所得税5%）", expr: "超える部分の配当 * 5%" },
      { name: "以下の部分の控除", label: "1,000万円以下の部分の控除（所得税10%）", expr: "以下の部分の配当 * 10%" },
      { name: "所得税の配当控除額", expr: "超える部分の控除 + 以下の部分の控除", round: "round", decimals: 0 },
    ],
    condition: "課税総所得金額等 > 10000000 and 課税総所得金額等 - 配当所得 < 10000000",
  },
  {
    id: "tax-haitou-koujo-jumin", exam: "証券外務員", category: "証券税制", theme: "配当控除（住民税）", unit: "円",
    text: "課税総所得金額等が{課税総所得金額等}円で、配当所得の金額が{配当所得}円(源泉所得税控除前)の住民税の配当控除の額を求めよ。(注)負債利子は無いものとする",
    vars: [
      { name: "課税総所得金額等", min: 10100000, max: 11500000, step: 100000, format: "jp" },
      { name: "配当所得", min: 200000, max: 2000000, step: 100000, format: "jp" },
    ],
    steps: [
      { name: "区切り", label: "控除率が変わる区切り", expr: "10000000", format: "jp" },
      { name: "超える額", label: "課税総所得金額等のうち1,000万円を超える額", expr: "max(課税総所得金額等 - 区切り, 0)", format: "jp" },
      { name: "超える部分の配当", label: "配当のうち1,000万円を超える部分", expr: "min(配当所得, 超える額)", format: "jp", note: "配当所得は所得のいちばん上に乗っていると考え、1,000万円を超える部分から割り当てる" },
      { name: "以下の部分の配当", label: "配当のうち1,000万円以下の部分", expr: "配当所得 - 超える部分の配当", format: "jp" },
      { name: "超える部分の控除", label: "1,000万円超の部分の控除（住民税1.4%）", expr: "超える部分の配当 * 1.4%" },
      { name: "以下の部分の控除", label: "1,000万円以下の部分の控除（住民税2.8%）", expr: "以下の部分の配当 * 2.8%" },
      { name: "住民税の配当控除額", expr: "超える部分の控除 + 以下の部分の控除", round: "round", decimals: 0 },
    ],
    condition: "課税総所得金額等 > 10000000 and 課税総所得金額等 - 配当所得 < 10000000",
  },
];
