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
];
