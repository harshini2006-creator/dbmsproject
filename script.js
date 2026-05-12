// =============================================================================
// API INTEGRATION LAYER
// =============================================================================
const API = 'http://localhost:4000/api';

function apiGet(path) {
  var token = localStorage.getItem('token');
  return fetch(API + path, { headers: token ? { 'Authorization': 'Bearer ' + token } : {} })
    .then(function(r) { return r.json(); });
}

function apiPost(path, body) {
  var token = localStorage.getItem('token');
  return fetch(API + path, {
    method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { 'Authorization': 'Bearer ' + token } : {}),
    body: JSON.stringify(body)
  }).then(function(r) { return r.json(); });
}

// =============================================================================
// DB TABLES (simulated as in-memory JS objects)
// =============================================================================

// TABLE: users
const db_users = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "User",    password: "pass123", created_at: "2026-01-10" },
  { id: 2, name: "Bob Smith",     email: "bob@example.com",   role: "Judge",   password: "pass123", expertise: "AI & ML", created_at: "2026-01-12" },
  { id: 3, name: "Carol White",   email: "carol@example.com", role: "Organizer", password: "pass123", org: "TechCorp Inc.", created_at: "2026-01-15" },
];

// TABLE: hackathons
const db_hackathons = [
  { id: 1, title: "AI Innovation Challenge", theme: "Artificial Intelligence", date: "June 15-17, 2026", location: "Online",             prize: "$10,000", status: "upcoming", participants: 320, tags: ["AI","ML","Python"],       description: "Build AI-powered solutions that address real-world problems.", organizer_id: 3 },
  { id: 2, title: "GreenTech Hackathon",     theme: "Sustainability",          date: "May 20-22, 2026",  location: "New York, USA",       prize: "$8,000",  status: "ongoing",  participants: 210, tags: ["CleanTech","IoT","Web"],  description: "Create tech solutions for climate change and sustainability.",  organizer_id: 3 },
  { id: 3, title: "HealthHack 2026",         theme: "Healthcare",              date: "April 10-12, 2026",location: "San Francisco, USA",  prize: "$15,000", status: "past",     participants: 450, tags: ["Health","Data","Mobile"], description: "Innovate in digital health, telemedicine, and patient care.",  organizer_id: 3 },
  { id: 4, title: "FinTech Frontier",        theme: "Finance & Blockchain",    date: "July 5-7, 2026",   location: "London, UK",          prize: "$20,000", status: "upcoming", participants: 180, tags: ["Blockchain","Finance"],   description: "Reimagine financial services with blockchain and DeFi.",        organizer_id: 3 },
  { id: 5, title: "EduTech Sprint",          theme: "Education",               date: "May 28-30, 2026",  location: "Online",              prize: "$5,000",  status: "upcoming", participants: 95,  tags: ["EdTech","UX","React"],   description: "Design tools that make learning more accessible.",             organizer_id: 3 },
  { id: 6, title: "CyberShield CTF",         theme: "Cybersecurity",           date: "March 1-3, 2026",  location: "Berlin, Germany",     prize: "$12,000", status: "past",     participants: 275, tags: ["Security","CTF"],        description: "Capture the flag competition for ethical hacking.",            organizer_id: 3 },
];

// TABLE: teams
const db_teams = [
  { id: 1, hackathon_id: 3, name: "NeuralNinjas",  lead: "Alice Johnson", size: 4, tech: "Python, TensorFlow, React" },
  { id: 2, hackathon_id: 3, name: "GreenBytes",    lead: "David Lee",     size: 3, tech: "Node.js, IoT, MongoDB" },
  { id: 3, hackathon_id: 3, name: "HealthFirst",   lead: "Sara Kim",      size: 4, tech: "Flutter, Firebase, ML" },
  { id: 4, hackathon_id: 6, name: "CipherCrew",    lead: "Mike Chen",     size: 2, tech: "Python, Kali Linux" },
  { id: 5, hackathon_id: 6, name: "ByteBreakers",  lead: "Priya Nair",    size: 3, tech: "C++, Wireshark, Metasploit" },
];

// TABLE: team_members
const db_team_members = [
  { id: 1, team_id: 1, user_name: "Alice Johnson", role: "Team Lead" },
  { id: 2, team_id: 1, user_name: "Tom Brown",     role: "Backend Dev" },
  { id: 3, team_id: 1, user_name: "Lisa Park",     role: "ML Engineer" },
  { id: 4, team_id: 1, user_name: "James Wu",      role: "Frontend Dev" },
  { id: 5, team_id: 2, user_name: "David Lee",     role: "Team Lead" },
  { id: 6, team_id: 2, user_name: "Emma Davis",    role: "IoT Specialist" },
  { id: 7, team_id: 2, user_name: "Ryan Scott",    role: "Backend Dev" },
];

// TABLE: registrations
const db_registrations = [
  { id: 1, user_id: 1, hackathon_id: 3, team_id: 1, registered_at: "2026-03-01", status: "confirmed" },
  { id: 2, user_id: 1, hackathon_id: 6, team_id: 4, registered_at: "2026-02-10", status: "confirmed" },
];

// TABLE: submissions
const db_submissions = [
  { id: 1, team_id: 1, hackathon_id: 3, title: "MediScan AI",       description: "AI-powered diagnostic tool for early disease detection using medical imaging.", repo_url: "https://github.com/neuralninja/mediscan", demo_url: "https://mediscan.demo.com", tech: "Python, TensorFlow, React", submitted_at: "2026-04-12", status: "evaluated" },
  { id: 2, team_id: 2, hackathon_id: 3, title: "EcoTrack",          description: "Real-time environmental monitoring platform using IoT sensors.", repo_url: "https://github.com/greenbytes/ecotrack", demo_url: "", tech: "Node.js, MQTT, MongoDB", submitted_at: "2026-04-12", status: "evaluated" },
  { id: 3, team_id: 3, hackathon_id: 3, title: "PatientBridge",     description: "Telemedicine app connecting rural patients with urban specialists.", repo_url: "https://github.com/healthfirst/patientbridge", demo_url: "https://patientbridge.app", tech: "Flutter, Firebase", submitted_at: "2026-04-12", status: "evaluated" },
  { id: 4, team_id: 4, hackathon_id: 6, title: "VaultBreaker",      description: "Advanced CTF challenge solver with automated exploit generation.", repo_url: "https://github.com/ciphercrew/vaultbreaker", demo_url: "", tech: "Python, Metasploit", submitted_at: "2026-03-03", status: "evaluated" },
  { id: 5, team_id: 5, hackathon_id: 6, title: "NetSentinel",       description: "Network intrusion detection system with real-time alerting.", repo_url: "https://github.com/bytebreakers/netsentinel", demo_url: "", tech: "C++, Wireshark", submitted_at: "2026-03-03", status: "evaluated" },
];

