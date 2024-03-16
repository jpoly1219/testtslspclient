const indexOfRegexGroup = (match, n) => {
  let ix = match.index;
  for (let i = 1; i < n; i++)
    ix += match[i].length;
  return ix;
}

export { indexOfRegexGroup }
