/**
 * Blog System - Main JavaScript
 * Handles Markdown parsing, post loading, and rendering
 */

(function () {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const CONFIG = {
    postsJsonPath: './posts/posts.json',
    postsDir: './posts/',
    siteTitle: 'My Blog',
    siteAuthor: 'John Doe',
    postsPerPage: 10
  };

  // ============================================
  // Theme Toggle
  // ============================================
  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  }

  function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      if (theme === 'dark') {
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>';
      } else {
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>';
      }
    }
  }

  // ============================================
  // Escape HTML
  // ============================================
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  // ============================================
  // Simple Markdown Parser
  // ============================================
  function parseMarkdown(md) {
    if (!md) return '';

    // Remove YAML front matter
    md = md.replace(/^---[\s\S]*?---\n?/, '');

    // Extract code blocks first to protect them
    var codeBlocks = [];
    md = md.replace(/```(\w*)\n([\s\S]*?)```/g, function (match, lang, code) {
      codeBlocks.push({ lang: lang, code: code.trim() });
      return '\x00CODEBLOCK' + (codeBlocks.length - 1) + '\x00';
    });

    // Extract inline code
    var inlineCodes = [];
    md = md.replace(/`([^`]+)`/g, function (match, code) {
      inlineCodes.push(code);
      return '\x00INLINECODE' + (inlineCodes.length - 1) + '\x00';
    });

    // Escape HTML
    md = escapeHtml(md);

    // Headings
    md = md.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    md = md.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    md = md.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold and Italic
    md = md.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    md = md.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    md = md.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Links
    md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Images
    md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

    // Blockquotes
    md = md.replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>');

    // Unordered lists
    md = md.replace(/^- (.+)$/gm, '<li>$1</li>');
    md = md.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Horizontal rule
    md = md.replace(/^---$/gm, '<hr>');

    // Paragraphs
    md = md.replace(/\n\n/g, '</p><p>');
    md = '<p>' + md + '</p>';

    // Clean up empty paragraphs and fix nesting
    md = md.replace(/<p><\/p>/g, '');
    md = md.replace(/<p>(<h[1-6]>)/g, '$1');
    md = md.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    md = md.replace(/<p>(<ul>)/g, '$1');
    md = md.replace(/(<\/ul>)<\/p>/g, '$1');
    md = md.replace(/<p>(<blockquote>)/g, '$1');
    md = md.replace(/(<\/blockquote>)<\/p>/g, '$1');
    md = md.replace(/<p>(<hr>)<\/p>/g, '$1');

    // Restore code blocks
    md = md.replace(/\x00CODEBLOCK(\d+)\x00/g, function (match, index) {
      var block = codeBlocks[parseInt(index)];
      var langClass = block.lang ? ' class="language-' + block.lang + '"' : '';
      return '<pre><code' + langClass + '>' + escapeHtml(block.code) + '</code></pre>';
    });

    // Restore inline codes
    md = md.replace(/\x00INLINECODE(\d+)\x00/g, function (match, index) {
      return '<code>' + escapeHtml(inlineCodes[parseInt(index)]) + '</code>';
    });

    return md;
  }

  // ============================================
  // Parse Front Matter
  // ============================================
  function parseFrontMatter(md) {
    var match = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) return { meta: {}, content: md };

    var meta = {};
    var metaStr = match[1];
    metaStr.split('\n').forEach(function (line) {
      var colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        var key = line.substring(0, colonIndex).trim();
        var value = line.substring(colonIndex + 1).trim();
        // Parse arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(function (s) {
            return s.trim().replace(/^["']|["']$/g, '');
          });
        }
        meta[key] = value;
      }
    });

    return { meta: meta, content: match[2] };
  }

  // ============================================
  // Load Posts List
  // ============================================
  async function loadPostsList() {
    try {
      var response = await fetch(CONFIG.postsJsonPath);
      if (!response.ok) throw new Error('Failed to load posts.json');
      return await response.json();
    } catch (error) {
      console.error('Error loading posts:', error);
      return [];
    }
  }

  // ============================================
  // Load Single Post
  // ============================================
  async function loadPost(filename) {
    try {
      var response = await fetch(CONFIG.postsDir + filename);
      if (!response.ok) throw new Error('Failed to load post: ' + filename);
      return await response.text();
    } catch (error) {
      console.error('Error loading post:', error);
      return null;
    }
  }

  // ============================================
  // Render Post List (Index Page)
  // ============================================
  async function renderIndexPage() {
    var posts = await loadPostsList();
    var container = document.getElementById('post-list');
    if (!container) return;

    if (posts.length === 0) {
      container.innerHTML = '<p class="no-posts">No posts yet. Add some Markdown files to get started!</p>';
      return;
    }

    var html = '';
    posts.forEach(function (post) {
      var date = post.date || '';
      var tags = Array.isArray(post.tags) ? post.tags : [];
      var postUrl = 'post.html?file=' + encodeURIComponent(post.file);

      html += '<article class="post-item">';
      html += '  <h2 class="post-title"><a href="' + postUrl + '">' + escapeHtml(post.title) + '</a></h2>';
      html += '  <div class="post-meta">';
      html += '    <time>' + date + '</time>';
      if (tags.length > 0) {
        html += '    <div class="post-tags">';
        tags.forEach(function (tag) {
          html += '<span class="post-tag">' + escapeHtml(tag) + '</span>';
        });
        html += '    </div>';
      }
      html += '  </div>';
      html += '  <a href="' + postUrl + '" class="read-more">Read more &rarr;</a>';
      html += '</article>';
    });

    container.innerHTML = html;
  }

  // ============================================
  // Render Single Post Page
  // ============================================
  async function renderPostPage() {
    var params = new URLSearchParams(window.location.search);
    var filename = params.get('file');

    if (!filename) {
      window.location.href = 'index.html';
      return;
    }

    var rawMd = await loadPost(filename);
    if (!rawMd) {
      document.getElementById('post-content').innerHTML = '<p>Post not found.</p>';
      return;
    }

    var parsed = parseFrontMatter(rawMd);
    var meta = parsed.meta;
    var content = parsed.content;
    var htmlContent = parseMarkdown(content);

    // Update page title
    document.title = (meta.title || 'Post') + ' | ' + CONFIG.siteTitle;

    // Update post header
    var postHeader = document.getElementById('post-header');
    if (postHeader) {
      var headerHtml = '<h1>' + escapeHtml(meta.title || 'Untitled') + '</h1>';
      headerHtml += '<div class="post-meta">';
      headerHtml += '  <time>' + (meta.date || '') + '</time>';
      if (meta.tags && Array.isArray(meta.tags)) {
        headerHtml += '  <div class="post-tags">';
        meta.tags.forEach(function (tag) {
          headerHtml += '<span class="post-tag">' + escapeHtml(tag) + '</span>';
        });
        headerHtml += '  </div>';
      }
      headerHtml += '</div>';
      postHeader.innerHTML = headerHtml;
    }

    // Update content
    var contentEl = document.getElementById('post-content');
    if (contentEl) {
      contentEl.innerHTML = htmlContent;
    }

    // Update stats
    updateArticleStats(content, filename);

    // Setup post navigation
    setupPostNavigation(filename);
  }

  // ============================================
  // Article Stats (Word count, Reading, Likes)
  // ============================================
  function updateArticleStats(content, filename) {
    var statsContainer = document.getElementById('article-stats');
    if (!statsContainer) return;

    // Word count
    var text = content.replace(/[#*`>\-\[\]()!]/g, '').trim();
    var wordCount = text ? text.split(/\s+/).length : 0;

    // Reading count
    var postId = 'post_' + filename.replace(/[^a-zA-Z0-9]/g, '_');
    var readingCount = parseInt(localStorage.getItem(postId + '_reading')) || 0;
    readingCount++;
    localStorage.setItem(postId + '_reading', readingCount);

    // Like count
    var likeCount = parseInt(localStorage.getItem(postId + '_likes')) || 0;

    statsContainer.innerHTML =
      '<span>Words: ' + wordCount + '</span>' +
      '<span>Reads: ' + readingCount + '</span>' +
      '<span>' +
        '<button class="like-btn" onclick="toggleLike(this)" data-post-id="' + postId + '">' +
          '<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' +
          '<span class="like-count">' + likeCount + '</span>' +
        '</button>' +
      '</span>';
  }

  // ============================================
  // Toggle Like
  // ============================================
  window.toggleLike = function (btn) {
    var postId = btn.getAttribute('data-post-id');
    var likeCountEl = btn.querySelector('.like-count');
    var likes = parseInt(localStorage.getItem(postId + '_likes')) || 0;

    if (btn.classList.contains('liked')) {
      likes = Math.max(0, likes - 1);
      btn.classList.remove('liked');
    } else {
      likes++;
      btn.classList.add('liked');
    }

    localStorage.setItem(postId + '_likes', likes);
    likeCountEl.textContent = likes;
  };

  // ============================================
  // Post Navigation (Prev/Next)
  // ============================================
  async function setupPostNavigation(currentFilename) {
    var posts = await loadPostsList();
    var navContainer = document.getElementById('post-nav');
    if (!navContainer || posts.length <= 1) return;

    var currentIndex = posts.findIndex(function (p) { return p.file === currentFilename; });
    if (currentIndex === -1) return;

    var html = '';

    // Previous post
    if (currentIndex < posts.length - 1) {
      var prev = posts[currentIndex + 1];
      html += '<a href="post.html?file=' + encodeURIComponent(prev.file) + '" class="prev-post">';
      html += '<span class="nav-label">&larr; Previous</span>';
      html += escapeHtml(prev.title);
      html += '</a>';
    } else {
      html += '<div></div>';
    }

    // Next post
    if (currentIndex > 0) {
      var next = posts[currentIndex - 1];
      html += '<a href="post.html?file=' + encodeURIComponent(next.file) + '" class="next-post">';
      html += '<span class="nav-label">Next &rarr;</span>';
      html += escapeHtml(next.title);
      html += '</a>';
    } else {
      html += '<div></div>';
    }

    navContainer.innerHTML = html;
  }

  // ============================================
  // Initialize
  // ============================================
  document.addEventListener('DOMContentLoaded', function () {
    // Init theme
    initTheme();

    // Theme toggle button
    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    // Determine page type
    var isPostPage = document.getElementById('post-content') !== null;
    var isIndexPage = document.getElementById('post-list') !== null;

    if (isPostPage) {
      renderPostPage();
    } else if (isIndexPage) {
      renderIndexPage();
    }
  });
})();