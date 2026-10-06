(() => {
  const blocked = 'script,style,textarea,pre,code,svg,.hh-original-english';
  const chunks = /[A-Za-z0-9][A-Za-z0-9 \t.,:;!?()\[\]{}'"_\/+&%#=@~\-]*/g;
  function restoreEnglish(text) {
    const parent = text.parentElement;
    if (!parent || parent.closest(blocked) || !/[A-Za-z]/.test(text.data)) return;
    const value = text.data;
    const matches = [...value.matchAll(chunks)].filter(m => /[A-Za-z]/.test(m[0]));
    if (!matches.length) return;
    const fragment = document.createDocumentFragment();
    let cursor = 0;
    for (const match of matches) {
      const start = match.index;
      const content = match[0].replace(/[ \t]+$/, '');
      if (!content) continue;
      fragment.append(document.createTextNode(value.slice(cursor, start)));
      const span = document.createElement('span');
      span.className = 'hh-original-english';
      span.textContent = content;
      fragment.append(span);
      cursor = start + content.length;
    }
    fragment.append(document.createTextNode(value.slice(cursor)));
    text.replaceWith(fragment);
  }
  function scan(node) {
    if (node.nodeType === Node.TEXT_NODE) { restoreEnglish(node); return; }
    if (node.nodeType !== Node.ELEMENT_NODE || node.closest(blocked)) return;
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach(restoreEnglish);
  }
  scan(document.body);
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') restoreEnglish(record.target);
      else for (const node of record.addedNodes) scan(node);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
})();
