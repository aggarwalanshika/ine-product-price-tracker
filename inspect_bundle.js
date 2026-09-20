async function decodePOnly() {
  const res = await fetch('https://demo.inelabteamdev.com/assets/index-B9UiQq4X.js');
  const text = await res.text();

  const prIdx = text.indexOf('function pr(');
  const vrEndIdx = text.indexOf('var yr=');

  const snippet = text.substring(prIdx, vrEndIdx);

  const codeToRun = `
    ${snippet}
    var P = pr;
    const map = {};
    for (let i = 480; i <= 620; i++) {
      try {
        const val = P(i);
        if (val) map[i] = val;
      } catch(e) {}
    }
    return map;
  `;

  const fn = new Function(codeToRun);
  const map = fn();
  console.log('Decoded P map:', JSON.stringify(map, null, 2));
}

decodePOnly();
