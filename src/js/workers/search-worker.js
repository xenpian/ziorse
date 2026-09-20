/**
 * Ziorse Search & Filter Web Worker
 * 
 * Discord benzeri multi-threading mimarisi:
 * Binlerce mesaj, kullanıcı ve etiket araması ana UI thread'ini dondurmadan
 * arka planda Worker thread üzerinde çalışır.
 */

self.onmessage = function (e) {
  const { id, type, query, data } = e.data;

  if (type === 'SEARCH_POSTS') {
    const results = searchPosts(query, data);
    self.postMessage({ id, type, results });
  } else if (type === 'FILTER_TAGS') {
    const results = filterByTag(query, data);
    self.postMessage({ id, type, results });
  } else if (type === 'SEARCH_USERS') {
    const results = searchUsers(query, data);
    self.postMessage({ id, type, results });
  }
};

function searchPosts(query, posts) {
  if (!query || !posts || !Array.isArray(posts)) return [];
  const q = query.trim().toLowerCase();
  if (!q) return posts;

  const isTag = q.startsWith('#');
  const tagTarget = isTag ? q.slice(1) : null;

  return posts.filter(post => {
    if (!post) return false;
    
    // Tag araması
    if (tagTarget) {
      if (post.tags && Array.isArray(post.tags)) {
        if (post.tags.some(t => String(t).toLowerCase().includes(tagTarget))) return true;
      }
      if (post.content && String(post.content).toLowerCase().includes(q)) return true;
      return false;
    }

    // Genel metin / yazar araması
    const content = (post.content || '').toLowerCase();
    const author = (post.author || '').toLowerCase();
    const handle = (post.handle || '').toLowerCase();
    const code = (post.codeSnippet || '').toLowerCase();

    return content.includes(q) || author.includes(q) || handle.includes(q) || code.includes(q);
  });
}

function filterByTag(tag, posts) {
  if (!tag || !posts || !Array.isArray(posts)) return [];
  const cleanTag = tag.replace(/^#/, '').toLowerCase();
  return posts.filter(post => {
    if (!post) return false;
    if (post.tags && Array.isArray(post.tags)) {
      return post.tags.some(t => String(t).toLowerCase() === cleanTag);
    }
    if (post.content && String(post.content).toLowerCase().includes('#' + cleanTag)) return true;
    return false;
  });
}

function searchUsers(query, users) {
  if (!query || !users || !Array.isArray(users)) return [];
  const q = query.trim().toLowerCase().replace(/^@/, '');
  if (!q) return users;

  return users.filter(user => {
    if (!user) return false;
    const name = (user.name || '').toLowerCase();
    const handle = (user.handle || '').toLowerCase();
    const bio = (user.bio || '').toLowerCase();
    return name.includes(q) || handle.includes(q) || bio.includes(q);
  });
}