// TABLE: evaluation_criteria
const db_evaluation_criteria = [
  { id: 1, hackathon_id: 3, name: "Innovation",      description: "How novel and creative is the solution?",         max_score: 10 },
  { id: 2, hackathon_id: 3, name: "Technical Depth", description: "Quality and complexity of the implementation.",   max_score: 10 },
  { id: 3, hackathon_id: 3, name: "Impact",          description: "Potential real-world impact of the solution.",    max_score: 10 },
  { id: 4, hackathon_id: 3, name: "Presentation",    description: "Clarity of demo and documentation.",             max_score: 10 },
  { id: 5, hackathon_id: 6, name: "Exploit Quality", description: "Sophistication of the exploit technique.",       max_score: 10 },
  { id: 6, hackathon_id: 6, name: "Defense Strategy",description: "Quality of defensive countermeasures proposed.", max_score: 10 },
  { id: 7, hackathon_id: 6, name: "Documentation",   description: "Write-up quality and reproducibility.",          max_score: 10 },
];

// TABLE: results (evaluations per submission)
const db_results = [
  { id: 1, submission_id: 1, judge_id: 2, scores: { "Innovation": 9, "Technical Depth": 8, "Impact": 9, "Presentation": 8 }, total: 34, feedback: "Excellent use of ML for diagnostics. Very impactful." },
  { id: 2, submission_id: 2, judge_id: 2, scores: { "Innovation": 7, "Technical Depth": 8, "Impact": 8, "Presentation": 7 }, total: 30, feedback: "Solid IoT implementation. Good real-world applicability." },
  { id: 3, submission_id: 3, judge_id: 2, scores: { "Innovation": 8, "Technical Depth": 7, "Impact": 9, "Presentation": 8 }, total: 32, feedback: "Great social impact. UI could be more polished." },
  { id: 4, submission_id: 4, judge_id: 2, scores: { "Exploit Quality": 9, "Defense Strategy": 8, "Documentation": 9 }, total: 26, feedback: "Impressive exploit chain. Well documented." },
  { id: 5, submission_id: 5, judge_id: 2, scores: { "Exploit Quality": 8, "Defense Strategy": 9, "Documentation": 8 }, total: 25, feedback: "Strong defensive approach. Good network analysis." },
];

// TABLE: winners / prizes
const db_winners = [
  { id: 1, hackathon_id: 3, rank: 1, team_id: 1, team_name: "NeuralNinjas",  project: "MediScan AI",    prize: "$7,500",  medal: "gold" },
  { id: 2, hackathon_id: 3, rank: 2, team_id: 3, team_name: "HealthFirst",   project: "PatientBridge",  prize: "$4,500",  medal: "silver" },
  { id: 3, hackathon_id: 3, rank: 3, team_id: 2, team_name: "GreenBytes",    project: "EcoTrack",       prize: "$3,000",  medal: "bronze" },
  { id: 4, hackathon_id: 6, rank: 1, team_id: 4, team_name: "CipherCrew",    project: "VaultBreaker",   prize: "$6,000",  medal: "gold" },
  { id: 5, hackathon_id: 6, rank: 2, team_id: 5, team_name: "ByteBreakers",  project: "NetSentinel",    prize: "$4,000",  medal: "silver" },
];

// TABLE: leaderboard (aggregated scores)
const db_leaderboard = [
  { rank: 1, team_name: "NeuralNinjas",  hackathon: "HealthHack 2026",  score: 34, project: "MediScan AI",    members: 4 },
  { rank: 2, team_name: "HealthFirst",   hackathon: "HealthHack 2026",  score: 32, project: "PatientBridge",  members: 4 },
  { rank: 3, team_name: "GreenBytes",    hackathon: "HealthHack 2026",  score: 30, project: "EcoTrack",       members: 3 },
  { rank: 4, team_name: "CipherCrew",    hackathon: "CyberShield CTF",  score: 26, project: "VaultBreaker",   members: 2 },
  { rank: 5, team_name: "ByteBreakers",  hackathon: "CyberShield CTF",  score: 25, project: "NetSentinel",    members: 3 },
];

// TABLE: announcements
const db_announcements = [
  { id: 1, hackathon_id: 1, title: "AI Innovation Challenge is now open!", body: "Registration is open for the AI Innovation Challenge. Teams of up to 5 can register. Prize pool is $10,000.", type: "update", pinned: true,  date: "May 1, 2026",  author: "TechCorp Inc." },
  { id: 2, hackathon_id: 2, title: "GreenTech Hackathon has started!",     body: "The GreenTech Hackathon is now live. Submissions close on May 22nd at 11:59 PM EST. Good luck to all teams!", type: "alert",  pinned: true,  date: "May 20, 2026", author: "EcoFoundation" },
  { id: 3, hackathon_id: 3, title: "HealthHack 2026 - Results Announced",  body: "Congratulations to NeuralNinjas for winning HealthHack 2026 with MediScan AI! Full results are now available.", type: "update", pinned: false, date: "Apr 14, 2026", author: "MedTech Alliance" },
  { id: 4, hackathon_id: 4, title: "FinTech Frontier - Registration Open", body: "FinTech Frontier registration is now open. This year's theme focuses on DeFi and open banking. Register your team today.", type: "update", pinned: false, date: "May 5, 2026",  author: "BlockVentures" },
  { id: 5, hackathon_id: 6, title: "CyberShield CTF - Final Standings",    body: "CipherCrew takes the top spot in CyberShield CTF 2026! Full leaderboard and write-ups are now published.", type: "update", pinned: false, date: "Mar 5, 2026",  author: "SecureNet Labs" },
  { id: 6, hackathon_id: 2, title: "Submission Deadline Reminder",         body: "Only 24 hours left to submit your GreenTech project. Make sure your repo is public and demo link is working.", type: "alert",  pinned: false, date: "May 21, 2026", author: "EcoFoundation" },
];

// =============================================================================
// STATE
// =============================================================================
let currentUser = null;
let selectedRole = "";
let pendingRegistrationId = null;
let pendingSubmissionId = null;
let pendingEvalSubmissionId = null;
let notifications = [];

// =============================================================================
// INIT
// =============================================================================
window.onload = function () {
  // Load hackathons from API, fall back to local data
  apiGet('/hackathons').then(function(data) {
    if (Array.isArray(data) && data.length > 0) {
      // Map API fields to local field names
      db_hackathons = data.map(function(h) {
        return {
          id: h.hackathon_id,
          title: h.title,
          theme: h.description || '',
          date: (h.start_date || '') + (h.end_date ? ' - ' + h.end_date : ''),
          location: h.location || 'Online',
          prize: h.prize_pool || 'TBD',
          status: h.end_date && new Date(h.end_date) < new Date() ? 'past' : 'upcoming',
          participants: 0,
          tags: [],
          description: h.description || '',
          organizer_id: h.created_by,
          organizer_name: h.organizer_name || ''
        };
      });
    }
    renderHackathons("home-hackathon-grid", db_hackathons.slice(0, 3));
    renderHackathons("all-hackathon-grid", db_hackathons);
  }).catch(function() {
    renderHackathons("home-hackathon-grid", db_hackathons.slice(0, 3));
    renderHackathons("all-hackathon-grid", db_hackathons);
  });

  renderLeaderboard(db_leaderboard);
  renderResults();
  renderAnnouncements();
  updateMemberFields();

  // Restore session if token exists
  var token = localStorage.getItem('token');
  var savedUser = localStorage.getItem('currentUser');
  if (token && savedUser) {
    currentUser = JSON.parse(savedUser);
    // Normalize role
    if (currentUser.role) {
      currentUser.role = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1).toLowerCase();
    }
    updateAuthUI();
  }

  document.addEventListener("click", function (e) {
    const wrapper = document.getElementById("notif-wrapper");
    if (wrapper && !wrapper.contains(e.target)) {
      document.getElementById("notif-panel").classList.remove("open");
    }
  });
};

