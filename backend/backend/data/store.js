// In-memory data store — simulates all DB tables
// All IDs are auto-incremented via the nextId counters

const store = {

  // ── TABLE: users ────────────────────────────────────────────────────────────
  users: [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', role: 'User',      org: null,            expertise: null,          created_at: '2026-01-10' },
    { id: 2, name: 'Bob Smith',     email: 'bob@example.com',   password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', role: 'Judge',     org: null,            expertise: 'AI & ML',     created_at: '2026-01-12' },
    { id: 3, name: 'Carol White',   email: 'carol@example.com', password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', role: 'Organizer', org: 'TechCorp Inc.', expertise: null,          created_at: '2026-01-15' },
  ],
  // password for all seed users is: "password"

  // ── TABLE: hackathons ────────────────────────────────────────────────────────
  hackathons: [
    { id: 1, title: 'AI Innovation Challenge', theme: 'Artificial Intelligence', date_start: '2026-06-15', date_end: '2026-06-17', location: 'Online',            prize: '$10,000', status: 'upcoming', participants: 320, tags: ['AI','ML','Python'],       description: 'Build AI-powered solutions that address real-world problems.', organizer_id: 3, created_at: '2026-05-01' },
    { id: 2, title: 'GreenTech Hackathon',     theme: 'Sustainability',          date_start: '2026-05-20', date_end: '2026-05-22', location: 'New York, USA',     prize: '$8,000',  status: 'ongoing',  participants: 210, tags: ['CleanTech','IoT','Web'],  description: 'Create tech solutions for climate change and sustainability.',  organizer_id: 3, created_at: '2026-04-15' },
    { id: 3, title: 'HealthHack 2026',         theme: 'Healthcare',              date_start: '2026-04-10', date_end: '2026-04-12', location: 'San Francisco, USA', prize: '$15,000', status: 'past',     participants: 450, tags: ['Health','Data','Mobile'], description: 'Innovate in digital health, telemedicine, and patient care.',  organizer_id: 3, created_at: '2026-03-01' },
    { id: 4, title: 'FinTech Frontier',        theme: 'Finance & Blockchain',    date_start: '2026-07-05', date_end: '2026-07-07', location: 'London, UK',        prize: '$20,000', status: 'upcoming', participants: 180, tags: ['Blockchain','Finance'],   description: 'Reimagine financial services with blockchain and DeFi.',        organizer_id: 3, created_at: '2026-05-10' },
    { id: 5, title: 'EduTech Sprint',          theme: 'Education',               date_start: '2026-05-28', date_end: '2026-05-30', location: 'Online',            prize: '$5,000',  status: 'upcoming', participants: 95,  tags: ['EdTech','UX','React'],   description: 'Design tools that make learning more accessible.',             organizer_id: 3, created_at: '2026-05-05' },
    { id: 6, title: 'CyberShield CTF',         theme: 'Cybersecurity',           date_start: '2026-03-01', date_end: '2026-03-03', location: 'Berlin, Germany',   prize: '$12,000', status: 'past',     participants: 275, tags: ['Security','CTF'],        description: 'Capture the flag competition for ethical hacking.',            organizer_id: 3, created_at: '2026-02-01' },
  ],

  // ── TABLE: teams ─────────────────────────────────────────────────────────────
  teams: [
    { id: 1, hackathon_id: 3, name: 'NeuralNinjas', lead_user_id: 1, tech: 'Python, TensorFlow, React', created_at: '2026-03-01' },
    { id: 2, hackathon_id: 3, name: 'GreenBytes',   lead_user_id: 1, tech: 'Node.js, IoT, MongoDB',     created_at: '2026-03-02' },
    { id: 3, hackathon_id: 3, name: 'HealthFirst',  lead_user_id: 1, tech: 'Flutter, Firebase, ML',     created_at: '2026-03-03' },
    { id: 4, hackathon_id: 6, name: 'CipherCrew',   lead_user_id: 1, tech: 'Python, Kali Linux',        created_at: '2026-02-10' },
    { id: 5, hackathon_id: 6, name: 'ByteBreakers', lead_user_id: 1, tech: 'C++, Wireshark',            created_at: '2026-02-11' },
  ],

  // ── TABLE: team_members ───────────────────────────────────────────────────────
  team_members: [
    { id: 1, team_id: 1, user_name: 'Alice Johnson', role: 'Team Lead' },
    { id: 2, team_id: 1, user_name: 'Tom Brown',     role: 'Backend Dev' },
    { id: 3, team_id: 1, user_name: 'Lisa Park',     role: 'ML Engineer' },
    { id: 4, team_id: 1, user_name: 'James Wu',      role: 'Frontend Dev' },
    { id: 5, team_id: 2, user_name: 'David Lee',     role: 'Team Lead' },
    { id: 6, team_id: 2, user_name: 'Emma Davis',    role: 'IoT Specialist' },
    { id: 7, team_id: 3, user_name: 'Sara Kim',      role: 'Team Lead' },
    { id: 8, team_id: 4, user_name: 'Mike Chen',     role: 'Team Lead' },
    { id: 9, team_id: 5, user_name: 'Priya Nair',    role: 'Team Lead' },
  ],

  // ── TABLE: registrations ─────────────────────────────────────────────────────
  registrations: [
    { id: 1, user_id: 1, hackathon_id: 3, team_id: 1, status: 'confirmed', registered_at: '2026-03-01' },
    { id: 2, user_id: 1, hackathon_id: 6, team_id: 4, status: 'confirmed', registered_at: '2026-02-10' },
  ],

  // ── TABLE: submissions ────────────────────────────────────────────────────────
  submissions: [
    { id: 1, team_id: 1, hackathon_id: 3, title: 'MediScan AI',    description: 'AI-powered diagnostic tool for early disease detection using medical imaging.', repo_url: 'https://github.com/neuralninja/mediscan',       demo_url: 'https://mediscan.demo.com', tech: 'Python, TensorFlow, React', status: 'evaluated', submitted_at: '2026-04-12' },
    { id: 2, team_id: 2, hackathon_id: 3, title: 'EcoTrack',       description: 'Real-time environmental monitoring platform using IoT sensors.',               repo_url: 'https://github.com/greenbytes/ecotrack',         demo_url: '',                          tech: 'Node.js, MQTT, MongoDB',    status: 'evaluated', submitted_at: '2026-04-12' },
    { id: 3, team_id: 3, hackathon_id: 3, title: 'PatientBridge',  description: 'Telemedicine app connecting rural patients with urban specialists.',           repo_url: 'https://github.com/healthfirst/patientbridge',   demo_url: 'https://patientbridge.app', tech: 'Flutter, Firebase',         status: 'evaluated', submitted_at: '2026-04-12' },
    { id: 4, team_id: 4, hackathon_id: 6, title: 'VaultBreaker',   description: 'Advanced CTF challenge solver with automated exploit generation.',             repo_url: 'https://github.com/ciphercrew/vaultbreaker',     demo_url: '',                          tech: 'Python, Metasploit',        status: 'evaluated', submitted_at: '2026-03-03' },
    { id: 5, team_id: 5, hackathon_id: 6, title: 'NetSentinel',    description: 'Network intrusion detection system with real-time alerting.',                  repo_url: 'https://github.com/bytebreakers/netsentinel',    demo_url: '',                          tech: 'C++, Wireshark',            status: 'evaluated', submitted_at: '2026-03-03' },
  ],

  // ── TABLE: evaluation_criteria ────────────────────────────────────────────────
  evaluation_criteria: [
    { id: 1, hackathon_id: 3, name: 'Innovation',       description: 'How novel and creative is the solution?',       max_score: 10 },
    { id: 2, hackathon_id: 3, name: 'Technical Depth',  description: 'Quality and complexity of the implementation.', max_score: 10 },
    { id: 3, hackathon_id: 3, name: 'Impact',           description: 'Potential real-world impact of the solution.',  max_score: 10 },
    { id: 4, hackathon_id: 3, name: 'Presentation',     description: 'Clarity of demo and documentation.',           max_score: 10 },
    { id: 5, hackathon_id: 6, name: 'Exploit Quality',  description: 'Sophistication of the exploit technique.',     max_score: 10 },
    { id: 6, hackathon_id: 6, name: 'Defense Strategy', description: 'Quality of defensive countermeasures.',        max_score: 10 },
    { id: 7, hackathon_id: 6, name: 'Documentation',    description: 'Write-up quality and reproducibility.',        max_score: 10 },
  ],

  // ── TABLE: results ────────────────────────────────────────────────────────────
  results: [
    { id: 1, submission_id: 1, judge_id: 2, scores: { Innovation: 9, 'Technical Depth': 8, Impact: 9, Presentation: 8 }, total: 34, feedback: 'Excellent use of ML for diagnostics. Very impactful.' },
    { id: 2, submission_id: 2, judge_id: 2, scores: { Innovation: 7, 'Technical Depth': 8, Impact: 8, Presentation: 7 }, total: 30, feedback: 'Solid IoT implementation. Good real-world applicability.' },
    { id: 3, submission_id: 3, judge_id: 2, scores: { Innovation: 8, 'Technical Depth': 7, Impact: 9, Presentation: 8 }, total: 32, feedback: 'Great social impact. UI could be more polished.' },
    { id: 4, submission_id: 4, judge_id: 2, scores: { 'Exploit Quality': 9, 'Defense Strategy': 8, Documentation: 9 }, total: 26, feedback: 'Impressive exploit chain. Well documented.' },
    { id: 5, submission_id: 5, judge_id: 2, scores: { 'Exploit Quality': 8, 'Defense Strategy': 9, Documentation: 8 }, total: 25, feedback: 'Strong defensive approach. Good network analysis.' },
  ],

  // ── TABLE: winners ────────────────────────────────────────────────────────────
  winners: [
    { id: 1, hackathon_id: 3, rank: 1, team_id: 1, submission_id: 1, prize: '$7,500',  medal: 'gold'   },
    { id: 2, hackathon_id: 3, rank: 2, team_id: 3, submission_id: 3, prize: '$4,500',  medal: 'silver' },
    { id: 3, hackathon_id: 3, rank: 3, team_id: 2, submission_id: 2, prize: '$3,000',  medal: 'bronze' },
    { id: 4, hackathon_id: 6, rank: 1, team_id: 4, submission_id: 4, prize: '$6,000',  medal: 'gold'   },
    { id: 5, hackathon_id: 6, rank: 2, team_id: 5, submission_id: 5, prize: '$4,000',  medal: 'silver' },
  ],

  // ── TABLE: prizes ─────────────────────────────────────────────────────────────
  prizes: [
    { id: 1, hackathon_id: 3, rank: 1, title: '1st Place', amount: '$7,500',  description: 'Winner takes all + mentorship opportunity' },
    { id: 2, hackathon_id: 3, rank: 2, title: '2nd Place', amount: '$4,500',  description: 'Runner-up prize' },
    { id: 3, hackathon_id: 3, rank: 3, title: '3rd Place', amount: '$3,000',  description: 'Third place prize' },
    { id: 4, hackathon_id: 6, rank: 1, title: '1st Place', amount: '$6,000',  description: 'CTF Champion' },
    { id: 5, hackathon_id: 6, rank: 2, title: '2nd Place', amount: '$4,000',  description: 'Runner-up' },
    { id: 6, hackathon_id: 1, rank: 1, title: '1st Place', amount: '$5,000',  description: 'Grand Prize' },
    { id: 7, hackathon_id: 1, rank: 2, title: '2nd Place', amount: '$3,000',  description: 'Runner-up' },
    { id: 8, hackathon_id: 1, rank: 3, title: '3rd Place', amount: '$2,000',  description: 'Third place' },
  ],

  // ── TABLE: announcements ──────────────────────────────────────────────────────
  announcements: [
    { id: 1, hackathon_id: 1, title: 'AI Innovation Challenge is now open!',    body: 'Registration is open. Teams of up to 5 can register. Prize pool is $10,000.',                                                    type: 'update', pinned: true,  author_id: 3, created_at: '2026-05-01' },
    { id: 2, hackathon_id: 2, title: 'GreenTech Hackathon has started!',        body: 'The GreenTech Hackathon is now live. Submissions close on May 22nd at 11:59 PM EST.',                                            type: 'alert',  pinned: true,  author_id: 3, created_at: '2026-05-20' },
    { id: 3, hackathon_id: 3, title: 'HealthHack 2026 - Results Announced',     body: 'Congratulations to NeuralNinjas for winning HealthHack 2026 with MediScan AI!',                                                  type: 'update', pinned: false, author_id: 3, created_at: '2026-04-14' },
    { id: 4, hackathon_id: 4, title: 'FinTech Frontier - Registration Open',    body: 'FinTech Frontier registration is now open. Theme focuses on DeFi and open banking.',                                             type: 'update', pinned: false, author_id: 3, created_at: '2026-05-05' },
    { id: 5, hackathon_id: 6, title: 'CyberShield CTF - Final Standings',       body: 'CipherCrew takes the top spot in CyberShield CTF 2026! Full leaderboard is now published.',                                      type: 'update', pinned: false, author_id: 3, created_at: '2026-03-05' },
    { id: 6, hackathon_id: 2, title: 'Submission Deadline Reminder',            body: 'Only 24 hours left to submit your GreenTech project. Make sure your repo is public.',                                            type: 'alert',  pinned: false, author_id: 3, created_at: '2026-05-21' },
  ],

  // ── Auto-increment counters ───────────────────────────────────────────────────
  nextId: {
    users: 4, hackathons: 7, teams: 6, team_members: 10,
    registrations: 3, submissions: 6, evaluation_criteria: 8,
    results: 6, winners: 6, prizes: 9, announcements: 7,
  },
};

// Helper: get next auto-increment ID for a table
store.getNextId = function (table) {
  return this.nextId[table]++;
};

module.exports = store;
