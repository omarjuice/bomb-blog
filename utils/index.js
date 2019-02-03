export const getMatches = (string, regex, index) => {
    index || (index = 1);
    var matches = [];
    var match;
    while (match = regex.exec(string)) {
        matches.push(match[index]);
    }
    return matches;
}
export const updateTags = (oldTags, newTags) => {
    const OldTags = oldTags.reduce((acc, tag) => {
        acc[tag] = true
        return acc
    }, {})
    const NewTags = newTags.reduce((acc, tag) => {
        acc[tag] = true
        return acc
    }, {})
    const addTags = [];
    const deleteTags = [];
    for (let tag in OldTags) {
        if (!NewTags[tag]) {
            deleteTags.push(tag)
        }
    }
    for (let tag in NewTags) {
        if (!OldTags[tag]) {
            addTags.push(tag)
        }
    }
    return { addTags, deleteTags }
}