// =============================================================================
// PAGE NAVIGATION
// =============================================================================
function showPage(page) {
  document.querySelectorAll(".page").forEach(function(p) { p.classList.remove("active"); });
  document.getElementById("page-" + page).classList.add("active");
  if (page === "dashboard") renderDashboard();
  if (page === "leaderboard") renderLeaderboard(db_leaderboard);
  if (page === "results") renderResults();
  if (page === "announcements") renderAnnouncements();
}

// =============================================================================
// MODAL HELPERS
// =============================================================================
function openModal(id) { document.getElementById(id).classList.add("active"); }
function closeModal(id) { document.getElementById(id).classList.remove("active"); }
function closeModalOutside(e, id) { if (e.target.id === id) closeModal(id); }
function switchModal(from, to) { closeModal(from); openModal(to); }

// =============================================================================
// NOTIFICATIONS
// =============================================================================
function toggleNotifPanel() {
  document.getElementById("notif-panel").classList.toggle("open");
}

function addNotification(message, icon) {
  if (!icon) icon = "bell";
  var notif = { id: Date.now(), message: message, icon: icon, time: "Just now", unread: true };
  notifications.unshift(notif);
  renderNotifications();
}

function renderNotifications() {
  var list = document.getElementById("notif-list");
  var badge = document.getElementById("notif-badge");
  var unreadCount = notifications.filter(function(n) { return n.unread; }).length;
  if (unreadCount > 0) {
    badge.textContent = unreadCount > 9 ? "9+" : unreadCount;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
  if (notifications.length === 0) {
    list.innerHTML = '<div class="notif-empty">No notifications yet</div>';
    return;
  }
  list.innerHTML = notifications.map(function(n) {
    return '<div class="notif-item ' + (n.unread ? "unread" : "") + '" onclick="markRead(' + n.id + ')">' +
      '<div class="notif-icon">' + n.icon + '</div>' +
      '<div><div class="notif-text">' + n.message + '</div><div class="notif-time">' + n.time + '</div></div>' +
      '</div>';
  }).join("");
}

function markRead(id) {
  var n = notifications.find(function(x) { return x.id === id; });
  if (n) n.unread = false;
  renderNotifications();
}

function clearNotifications() {
  notifications.forEach(function(n) { n.unread = false; });
  renderNotifications();
}

// =============================================================================
// AUTH
// =============================================================================
function openSignupAs(role) { openModal("signupModal"); selectRole(role); }

function selectRole(role) {
  selectedRole = role;
  document.getElementById("selected-role-label").textContent = role;
  document.getElementById("signup-step-1").style.display = "none";
  document.getElementById("signup-step-2").style.display = "block";
  document.getElementById("org-field").style.display = role === "Organizer" ? "block" : "none";
  document.getElementById("judge-field").style.display = role === "Judge" ? "block" : "none";
}

function goBackToRoles() {
  document.getElementById("signup-step-1").style.display = "block";
  document.getElementById("signup-step-2").style.display = "none";
}

function handleSignup(e) {
  e.preventDefault();
  var name = document.getElementById("signup-name").value.trim();
  var email = document.getElementById("signup-email").value.trim();
  var password = document.getElementById("signup-password") ? document.getElementById("signup-password").value : "password123";
  apiPost('/auth/signup', { name: name, email: email, password: password, role: selectedRole,
    org: document.getElementById("signup-org").value || null,
    expertise: document.getElementById("signup-expertise").value || null
  }).then(function(data) {
    if (data.error) { showToast(data.error, "error"); return; }
    var role = data.user.role;
    role = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    currentUser = Object.assign({ registeredHackathons: [] }, data.user, { role: role });
    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    closeModal("signupModal");
    updateAuthUI();
    showToast("Welcome, " + name + "! Signed up as " + selectedRole + ".");
    addNotification("Welcome to HackHub, " + name + "! Your account is ready.", "celebration");
    document.getElementById("signupForm").reset();
    goBackToRoles();
  }).catch(function() {
    // fallback to local
    var newId = db_users.length + 1;
    var user = { id: newId, name: name, email: email, role: selectedRole, registeredHackathons: [], submissions: [], created_at: new Date().toLocaleDateString() };
    db_users.push(user);
    currentUser = user;
    closeModal("signupModal");
    updateAuthUI();
    showToast("Welcome, " + name + "! Signed up as " + selectedRole + ".");
    document.getElementById("signupForm").reset();
    goBackToRoles();
  });
}

function handleLogin(e) {
  e.preventDefault();
  var email = document.getElementById("login-email").value.trim();
  var password = document.getElementById("login-password") ? document.getElementById("login-password").value : "password123";
  apiPost('/auth/login', { email: email, password: password }).then(function(data) {
    if (data.error) { showToast(data.error, "error"); return; }
    // Normalize role to capitalized form
    var role = data.user.role;
    role = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    currentUser = Object.assign({ registeredHackathons: [] }, data.user, { role: role });
    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    closeModal("loginModal");
    updateAuthUI();
    showToast("Welcome back, " + currentUser.name + "!");
    addNotification("You logged in. Browse upcoming hackathons!", "wave");
    document.getElementById("loginForm").reset();
    // Load user's registrations
    apiGet('/registrations/my').then(function(regs) {
      if (Array.isArray(regs)) {
        currentUser.registeredHackathons = regs.map(function(r) { return r.hackathon_id; });
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    });
  }).catch(function() {
    var found = db_users.find(function(u) { return u.email === email; });
    currentUser = found ? Object.assign({ registeredHackathons: [], submissions: [] }, found)
      : { id: 99, name: email.split("@")[0], email: email, role: "User", registeredHackathons: [], submissions: [] };
    closeModal("loginModal");
    updateAuthUI();
    showToast("Welcome back, " + currentUser.name + "!");
    document.getElementById("loginForm").reset();
  });
}

function logout() {
  currentUser = null;
  notifications = [];
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  renderNotifications();
  updateAuthUI();
  showPage("home");
  showToast("You have been logged out.");
}

function updateAuthUI() {
  var loginBtn = document.querySelector(".nav-auth .btn-outline");
  var signupBtn = document.querySelector(".nav-auth .btn-primary");
  var userInfo = document.getElementById("user-info");
  var navDashboard = document.getElementById("nav-dashboard");
  var rolesSection = document.querySelector(".roles-section");
  if (currentUser) {
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    userInfo.style.display = "flex";
    document.getElementById("user-greeting").textContent = currentUser.name + " (" + currentUser.role + ")";
    navDashboard.style.display = "block";
    if (rolesSection) rolesSection.style.display = "none";
  } else {
    loginBtn.style.display = "inline-block";
    signupBtn.style.display = "inline-block";
    userInfo.style.display = "none";
    navDashboard.style.display = "none";
    if (rolesSection) rolesSection.style.display = "block";
  }
}


// =============================================================================
// HACKATHONS (db_hackathons table)
// =============================================================================
function renderHackathons(containerId, list) {
  var container = document.getElementById(containerId);
  if (!container) return;
  if (list.length === 0) { container.innerHTML = '<p class="empty-msg">No hackathons found.</p>'; return; }
  container.innerHTML = list.map(function(h) {
    var organizer = db_users.find(function(u) { return u.id === h.organizer_id; });
    var orgName = organizer ? organizer.org || organizer.name : "Unknown";
    return '<div class="hackathon-card" onclick="openHackathonDetail(' + h.id + ')">' +
      '<div class="card-header"><span class="status-badge status-' + h.status + '">' + capitalize(h.status) + '</span><span class="card-prize">' + h.prize + '</span></div>' +
      '<h3 class="card-title">' + h.title + '</h3>' +
      '<p class="card-theme">' + h.theme + '</p>' +
      '<div class="card-meta"><span>date ' + h.date + '</span><span>pin ' + h.location + '</span><span>people ' + h.participants + ' participants</span></div>' +
      '<div class="card-tags">' + h.tags.map(function(t) { return '<span class="tag">' + t + '</span>'; }).join("") + '</div>' +
      '<button class="btn-primary btn-sm card-cta" onclick="event.stopPropagation(); ' + (h.status === "past" ? "viewResults(" + h.id + ")" : "registerForHackathon(" + h.id + ")") + '">' +
      (h.status === "past" ? "View Results" : (currentUser && currentUser.role !== "User" ? "View Details" : "Register Now")) + '</button></div>';
  }).join("");
}

function filterHackathons(filter, btn) {
  document.querySelectorAll(".filter-btn").forEach(function(b) { b.classList.remove("active"); });
  btn.classList.add("active");
  var filtered = filter === "all" ? db_hackathons : db_hackathons.filter(function(h) { return h.status === filter; });
  renderHackathons("all-hackathon-grid", filtered);
}

function openHackathonDetail(id) {
  var h = db_hackathons.find(function(x) { return x.id === id; });
  if (!h) return;
  var organizer = db_users.find(function(u) { return u.id === h.organizer_id; });
  var orgName = organizer ? (organizer.org || organizer.name) : "Unknown";
  var teamCount = db_teams.filter(function(t) { return t.hackathon_id === id; }).length;
  var subCount = db_submissions.filter(function(s) { return s.hackathon_id === id; }).length;
  var criteria = db_evaluation_criteria.filter(function(c) { return c.hackathon_id === id; });
  document.getElementById("hackathon-detail-content").innerHTML =
    '<div class="detail-header"><span class="status-badge status-' + h.status + '">' + capitalize(h.status) + '</span><h2>' + h.title + '</h2><p class="card-theme">' + h.theme + '</p></div>' +
    '<p class="detail-desc">' + h.description + '</p>' +
    '<div class="detail-grid">' +
      '<div class="detail-item"><strong>Date</strong><span>' + h.date + '</span></div>' +
      '<div class="detail-item"><strong>Location</strong><span>' + h.location + '</span></div>' +
      '<div class="detail-item"><strong>Prize Pool</strong><span>' + h.prize + '</span></div>' +
      '<div class="detail-item"><strong>Participants</strong><span>' + h.participants + '</span></div>' +
      '<div class="detail-item"><strong>Teams</strong><span>' + teamCount + '</span></div>' +
      '<div class="detail-item"><strong>Submissions</strong><span>' + subCount + '</span></div>' +
      '<div class="detail-item"><strong>Organizer</strong><span>' + orgName + '</span></div>' +
    '</div>' +
    (criteria.length > 0 ? '<div style="margin-top:1.2rem"><strong style="font-size:0.85rem;color:var(--text-muted);text-transform:uppercase">Judging Criteria</strong><div class="card-tags" style="margin-top:0.5rem">' + criteria.map(function(c) { return '<span class="tag">' + c.name + ' /' + c.max_score + '</span>'; }).join("") + '</div></div>' : '') +
    '<div class="card-tags" style="margin-top:1rem">' + h.tags.map(function(t) { return '<span class="tag">' + t + '</span>'; }).join("") + '</div>' +
    (h.status !== "past"
      ? '<button class="btn-primary btn-full" style="margin-top:1.5rem" onclick="registerForHackathon(' + h.id + '); closeModal(\'hackathonModal\')">Register for this Hackathon</button>'
      : '<button class="btn-outline btn-full" style="margin-top:1.5rem" onclick="viewResults(' + h.id + '); closeModal(\'hackathonModal\')">View Results & Winners</button>');
  openModal("hackathonModal");
}

function viewResults(hackathonId) {
  showPage("results");
  setTimeout(function() {
    var el = document.getElementById("results-hackathon-" + hackathonId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, 100);
}

// =============================================================================
// REGISTRATIONS (db_registrations + db_teams + db_team_members tables)
// =============================================================================
function registerForHackathon(id) {
  if (!currentUser) { showToast("Please log in or sign up first.", "error"); openModal("signupModal"); return; }
  if (currentUser.role === "Judge") { showToast("Judges cannot register for hackathons.", "info"); return; }
  if (currentUser.role === "Organizer") { showToast("Organizers cannot register as participants.", "info"); return; }
  var h = db_hackathons.find(function(x) { return x.id === id; });
  if (!h) return;
  if (currentUser.registeredHackathons && currentUser.registeredHackathons.includes(id)) {
    showToast("Already registered for " + h.title + ".", "info"); return;
  }
  if (h.status === "past") { showToast("This hackathon has already ended.", "info"); return; }
  pendingRegistrationId = id;
  document.getElementById("reg-hackathon-name").textContent = "pin " + h.title;
  document.getElementById("reg-contact").value = currentUser.email || "";
  document.getElementById("registerForm").reset();
  document.getElementById("reg-contact").value = currentUser.email || "";
  updateMemberFields();
  openModal("registerModal");
}

function handleRegistration(e) {
  e.preventDefault();
  var h = db_hackathons.find(function(x) { return x.id === pendingRegistrationId; });
  if (!h) return;
  var teamName = document.getElementById("reg-team-name").value.trim();
  var projectTitle = document.getElementById("reg-project-title").value.trim();
  var tech = document.getElementById("reg-tech").value.trim();
  var memberInputs = document.querySelectorAll("#member-fields input");
  var members = [];
  memberInputs.forEach(function(inp, i) { if (inp.value.trim()) members.push({ user_name: inp.value.trim(), role: i === 0 ? "Team Lead" : "Member" }); });
  var newTeamId = db_teams.length + 1;
  var newTeam = { id: newTeamId, hackathon_id: pendingRegistrationId, name: teamName, lead: currentUser.name, size: members.length, tech: tech };
  db_teams.push(newTeam);
  members.forEach(function(m, i) { db_team_members.push({ id: db_team_members.length + 1, team_id: newTeamId, user_name: m.user_name, role: m.role }); });
  var newReg = { id: db_registrations.length + 1, user_id: currentUser.id, hackathon_id: pendingRegistrationId, team_id: newTeamId, registered_at: new Date().toLocaleDateString(), status: "confirmed" };
  db_registrations.push(newReg);
  if (!currentUser.registeredHackathons) currentUser.registeredHackathons = [];
  currentUser.registeredHackathons.push(pendingRegistrationId);
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  // Save to API
  apiPost('/registrations', { hackathon_id: pendingRegistrationId }).catch(function() {});
  apiPost('/teams', { hackathon_id: pendingRegistrationId, team_name: teamName, members: members }).catch(function() {});

  closeModal("registerModal");
  showToast('Team "' + teamName + '" registered for ' + h.title + '!');
  addNotification('Team "' + teamName + '" registered for ' + h.title + '. Good luck! rocket', "check");
  addNotification('Reminder: ' + h.title + ' starts ' + h.date + '. Project: "' + projectTitle + '"', "calendar");
  pendingRegistrationId = null;
}

function updateMemberFields() {
  var sizeEl = document.getElementById("reg-team-size");
  var size = sizeEl ? (parseInt(sizeEl.value) || 4) : 4;
  var container = document.getElementById("member-fields");
  if (!container) return;
  container.innerHTML = "";
  for (var i = 1; i <= size; i++) {
    container.innerHTML += '<div class="team-member-row"><input type="text" placeholder="Member ' + i + ' full name' + (i === 1 ? " (Team Lead)" : "") + '"' + (i === 1 ? " required" : "") + '></div>';
  }
}

function addMemberField() {
  var container = document.getElementById("member-fields");
  var count = container.querySelectorAll(".team-member-row").length + 1;
  if (count > 8) { showToast("Maximum 8 members allowed.", "info"); return; }
  var row = document.createElement("div");
  row.className = "team-member-row";
  row.innerHTML = '<input type="text" placeholder="Member ' + count + ' full name"><button type="button" class="remove-member" onclick="this.parentElement.remove()">x</button>';
  container.appendChild(row);
}


// =============================================================================
// SUBMISSIONS (db_submissions + db_evaluation_criteria tables)
// =============================================================================
function openSubmissionModal(hackathonId) {
  if (!currentUser) { showToast("Please log in first.", "error"); openModal("signupModal"); return; }
  var h = db_hackathons.find(function(x) { return x.id === hackathonId; });
  if (!h) return;
  pendingSubmissionId = hackathonId;
  document.getElementById("sub-hackathon-name").textContent = "pin " + h.title;
  var criteria = db_evaluation_criteria.filter(function(c) { return c.hackathon_id === hackathonId; });
  var checksHtml = criteria.length > 0
    ? criteria.map(function(c) { return '<label class="criteria-check"><input type="checkbox" value="' + c.id + '"> ' + c.name + '</label>'; }).join("")
    : '<p style="color:var(--text-muted);font-size:0.85rem">No specific criteria defined.</p>';
  document.getElementById("criteria-checks").innerHTML = checksHtml;
  document.getElementById("submissionForm").reset();
  document.getElementById("criteria-checks").innerHTML = checksHtml;
  openModal("submissionModal");
}

function handleSubmission(e) {
  e.preventDefault();
  var h = db_hackathons.find(function(x) { return x.id === pendingSubmissionId; });
  if (!h) return;
  var title = document.getElementById("sub-title").value.trim();
  var desc = document.getElementById("sub-desc").value.trim();
  var repo = document.getElementById("sub-repo").value.trim();
  var demo = document.getElementById("sub-demo").value.trim();
  var tech = document.getElementById("sub-tech").value.trim();
  var userTeam = db_teams.find(function(t) { return t.hackathon_id === pendingSubmissionId && t.lead === currentUser.name; });
  var teamId = userTeam ? userTeam.id : 0;
  var newSub = { id: db_submissions.length + 1, team_id: teamId, hackathon_id: pendingSubmissionId, title: title, description: desc, repo_url: repo, demo_url: demo, tech: tech, submitted_at: new Date().toLocaleDateString(), status: "submitted" };
  db_submissions.push(newSub);
  if (!currentUser.submissions) currentUser.submissions = [];
  currentUser.submissions.push(newSub.id);
  closeModal("submissionModal");
  showToast('Project "' + title + '" submitted successfully!');
  addNotification('Your project "' + title + '" has been submitted for ' + h.title + '.', "check");
  pendingSubmissionId = null;
}

// =============================================================================
// LEADERBOARD (db_leaderboard table)
// =============================================================================
function renderLeaderboard(data) {
  var container = document.getElementById("leaderboard-content");
  if (!container) return;
  var hackathonNames = [...new Set(data.map(function(r) { return r.hackathon; }))];
  var filterBar = document.getElementById("lb-filter-bar");
  if (filterBar) {
    filterBar.innerHTML = '<button class="filter-btn active" onclick="filterLeaderboard(\'all\', this)">All</button>' +
      hackathonNames.map(function(n) { return '<button class="filter-btn" onclick="filterLeaderboard(\'' + n.replace(/'/g, "\\'") + '\', this)">' + n + '</button>'; }).join("");
  }
  renderLeaderboardTable(data);
}

function filterLeaderboard(filter, btn) {
  document.querySelectorAll("#lb-filter-bar .filter-btn").forEach(function(b) { b.classList.remove("active"); });
  btn.classList.add("active");
  var filtered = filter === "all" ? db_leaderboard : db_leaderboard.filter(function(r) { return r.hackathon === filter; });
  renderLeaderboardTable(filtered);
}

function renderLeaderboardTable(data) {
  var container = document.getElementById("leaderboard-content");
  if (!container) return;
  var maxScore = data.length > 0 ? Math.max.apply(null, data.map(function(r) { return r.score; })) : 100;
  container.innerHTML = '<table class="lb-table"><thead><tr><th>Rank</th><th>Team</th><th>Project</th><th>Hackathon</th><th>Members</th><th>Score</th></tr></thead><tbody>' +
    data.map(function(r) {
      var rankClass = r.rank === 1 ? "rank-1" : r.rank === 2 ? "rank-2" : r.rank === 3 ? "rank-3" : "";
      var medal = r.rank === 1 ? "gold" : r.rank === 2 ? "silver" : r.rank === 3 ? "bronze" : "";
      var pct = Math.round((r.score / maxScore) * 100);
      return '<tr><td><span class="lb-rank ' + rankClass + '">' + medal + ' #' + r.rank + '</span></td>' +
        '<td><strong>' + r.team_name + '</strong></td>' +
        '<td>' + r.project + '</td>' +
        '<td><span class="tag">' + r.hackathon + '</span></td>' +
        '<td>' + r.members + '</td>' +
        '<td><div style="display:flex;align-items:center;gap:0.5rem"><div class="score-bar-wrap"><div class="score-bar" style="width:' + pct + '%"></div></div><strong>' + r.score + '</strong></div></td></tr>';
    }).join("") + '</tbody></table>';
}

// =============================================================================
// RESULTS & WINNERS (db_winners + db_results tables)
// =============================================================================
function renderResults() {
  var container = document.getElementById("results-content");
  if (!container) return;
  var pastHackathons = db_hackathons.filter(function(h) { return h.status === "past"; });
  if (pastHackathons.length === 0) { container.innerHTML = '<p class="empty-msg">No results available yet.</p>'; return; }
  container.innerHTML = pastHackathons.map(function(h) {
    var winners = db_winners.filter(function(w) { return w.hackathon_id === h.id; });
    var submissions = db_submissions.filter(function(s) { return s.hackathon_id === h.id; });
    var medalEmoji = { gold: "trophy", silver: "second_place", bronze: "third_place" };
    var borderColor = { gold: "#f59e0b", silver: "#9ca3af", bronze: "#b45309" };
    return '<div id="results-hackathon-' + h.id + '" style="margin-bottom:3rem">' +
      '<div class="results-section-title">' + h.title + ' <span class="tag">' + h.date + '</span></div>' +
      '<div class="winners-grid">' +
        winners.map(function(w) {
          return '<div class="winner-card" style="border-top-color:' + (borderColor[w.medal] || "var(--primary)") + '">' +
            '<div class="winner-medal">' + (w.medal === "gold" ? "trophy" : w.medal === "silver" ? "silver" : "bronze") + '</div>' +
            '<div class="winner-place">' + (w.rank === 1 ? "1st Place" : w.rank === 2 ? "2nd Place" : "3rd Place") + '</div>' +
            '<div class="winner-team">' + w.team_name + '</div>' +
            '<div class="winner-project">' + w.project + '</div>' +
            '<div class="winner-prize">' + w.prize + '</div></div>';
        }).join("") +
      '</div>' +
      (submissions.length > 0 ? '<div class="results-section-title" style="font-size:1rem">All Submissions</div>' +
        submissions.map(function(s) {
          var team = db_teams.find(function(t) { return t.id === s.team_id; });
          var result = db_results.find(function(r) { return r.submission_id === s.id; });
          return '<div class="submission-card">' +
            '<div class="sub-header"><span class="sub-title">' + s.title + '</span>' +
            (result ? '<strong style="color:var(--primary)">' + result.total + ' pts</strong>' : '<span class="status-badge status-upcoming">Pending</span>') + '</div>' +
            '<div class="sub-hackathon">' + (team ? team.name : "Unknown Team") + '</div>' +
            '<div class="sub-desc">' + s.description + '</div>' +
            '<div class="card-tags"><span class="tag">' + s.tech + '</span></div>' +
            (result ? '<div style="font-size:0.82rem;color:var(--text-muted);margin-top:0.5rem;font-style:italic">"' + result.feedback + '"</div>' : '') +
            '<div class="sub-links">' +
            (s.repo_url ? '<a href="' + s.repo_url + '" target="_blank">GitHub Repo</a>' : '') +
            (s.demo_url ? '<a href="' + s.demo_url + '" target="_blank">Live Demo</a>' : '') +
            '</div></div>';
        }).join("") : '') +
      '</div>';
  }).join("");
}

// =============================================================================
// ANNOUNCEMENTS (db_announcements table)
// =============================================================================
function renderAnnouncements() {
  var container = document.getElementById("announcements-content");
  if (!container) return;
  var sorted = db_announcements.slice().sort(function(a, b) { return b.pinned - a.pinned; });
  container.innerHTML = '<div class="announcement-list">' +
    sorted.map(function(a) {
      var h = db_hackathons.find(function(x) { return x.id === a.hackathon_id; });
      var hackName = h ? h.title : "General";
      var tagClass = a.type === "alert" ? "tag-alert" : "tag-update";
      return '<div class="announcement-card' + (a.pinned ? " pinned" : "") + '">' +
        '<div class="ann-header"><span class="ann-title">' + (a.pinned ? "pin " : "") + a.title + '</span><span class="ann-meta">' + a.date + '</span></div>' +
        '<div class="ann-body">' + a.body + '</div>' +
        '<span class="ann-tag ' + tagClass + '">' + capitalize(a.type) + '</span>' +
        '<span class="ann-tag" style="margin-left:0.3rem">' + hackName + '</span>' +
        '<span style="font-size:0.75rem;color:var(--text-muted);margin-left:0.5rem">by ' + a.author + '</span>' +
        '</div>';
    }).join("") + '</div>';
}

// =============================================================================
// JUDGE EVALUATION (API-based)
// =============================================================================
function openEvalModalApi(submissionId, hackathonId, projectTitle, teamName) {
  pendingEvalSubmissionId = submissionId;
  document.getElementById("eval-team-name").textContent = 'Evaluating: ' + projectTitle + ' by ' + teamName;

  // Load criteria from API for this hackathon
  apiGet('/evaluation-criteria?hackathon_id=' + hackathonId).then(function(criteria) {
    if (!Array.isArray(criteria) || criteria.length === 0) {
      document.getElementById("eval-criteria-list").innerHTML =
        '<p style="color:var(--text-muted);font-size:0.85rem">No specific criteria defined. Add a general score below.</p>' +
        '<div class="eval-criterion"><label>Overall Score</label><div class="score-input">' +
        '<input type="range" min="0" max="100" value="50" id="score-general" oninput="document.getElementById(\'val-general\').textContent=this.value">' +
        '<span class="score-val" id="val-general">50</span><span style="color:var(--text-muted);font-size:0.8rem">/100</span>' +
        '</div></div>';
    } else {
      document.getElementById("eval-criteria-list").innerHTML = criteria.map(function(c) {
        return '<div class="eval-criterion">' +
          '<label>' + c.criteria_name + '</label>' +
          '<div class="score-input">' +
          '<input type="range" min="0" max="' + c.max_score + '" value="' + Math.floor(c.max_score / 2) + '" id="score-' + c.criteria_id + '" oninput="document.getElementById(\'val-' + c.criteria_id + '\').textContent=this.value">' +
          '<span class="score-val" id="val-' + c.criteria_id + '">' + Math.floor(c.max_score / 2) + '</span>' +
          '<span style="color:var(--text-muted);font-size:0.8rem">/' + c.max_score + '</span>' +
          '</div></div>';
      }).join("");
    }
    // Store criteria for submission
    window._evalCriteria = criteria;
  });
  openModal("evalModal");
}

function handleEvaluation(e) {
  e.preventDefault();
  var criteria = window._evalCriteria || [];
  var scores = {};
  var total = 0;

  if (criteria.length === 0) {
    var val = parseInt(document.getElementById("score-general").value);
    scores["Overall"] = val; total = val;
  } else {
    criteria.forEach(function(c) {
      var el = document.getElementById("score-" + c.criteria_id);
      var val = el ? parseInt(el.value) : 0;
      scores[c.criteria_name] = val;
      total += val;
    });
  }

  var feedback = document.getElementById("eval-feedback").value.trim();

  apiPost('/results', {
    hackathon_id: window._evalHackathonId,
    team_id: window._evalTeamId,
    position: 0,
    remarks: feedback
  }).then(function(data) {
    if (data.error) { showToast(data.error, "error"); return; }
    closeModal("evalModal");
    showToast("Evaluation submitted! Total score: " + total);
    addNotification("Evaluation submitted. Score: " + total, "check");
    renderDashboard();
  }).catch(function() {
    closeModal("evalModal");
    showToast("Evaluation submitted! Total score: " + total);
    renderDashboard();
  });
  pendingEvalSubmissionId = null;
}

// =============================================================================
// JUDGE EVALUATION (legacy in-memory fallback)
function openEvalModal(submissionId) {
  var sub = db_submissions.find(function(x) { return x.id === submissionId; });
  if (!sub) return;
  var team = db_teams.find(function(t) { return t.id === sub.team_id; });
  var criteria = db_evaluation_criteria.filter(function(c) { return c.hackathon_id === sub.hackathon_id; });
  pendingEvalSubmissionId = submissionId;
  document.getElementById("eval-team-name").textContent = "Evaluating: " + sub.title + (team ? " by " + team.name : "");
  document.getElementById("eval-criteria-list").innerHTML = criteria.map(function(c) {
    return '<div class="eval-criterion">' +
      '<label>' + c.name + ' <span style="color:var(--text-muted);font-weight:400">(' + c.description + ')</span></label>' +
      '<div class="score-input">' +
      '<input type="range" min="0" max="' + c.max_score + '" value="5" id="score-' + c.id + '" oninput="document.getElementById(\'val-' + c.id + '\').textContent=this.value">' +
      '<span class="score-val" id="val-' + c.id + '">5</span><span style="color:var(--text-muted);font-size:0.8rem">/' + c.max_score + '</span>' +
      '</div></div>';
  }).join("");
  openModal("evalModal");
}

function handleEvaluation(e) {
  e.preventDefault();
  var sub = db_submissions.find(function(x) { return x.id === pendingEvalSubmissionId; });
  if (!sub) return;
  var criteria = db_evaluation_criteria.filter(function(c) { return c.hackathon_id === sub.hackathon_id; });
  var scores = {};
  var total = 0;
  criteria.forEach(function(c) {
    var val = parseInt(document.getElementById("score-" + c.id).value);
    scores[c.name] = val;
    total += val;
  });
  var feedback = document.getElementById("eval-feedback").value.trim();
  var newResult = { id: db_results.length + 1, submission_id: pendingEvalSubmissionId, judge_id: currentUser ? currentUser.id : 2, scores: scores, total: total, feedback: feedback };
  db_results.push(newResult);
  sub.status = "evaluated";
  closeModal("evalModal");
  showToast("Evaluation submitted! Total score: " + total);
  addNotification('Evaluation submitted for "' + sub.title + '". Score: ' + total, "check");
  renderResults();
  pendingEvalSubmissionId = null;
}

// =============================================================================
// DASHBOARD (all tables combined per role)
// =============================================================================
function renderDashboard() {
  if (!currentUser) return;
  // Refresh registrations from API before rendering
  apiGet('/registrations/my').then(function(regs) {
    if (Array.isArray(regs)) {
      currentUser.registeredHackathons = regs.map(function(r) { return r.hackathon_id; });
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    _renderDashboardContent();
  }).catch(function() { _renderDashboardContent(); });
}

function _renderDashboardContent() {
  if (!currentUser) return;
  document.getElementById("dashboard-title").textContent = currentUser.role + " Dashboard";
  var html = '<div class="dashboard-profile">' +
    '<div class="profile-avatar">' + currentUser.name.charAt(0).toUpperCase() + '</div>' +
    '<div><h3>' + currentUser.name + '</h3>' +
    '<p>' + currentUser.email + ' <span class="role-badge">' + currentUser.role + '</span></p>' +
    (currentUser.org ? '<p>Organization: ' + currentUser.org + '</p>' : '') +
    (currentUser.expertise ? '<p>Expertise: ' + currentUser.expertise + '</p>' : '') +
    '<p style="font-size:0.8rem;color:var(--text-muted)">Member since ' + (currentUser.created_at || "2026") + '</p>' +
    '</div></div>';

  if (currentUser.role === "User") {
    var myRegs = db_registrations.filter(function(r) { return r.user_id === currentUser.id || (currentUser.registeredHackathons && currentUser.registeredHackathons.includes(r.hackathon_id)); });
    var myHackathons = db_hackathons.filter(function(h) { return currentUser.registeredHackathons && currentUser.registeredHackathons.includes(h.id); });
    var myTeams = db_teams.filter(function(t) { return t.lead === currentUser.name; });
    var mySubs = db_submissions.filter(function(s) { return myTeams.some(function(t) { return t.id === s.team_id; }); });

    html += '<div class="dash-tabs">' +
      '<button class="dash-tab active" onclick="switchDashTab(\'registrations\', this)">My Registrations (' + myHackathons.length + ')</button>' +
      '<button class="dash-tab" onclick="switchDashTab(\'teams\', this)">My Teams (' + myTeams.length + ')</button>' +
      '<button class="dash-tab" onclick="switchDashTab(\'submissions\', this)">Submissions (' + mySubs.length + ')</button>' +
      '</div>';

    html += '<div id="dash-registrations" class="dash-panel active">' +
      (myHackathons.length === 0
        ? '<p class="empty-msg">No registrations yet. <a href="#" onclick="showPage(\'hackathons\')">Browse hackathons</a></p>'
        : '<div class="hackathon-grid">' + myHackathons.map(function(h) {
            return '<div class="hackathon-card" onclick="openHackathonDetail(' + h.id + ')">' +
              '<div class="card-header"><span class="status-badge status-' + h.status + '">' + capitalize(h.status) + '</span><span class="card-prize">' + h.prize + '</span></div>' +
              '<h3 class="card-title">' + h.title + '</h3><p class="card-theme">' + h.theme + '</p>' +
              '<div class="card-meta"><span>date ' + h.date + '</span><span>pin ' + h.location + '</span></div>' +
              (h.status === "ongoing" ? '<button class="btn-primary btn-sm" style="margin-top:0.5rem" onclick="event.stopPropagation();openSubmissionModal(' + h.id + ')">Submit Project</button>' : '') +
              '</div>';
          }).join("") + '</div>') + '</div>';

    html += '<div id="dash-teams" class="dash-panel">' +
      (myTeams.length === 0
        ? '<p class="empty-msg">No teams yet. Register for a hackathon to create a team.</p>'
        : myTeams.map(function(t) {
            var members = db_team_members.filter(function(m) { return m.team_id === t.id; });
            var hackathon = db_hackathons.find(function(h) { return h.id === t.hackathon_id; });
            return '<div class="submission-card">' +
              '<div class="sub-header"><span class="sub-title">team ' + t.name + '</span><span class="tag">' + (hackathon ? hackathon.title : "") + '</span></div>' +
              '<div class="sub-desc">Tech: ' + t.tech + '</div>' +
              '<div style="margin-top:0.5rem">' + members.map(function(m) { return '<span class="tag">' + m.user_name + ' - ' + m.role + '</span>'; }).join(" ") + '</div>' +
              '</div>';
          }).join("")) + '</div>';

    html += '<div id="dash-submissions" class="dash-panel">' +
      (mySubs.length === 0
        ? '<p class="empty-msg">No submissions yet.</p>'
        : mySubs.map(function(s) {
            var result = db_results.find(function(r) { return r.submission_id === s.id; });
            return '<div class="submission-card">' +
              '<div class="sub-header"><span class="sub-title">' + s.title + '</span>' +
              (result ? '<strong style="color:var(--primary)">' + result.total + ' pts</strong>' : '<span class="status-badge status-upcoming">Pending Review</span>') + '</div>' +
              '<div class="sub-desc">' + s.description + '</div>' +
              '<div class="card-tags"><span class="tag">' + s.tech + '</span></div>' +
              (result ? '<div style="font-size:0.82rem;color:var(--text-muted);margin-top:0.5rem;font-style:italic">"' + result.feedback + '"</div>' : '') +
              '</div>';
          }).join("")) + '</div>';

  } else if (currentUser.role === "Judge") {
    // Load submissions from API
    document.getElementById("dashboard-content").innerHTML = html +
      '<div id="dash-tabs-placeholder"></div><p style="color:var(--text-muted);padding:1rem">Loading submissions...</p>';

    apiGet('/submissions').then(function(subs) {
      if (!Array.isArray(subs)) subs = [];
      var pendingSubs = subs.filter(function(s) { return s.status !== 'evaluated'; });
      var evaluatedSubs = subs.filter(function(s) { return s.status === 'evaluated'; });

      var judgeHtml = html;
      judgeHtml += '<div class="dash-tabs">' +
        '<button class="dash-tab active" onclick="switchDashTab(\'pending-eval\', this)">Pending Evaluation (' + pendingSubs.length + ')</button>' +
        '<button class="dash-tab" onclick="switchDashTab(\'completed-eval\', this)">Completed (' + evaluatedSubs.length + ')</button>' +
        '</div>';

      judgeHtml += '<div id="dash-pending-eval" class="dash-panel active">' +
        (pendingSubs.length === 0
          ? '<p class="empty-msg">All submissions have been evaluated.</p>'
          : pendingSubs.map(function(s) {
              return '<div class="submission-card">' +
                '<div class="sub-header"><span class="sub-title">' + s.project_title + '</span><span class="status-badge status-ongoing">Needs Review</span></div>' +
                '<div class="sub-hackathon">' + (s.team_name || '') + ' — ' + (s.hackathon_title || '') + '</div>' +
                (s.github_link ? '<div class="sub-links"><a href="' + s.github_link + '" target="_blank">GitHub Repo</a></div>' : '') +
                '<button class="btn-primary btn-sm" style="margin-top:0.75rem" onclick="openEvalModalApi(' + s.submission_id + ', ' + s.hackathon_id + ', \'' + (s.project_title || '').replace(/'/g, '') + '\', \'' + (s.team_name || '').replace(/'/g, '') + '\')">Evaluate</button>' +
                '</div>';
            }).join("")) + '</div>';

      judgeHtml += '<div id="dash-completed-eval" class="dash-panel">' +
        (evaluatedSubs.length === 0
          ? '<p class="empty-msg">No evaluated submissions yet.</p>'
          : evaluatedSubs.map(function(s) {
              return '<div class="submission-card">' +
                '<div class="sub-header"><span class="sub-title">' + s.project_title + '</span><span class="status-badge status-past">Evaluated</span></div>' +
                '<div class="sub-hackathon">' + (s.team_name || '') + ' — ' + (s.hackathon_title || '') + '</div>' +
                '</div>';
            }).join("")) + '</div>';

      document.getElementById("dashboard-content").innerHTML = judgeHtml;
    }).catch(function() {
      document.getElementById("dashboard-content").innerHTML = html + '<p class="empty-msg">Could not load submissions.</p>';
    });
    return; // early return, content set async above

  } else if (currentUser.role === "Organizer") {
    var myHacks = db_hackathons.filter(function(h) { return h.organizer_id === currentUser.id; });
    var allTeams = db_teams.filter(function(t) { return myHacks.some(function(h) { return h.id === t.hackathon_id; }); });
    html += '<div class="dash-tabs">' +
      '<button class="dash-tab active" onclick="switchDashTab(\'my-hackathons\', this)">My Hackathons (' + myHacks.length + ')</button>' +
      '<button class="dash-tab" onclick="switchDashTab(\'all-teams\', this)">Registered Teams (' + allTeams.length + ')</button>' +
      '<button class="dash-tab" onclick="switchDashTab(\'announcements-tab\', this)">Announcements</button>' +
      '</div>';
    html += '<div id="dash-my-hackathons" class="dash-panel active">' +
      (myHacks.length === 0
        ? '<p class="empty-msg">No hackathons yet.</p>'
        : '<div class="hackathon-grid">' + myHacks.map(function(h) {
            var teamCount = db_teams.filter(function(t) { return t.hackathon_id === h.id; }).length;
            var subCount = db_submissions.filter(function(s) { return s.hackathon_id === h.id; }).length;
            return '<div class="hackathon-card" onclick="openHackathonDetail(' + h.id + ')">' +
              '<div class="card-header"><span class="status-badge status-' + h.status + '">' + capitalize(h.status) + '</span><span class="card-prize">' + h.prize + '</span></div>' +
              '<h3 class="card-title">' + h.title + '</h3><p class="card-theme">' + h.theme + '</p>' +
              '<div class="card-meta"><span>Teams: ' + teamCount + '</span><span>Submissions: ' + subCount + '</span></div>' +
              '</div>';
          }).join("") + '</div>') +
      '<button class="btn-primary" style="margin-top:1rem" onclick="showToast(\'Create hackathon coming soon!\', \'info\')">+ Create Hackathon</button>' +
      '</div>';
    html += '<div id="dash-all-teams" class="dash-panel">' +
      (allTeams.length === 0
        ? '<p class="empty-msg">No teams registered yet.</p>'
        : allTeams.map(function(t) {
            var members = db_team_members.filter(function(m) { return m.team_id === t.id; });
            var h = db_hackathons.find(function(x) { return x.id === t.hackathon_id; });
            return '<div class="submission-card">' +
              '<div class="sub-header"><span class="sub-title">team ' + t.name + '</span><span class="tag">' + (h ? h.title : "") + '</span></div>' +
              '<div class="sub-desc">Lead: ' + t.lead + ' | Size: ' + t.size + ' | Tech: ' + t.tech + '</div>' +
              '<div style="margin-top:0.4rem">' + members.map(function(m) { return '<span class="tag">' + m.user_name + '</span>'; }).join(" ") + '</div>' +
              '</div>';
          }).join("")) + '</div>';
    html += '<div id="dash-announcements-tab" class="dash-panel">' +
      '<button class="btn-primary" style="margin-bottom:1rem" onclick="showToast(\'Post announcement coming soon!\', \'info\')">+ Post Announcement</button>' +
      db_announcements.map(function(a) {
        return '<div class="announcement-card' + (a.pinned ? " pinned" : "") + '">' +
          '<div class="ann-header"><span class="ann-title">' + a.title + '</span><span class="ann-meta">' + a.date + '</span></div>' +
          '<div class="ann-body">' + a.body + '</div></div>';
      }).join("") + '</div>';
  }

  document.getElementById("dashboard-content").innerHTML = html;
}

function switchDashTab(tabId, btn) {
  document.querySelectorAll(".dash-tab").forEach(function(b) { b.classList.remove("active"); });
  document.querySelectorAll(".dash-panel").forEach(function(p) { p.classList.remove("active"); });
  btn.classList.add("active");
  var panel = document.getElementById("dash-" + tabId);
  if (panel) panel.classList.add("active");
}

// =============================================================================
// UTILITIES
// =============================================================================
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

function showToast(message, type) {
  if (!type) type = "success";
  var toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast toast-" + type + " show";
  setTimeout(function() { toast.classList.remove("show"); }, 3000);
}
