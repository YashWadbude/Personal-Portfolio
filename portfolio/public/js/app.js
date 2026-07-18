/* app.js — renders the whole site from /api/config.
   To add/remove a skill, cert, education entry, or project, edit data/config.json.
   No HTML/CSS/JS changes needed for content edits. */

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  const sevOrder = ['critical', 'high', 'medium', 'low', 'info'];
  const sevWidth = { critical: '95%', high: '78%', medium: '58%', low: '38%', info: '20%' };
  const sevLabel = { critical: 'critical', high: 'high', medium: 'medium', low: 'low', info: 'info' };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- boot: load config, then render everything ---------- */
  async function boot() {
    let cfg;
    try {
      const res = await fetch('/api/config');
      if (!res.ok) throw new Error('bad response');
      cfg = await res.json();
    } catch (err) {
      console.error('Could not load site config:', err);
      $('#terminalBodyContent').innerHTML = '<span class="line out-cmd">$ whoami</span><span class="line out-muted">error: could not reach /api/config — is the server running?</span>';
      return;
    }

    renderProfile(cfg.profile || {});
    runTerminal(cfg.profile || {});
    renderSkills(cfg.skillCategories || cfg.skills || []);
    renderCerts(cfg.certifications || []);
    renderEducation(cfg.education || []);
    loadProjects(cfg.profile || {}, cfg.projectsFallback || []);
    wireResumeButtons(cfg.profile || {});
    wireFeedbackForm();
    wireNav();

    $('#footerYear').textContent = new Date().getFullYear();
  }

  /* ---------- profile / hero / about ---------- */
  function renderProfile(p) {
    document.title = `${p.name || 'Portfolio'} — ${p.title || 'Penetration Tester'}`;
    $('#navName').textContent = (p.name || 'whoami').toLowerCase().replace(/\s+/g, '_');
    $('#footerName').textContent = p.name || 'EDIT_ME Your Name';

    const img = $('#profileImage');
    img.src = p.profileImage || 'assets/profile.jpg';
    img.alt = p.name ? `Photo of ${p.name}` : 'Profile photo';

    const chip = $('#availabilityChip');
    if (chip) {
      if (p.availableForWork === false) {
        chip.textContent = 'not available';
        chip.classList.add('unavailable');
      } else {
        chip.textContent = 'available for work';
      }
    }

    const aboutBio = $('#aboutBio');
    if (aboutBio) {
      aboutBio.textContent = p.bio || 'Add a bio in data/config.json.';
    }

    const meta = [];
    if (p.location) meta.push(['location', p.location, null]);
    if (p.email) meta.push(['email', p.email, `mailto:${p.email}`]);
    if (p.githubUsername) meta.push(['github', '@' + p.githubUsername, `https://github.com/${p.githubUsername}`]);
    if (p.linkedin) meta.push(['linkedin', 'profile', p.linkedin]);
    if (p.twitter) meta.push(['x / twitter', 'profile', p.twitter]);

    const aboutMeta = $('#aboutMeta');
    if (aboutMeta) {
      aboutMeta.innerHTML = meta.map(([k, v, href]) => `
        <li>
          <span class="k">${escapeHtml(k)}</span>
          ${href ? `<a class="v" href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(v)}</a>` : `<span class="v">${escapeHtml(v)}</span>`}
        </li>
      `).join('');
    }
  }

  /* ---------- hero terminal typewriter ---------- */
  function runTerminal(p) {
    const body = $('#terminalBodyContent');
    const name = p.name || 'EDIT_ME Your Name';
    const title = p.title || 'Penetration Tester & Ethical Hacker';
    const tagline = p.tagline || 'I break things on purpose, then tell you how to fix them.';
    const bio = p.bio || 'Aspiring cybersecurity professional building hands-on skills and security-focused projects.';
    const linkedin = p.linkedin || '';

    const script = [
      { text: 'whoami --target=self', cls: 'out-cmd', pause: 250 },
      { text: name, cls: 'out-name', pause: 200 },
      { text: title, cls: 'out-title', pause: 150 },
      //{ text: '', cls: '', pause: 10 },
      // { text: `$ cat about.txt`, cls: 'out-cmd', pause: 250 },
      { text: bio, cls: 'out-muted', pause: 120 },
      //{ text: '', cls: '', pause: 10 },
      // { text: `$ cat profile.links`, cls: 'out-cmd', pause: 250 },
      // { text: linkedin ? 'linkedin: connected' : 'linkedin: not provided', cls: 'out-muted', pause: 0 },
    ];

    body.innerHTML = '';
    let i = 0;

    function typeLine(lineObj, onDone) {
      const el = document.createElement('div');
      el.className = `line ${lineObj.cls}`;
      body.appendChild(el);

      if (!lineObj.text) { onDone(); return; }

      let ci = 0;
      const speed = lineObj.cls === 'out-cmd' ? 22 : 10;
      const timer = setInterval(() => {
        el.textContent = lineObj.text.slice(0, ci + 1);
        ci++;
        if (ci >= lineObj.text.length) {
          clearInterval(timer);
          setTimeout(onDone, lineObj.pause);
        }
      }, speed);
    }

    function next() {
      if (i >= script.length) {
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        body.appendChild(cursor);

        if (linkedin) {
          const link = document.createElement('a');
          link.href = linkedin;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.className = 'terminal-link';

          link.innerHTML = `
        <img 
          src="https://static.vecteezy.com/system/resources/previews/018/930/480/non_2x/linkedin-logo-linkedin-icon-transparent-free-png.png"
          class="linkedin-logo"
          alt="LinkedIn"
        >
      `;

          link.setAttribute('aria-label', 'Visit LinkedIn profile');
          body.appendChild(link);
        }

        return;
      }

      typeLine(script[i], next);
      i++;
    }

    next();
  }

  /* ---------- skills ---------- */
  function getSkillLogo(name) {
    const normalized = String(name || '').trim().toLowerCase();
    if (!normalized) return null;

    const logoMap = {
      'kali linux': 'assets/kali.webp',
      'vmware workstation': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Vmware_workstation_16_icon.svg/1280px-Vmware_workstation_16_icon.svg.png',
      'windows 10': 'https://redmondmag.com/-/media/ECG/redmondmag/Images/introimages2014/152101REDSchwartzWin10.jpg',
      'burp suite': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/BurpSuite_logo.svg/1280px-BurpSuite_logo.svg.png',
      'nmap': 'https://networkwalks.com/wp-content/uploads/2021/06/Nmap-practice-lab1.png',
      'metasploit': 'https://assets.tryhackme.com/img/modules/metasploit.png',
      'sqlmap': 'https://cdn-images.tryhackme.com/room-icons/523723e4d3b75b6439b8e2cd0fa6880b.png',
      'hydra': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLb-WeTbUcFezS3x1ZL_isOsQVeBsHFXn0mwer88u0omr87x3T-uBMOkId&s=10',
      'owasp zap': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRw1b36bmPjVy-PU7zIJ_kmkXkOWzhH3bjMqgYrjXeF8BhX99-x6xa6tAk&s=10',
      'java': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
      'python': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
      'mysql': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
      'bash': 'https://preview.redd.it/i-made-a-frontal-version-of-the-bash-icon-for-better-v0-a3s16nut3ylc1.png?auto=webp&s=bd8de3f7a1e2eb3cab88b15388b0f635f9ae1300',
      'github': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',
      'linux': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',
    };

    return logoMap[normalized] || null;
  }

  function getSkillInitials(name) {
    return String(name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || '•';
  }

  function renderSkills(skills) {
    const list = $('#skillsList');

    const groups = [];
    if (Array.isArray(skills) && skills.length) {
      skills.forEach((entry) => {
        if (entry && Array.isArray(entry.items)) {
          groups.push({
            title: entry.title || 'Skills',
            items: (entry.items || []).map((item) => typeof item === 'string' ? item : item.name || '').filter(Boolean)
          });
        } else if (typeof entry === 'string' && entry.trim()) {
          groups.push({ title: 'Skills', items: [entry] });
        } else if (entry && entry.name) {
          groups.push({ title: 'Skills', items: [entry.name] });
        }
      });
    }

    if (!groups.length) {
      list.innerHTML = '<div class="skill-group"><div class="skill-group-head"><h3>Add skills in data/config.json</h3></div></div>';
      return;
    }

    list.innerHTML = `
      <div class="skill-group">
        ${groups.map((group) => `
          <div class="skill-group-section">
            <div class="skill-group-head">
              <h3>${escapeHtml(group.title || 'Skills')}</h3>
            </div>
            <div class="skill-pills">
              ${group.items.map((label) => {
      const logo = getSkillLogo(label);
      return `
                  <div class="skill-pill" title="${escapeHtml(label)}">
                    <span class="skill-pill-logo">
                      ${logo ? `<img src="${escapeHtml(logo)}" alt="" loading="lazy">` : `<span class="skill-pill-icon">${escapeHtml(getSkillInitials(label))}</span>`}
                    </span>
                  </div>`;
    }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ---------- certifications ---------- */
  function renderCerts(certs) {
    const list = $('#certList');
    if (!certs.length) {
      list.innerHTML = '<li class="cert-item"><span class="cert-name">Add certifications in data/config.json</span></li>';
      return;
    }
    list.innerHTML = certs.map((c) => `
      <li class="cert-item">
        <div class="cert-main">
          <span class="cert-name">${escapeHtml(c.name)}</span>
          <span class="cert-issuer">${escapeHtml(c.issuer || '')}</span>
        </div>
        <div class="cert-right">
          <span class="cert-year">${escapeHtml(c.year || '')}</span>
          ${c.credentialUrl ? `<a class="cert-link" href="${escapeHtml(c.credentialUrl)}" target="_blank" rel="noopener">verify →</a>` : ''}
        </div>
      </li>`).join('');
  }

  /* ---------- education ---------- */
  function renderEducation(edu) {
    const list = $('#eduList');
    if (!edu.length) {
      list.innerHTML = '<li class="edu-item"><span class="edu-degree">Add education in data/config.json</span></li>';
      return;
    }
    list.innerHTML = edu.map((e) => `
      <li class="edu-item">
        <div class="edu-degree">${escapeHtml(e.degree)}</div>
        <div class="edu-inst">${escapeHtml(e.institution || '')}</div>
        <div class="edu-duration">${escapeHtml(e.duration || '')}</div>
        ${e.details ? `<div class="edu-details">${escapeHtml(e.details)}</div>` : ''}
      </li>`).join('');
  }

  /* ---------- projects: live from GitHub, falling back to config ---------- */
  async function loadProjects(profile, fallback) {
    const grid = $('#projectsGrid');
    const status = $('#projectsStatus');
    const username = profile.githubUsername && !profile.githubUsername.startsWith('EDIT_ME') ? profile.githubUsername : null;

    if (!username) {
      renderProjects(fallback, grid);
      status.textContent = '';
      return;
    }

    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`);
      if (!res.ok) throw new Error('GitHub API error ' + res.status);
      const repos = await res.json();
      if (!Array.isArray(repos)) throw new Error('unexpected GitHub response');

      const cleaned = repos
        .filter((r) => !r.fork)
        .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.pushed_at) - new Date(a.pushed_at)))
        .slice(0, 9)
        .map((r) => ({
          name: r.name,
          description: r.description || 'No description provided yet.',
          url: r.html_url,
          language: r.language,
          stars: r.stargazers_count,
        }));

      if (!cleaned.length) throw new Error('no public repos');
      renderProjects(cleaned, grid, true);
      status.textContent = `Live from github.com/${username} — ${cleaned.length} repositories shown.`;
    } catch (err) {
      console.warn('Falling back to projectsFallback:', err);
      renderProjects(fallback, grid);
      status.textContent = 'Could not reach the GitHub API right now — showing saved fallback projects.';
    }
  }

  function renderProjects(projects, grid, live) {
    if (!projects.length) {
      grid.innerHTML = '<div class="project-card"><span class="project-desc">No projects yet — add some in data/config.json.</span></div>';
      return;
    }
    grid.innerHTML = projects.map((p) => `
      <article class="project-card">
        <div class="project-card-top">
          <span class="project-name">${escapeHtml(p.name)}</span>
        </div>
        <p class="project-desc">${escapeHtml(p.description || '')}</p>
        <div class="project-meta">
          ${p.language ? `<span><span class="project-lang-dot"></span>${escapeHtml(p.language)}</span>` : ''}
          ${live && typeof p.stars === 'number' ? `<span>★ ${p.stars}</span>` : ''}
        </div>
        <a class="project-link" href="${escapeHtml(p.url)}" target="_blank" rel="noopener">View Project</a>
      </article>`).join('');
  }

  /* ---------- resume button + modal ---------- */
  function wireResumeButtons(profile) {
    const resumeUrl = profile.resumeFile || 'assets/resume.pdf';
    const modal = $('#resumeModal');
    const frame = $('#resumeFrame');
    const backdrop = $('#resumeModalBackdrop');
    const closeBtn = $('#resumeModalClose');
    const downloadLink = $('#resumeDownloadLink');

    downloadLink.href = resumeUrl;

    function open() {
      frame.src = `${resumeUrl}#view=FitH&toolbar=1&navpanes=1&scrollbar=1`;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
    }
    function close() {
      modal.hidden = true;
      frame.src = '';
      document.body.style.overflow = '';
    }

    $('#resumeBtnNav').addEventListener('click', (e) => { e.preventDefault(); open(); });
    backdrop.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });
  }

  /* ---------- feedback form ---------- */
  function wireFeedbackForm() {
    const form = $('#feedbackForm');
    const status = $('#fbStatus');
    const submitBtn = $('#fbSubmit');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = '';
      status.className = 'form-status';

      const payload = {
        name: $('#fbName').value.trim(),
        email: $('#fbEmail').value.trim(),
        message: $('#fbMessage').value.trim(),
      };

      if (!payload.name || !payload.email || !payload.message) {
        status.textContent = 'Please fill in every field.';
        status.classList.add('err');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong.');

        status.textContent = data.message || 'Message sent — thank you.';
        status.classList.add('ok');
        form.reset();
      } catch (err) {
        status.textContent = err.message || 'Could not send your message. Try again shortly.';
        status.classList.add('err');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
      }
    });
  }

  /* ---------- nav ---------- */
  function wireNav() {
    const toggle = $('#navToggle');
    const links = $('#navLinks');
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a:not(#resumeBtnNav)').forEach((a) => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
