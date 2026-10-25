import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import { User, Job, Transaction, UserRole, Application } from "./src/types";

const JWT_SECRET = "laborlink-secret-key";

// Mock Database
const db = {
  users: [] as User[],
  jobs: [] as Job[],
  transactions: [] as Transaction[],
  applications: [] as Application[],
  messages: [] as any[],
  notifications: [] as any[],
};

// Initial Seed Data - Admin
db.users.push({
  id: "admin-1",
  email: "admin@laborlink.com",
  role: "admin",
  password: "admin123",
  profile: {
    name: "System Admin",
    phone: "9876543200",
    address: "LaborLink Central HQ",
    city: "Bangalore",
    state: "Karnataka",
    zip: "560001",
    dob: "1988-01-15",
    gender: "Other",
    nationality: "Indian",
    emergencyContact: "100",
    skills: ["System Administration", "Quality Assurance"],
    yearsOfExperience: 10,
    onboarded: true,
    lat: 12.9716,
    lng: 77.5946,
    description: "LaborLink platform administrator overseeing user safety, job approvals, and payment verifications."
  }
});

// Initial Seed Data - Demo Worker
db.users.push({
  id: "worker-demo",
  email: "worker@laborlink.com",
  role: "worker",
  password: "worker123",
  profile: {
    name: "Ramesh Kumar",
    phone: "9876543210",
    address: "145 Koramangala 4th Block",
    city: "Bangalore",
    state: "Karnataka",
    zip: "560034",
    dob: "1994-08-20",
    gender: "Male",
    nationality: "Indian",
    emergencyContact: "9876543211",
    skills: ["Electrical", "Plumbing", "General Labor", "AC Technician"],
    yearsOfExperience: 5,
    onboarded: true,
    lat: 12.9352,
    lng: 77.6245,
    profilePhoto: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400",
    description: "Certified residential and commercial electrician & plumber with 5+ years experience. Specialized in emergency wiring, safety audits, and fast diagnostic repairs."
  }
});

// Initial Seed Data - Demo Recruiter
db.users.push({
  id: "recruiter-demo",
  email: "recruiter@laborlink.com",
  role: "recruiter",
  password: "recruiter123",
  profile: {
    name: "Ananya Sharma",
    phone: "9887766554",
    address: "Prestige Tech Park, Outer Ring Road",
    city: "Bangalore",
    state: "Karnataka",
    zip: "560103",
    dob: "1990-03-12",
    gender: "Female",
    nationality: "Indian",
    emergencyContact: "9887766555",
    skills: ["Project Management", "Construction Supervision"],
    yearsOfExperience: 8,
    onboarded: true,
    lat: 12.9378,
    lng: 77.6912,
    profilePhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
    organizationName: "Apex BuildTech & Infra",
    organizationDescription: "Leading infrastructure and commercial contractor delivering high-spec projects across South India.",
    additionalRequirements: "Safety certification, valid ID proof, and punctual site reporting required.",
    description: "Operations & Hiring Lead at Apex BuildTech."
  }
});

// Additional Pre-seeded Workers (for recruiter Browse Workers)
db.users.push({
  id: "worker-suresh",
  email: "suresh.patel@example.com",
  role: "worker",
  password: "worker123",
  profile: {
    name: "Suresh Patel",
    phone: "9811122233",
    address: "78 Indiranagar 100ft Rd",
    city: "Bangalore",
    state: "Karnataka",
    zip: "560038",
    dob: "1992-11-04",
    gender: "Male",
    nationality: "Indian",
    emergencyContact: "9811122234",
    skills: ["Painting", "Masonry", "Flooring Expert"],
    yearsOfExperience: 7,
    onboarded: true,
    lat: 12.9784,
    lng: 77.6408,
    profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    description: "Expert interior and exterior painter with 7 years experience in high-end residential painting and wall texturing."
  }
});

db.users.push({
  id: "worker-vijay",
  email: "vijay.singh@example.com",
  role: "worker",
  password: "worker123",
  profile: {
    name: "Vijay Singh",
    phone: "9822233344",
    address: "24 Andheri West",
    city: "Mumbai",
    state: "Maharashtra",
    zip: "400058",
    dob: "1996-04-18",
    gender: "Male",
    nationality: "Indian",
    emergencyContact: "9822233345",
    skills: ["Industrial Welder", "Carpentry", "Welding"],
    yearsOfExperience: 4,
    onboarded: true,
    lat: 19.1136,
    lng: 72.8697,
    profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    description: "Certified arc & TIG welder with heavy metal fabrication and on-site structural repair expertise."
  }
});

db.users.push({
  id: "worker-kavita",
  email: "kavita.rao@example.com",
  role: "worker",
  password: "worker123",
  profile: {
    name: "Kavita Rao",
    phone: "9833344455",
    address: "52 Malleshwaram 8th Cross",
    city: "Bangalore",
    state: "Karnataka",
    zip: "560003",
    dob: "1997-09-25",
    gender: "Female",
    nationality: "Indian",
    emergencyContact: "9833344456",
    skills: ["Gardening", "Cleaning", "Housekeeping", "Office Cleaning Crew"],
    yearsOfExperience: 3,
    onboarded: true,
    lat: 13.0031,
    lng: 77.5643,
    profilePhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
    description: "Professional landscape gardener and commercial maintenance specialist with attention to plant health and eco-friendly upkeep."
  }
});

const indianCities = [
  { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { name: "Delhi", lat: 28.6139, lng: 77.2090 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Vellore", lat: 12.9165, lng: 79.1325 }
];

const mockSkills = ["Plumbing", "Electrical", "Painting", "Carpentry", "Masonry", "Welding", "Cleaning", "Gardening", "Driving", "Security"];
const jobTitles = [
  "Senior Plumber", "Emergency Electrician", "Residential Painter", "Custom Furniture Carpenter", 
  "Bricklayer for New Build", "Industrial Welder", "Office Cleaning Crew", "Landscape Gardener", 
  "Delivery Driver", "Night Security Guard", "Kitchen Fitter", "Roofing Specialist", 
  "AC Technician", "Tiler for Bathroom", "Pool Maintenance", "Fence Installer", 
  "Window Cleaner", "Pest Control Specialist", "Handyman for Apartment Complex", "Flooring Expert"
];

for (let i = 0; i < 60; i++) {
  const title = jobTitles[i % jobTitles.length];
  const skill = mockSkills[i % mockSkills.length];
  const city = indianCities[i % indianCities.length];
  // Assign several jobs to recruiter-demo so the recruiter portal has rich active jobs
  const recruiterId = i < 5 ? "recruiter-demo" : `recruiter-${i % 3}`;
  db.jobs.push({
    id: `job-${i}`,
    recruiterId,
    title: `${title} - ${i + 1}`,
    description: `We are looking for a skilled ${title.toLowerCase()} to join our team for a project in ${city.name}. Must have at least ${i % 5 + 1} years of experience in ${skill}.`,
    requiredSkills: [skill, "General Labor"],
    yearsOfExperienceRequired: i % 5 + 1,
    location: {
      lat: city.lat + (Math.random() - 0.5) * 0.05,
      lng: city.lng + (Math.random() - 0.5) * 0.05,
      address: `${100 + i} MG Road, ${city.name}`
    },
    salary: `₹${(20 + i) * 100}/day`,
    type: i % 3 === 0 ? 'Full-time' : i % 3 === 1 ? 'Part-time' : 'Contract',
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    adminStatus: i % 5 === 0 ? 'pending' : 'approved',
    bannerImage: `https://picsum.photos/seed/job${i}/800/400`
  });
}

// Initial Seed Data - Applications & Transactions
db.applications.push({
  id: "app-init-1",
  jobId: "job-0",
  workerId: "worker-demo",
  recruiterId: "recruiter-demo",
  status: "pending",
  createdAt: new Date(Date.now() - 86400000).toISOString()
});

db.applications.push({
  id: "app-init-2",
  jobId: "job-1",
  workerId: "worker-suresh",
  recruiterId: "recruiter-demo",
  status: "accepted",
  createdAt: new Date(Date.now() - 172800000).toISOString()
});

db.transactions.push({
  id: "tx-init-1",
  jobId: "job-0",
  workerId: "worker-demo",
  recruiterId: "recruiter-demo",
  amount: 50.00,
  status: "completed",
  timestamp: new Date(Date.now() - 86400000).toISOString(),
  type: "application_fee",
  description: "Application fee for Senior Plumber - 1"
});

db.transactions.push({
  id: "tx-init-2",
  jobId: "job-1",
  workerId: "worker-suresh",
  recruiterId: "recruiter-demo",
  amount: 50.00,
  status: "completed",
  timestamp: new Date(Date.now() - 172800000).toISOString(),
  type: "application_fee",
  description: "Application fee for Emergency Electrician - 2"
});

// Initial Seed Data - Notifications
db.notifications.push({
  id: "notif-1",
  userId: "worker-demo",
  title: "Welcome to LaborLink",
  content: "Your worker profile is active. Browse nearby jobs and apply directly.",
  timestamp: new Date(Date.now() - 90000000).toISOString(),
  isRead: false,
  type: "system"
});

db.notifications.push({
  id: "notif-2",
  userId: "recruiter-demo",
  title: "New Application Received",
  content: "Ramesh Kumar applied for Senior Plumber - 1",
  timestamp: new Date(Date.now() - 86400000).toISOString(),
  isRead: false,
  type: "application"
});

// Initial Seed Data - Messages
db.messages.push({
  id: "msg-1",
  senderId: "recruiter-demo",
  receiverId: "worker-demo",
  content: "Hello Ramesh, we reviewed your electrical experience and would like to invite you for a site interview this week.",
  timestamp: new Date(Date.now() - 43200000).toISOString(),
  isRead: false,
  senderName: "Ananya Sharma (Apex BuildTech)"
});

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(cors());

  // --- Auth Routes ---
  app.post("/api/auth/register", (req, res) => {
    const { email, password, role } = req.body;
    if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: "User already exists" });
    }
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      role,
      password,
      profile: {
        onboarded: false,
        name: "",
        phone: "",
        address: "",
        city: "Bangalore",
        state: "Karnataka",
        zip: "",
        dob: "",
        gender: "Male",
        nationality: "Indian",
        emergencyContact: "",
        skills: [],
        yearsOfExperience: 0,
        lat: 12.9716,
        lng: 77.5946,
        lastLogin: new Date().toISOString()
      }
    };
    db.users.push(newUser);
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET);
    const { password: _, ...safeUser } = newUser;
    res.json({ user: safeUser, token });
  });

  app.post("/api/auth/admin-login", (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === 'admin');
    if (!user) return res.status(401).json({ error: "Admin access denied" });
    
    if (password !== "admin123") {
      return res.status(401).json({ error: "Invalid admin password" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const userIndex = db.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) return res.status(401).json({ error: "Invalid credentials" });
    
    const user = db.users[userIndex];
    if (user.password && user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: "Your account has been suspended by an administrator." });
    }

    // Update last login
    db.users[userIndex].profile = {
      ...db.users[userIndex].profile!,
      lastLogin: new Date().toISOString()
    };

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  });

  // --- User Routes ---
  app.get("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const user = db.users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) return res.status(404).json({ error: "User not found" });
    
    db.users[userIndex].profile = { ...db.users[userIndex].profile, ...req.body, onboarded: true };
    
    // If recruiter, ensure organization fields are set
    if (db.users[userIndex].role === 'recruiter') {
      db.users[userIndex].profile = {
        ...db.users[userIndex].profile!,
        organizationName: req.body.organizationName || db.users[userIndex].profile?.organizationName,
        organizationDescription: req.body.organizationDescription || db.users[userIndex].profile?.organizationDescription,
        additionalRequirements: req.body.additionalRequirements || db.users[userIndex].profile?.additionalRequirements,
      };
    }
    
    const { password: _, ...safeUser } = db.users[userIndex];
    res.json(safeUser);
  });

  // --- Job Routes ---
  app.get("/api/jobs", (req, res) => {
    const { workerId, recruiterId, search, skill, minExperience, maxSalary, location, adminView } = req.query;
    let jobs = [...db.jobs];

    // Workers only see approved jobs
    if (!adminView && !recruiterId) {
      jobs = jobs.filter(j => j.adminStatus === 'approved');
    }

    if (recruiterId) {
      jobs = jobs.filter(j => j.recruiterId === recruiterId);
      jobs = jobs.map(j => ({
        ...j,
        applicantCount: db.applications.filter(a => a.jobId === j.id).length
      }));
    }

    if (search) {
      const s = String(search).toLowerCase();
      jobs = jobs.filter(j => j.title.toLowerCase().includes(s) || j.description.toLowerCase().includes(s));
    }

    if (skill) {
      const sk = String(skill).toLowerCase();
      jobs = jobs.filter(j => j.requiredSkills.some(s => s.toLowerCase().includes(sk)));
    }

    if (location) {
      const loc = String(location).toLowerCase();
      jobs = jobs.filter(j => j.location.address.toLowerCase().includes(loc));
    }

    if (minExperience) {
      jobs = jobs.filter(j => j.yearsOfExperienceRequired >= Number(minExperience));
    }

    if (maxSalary) {
      jobs = jobs.filter(j => {
        const salary = parseInt(j.salary.replace(/[^\d]/g, ''));
        return salary <= Number(maxSalary);
      });
    }

    if (workerId) {
      const worker = db.users.find(u => u.id === workerId);
      if (worker && worker.role === 'worker' && worker.profile) {
        jobs = jobs.map(job => {
          const hasMatchingSkill = job.requiredSkills.some(skill => 
            worker.profile?.skills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
          );
          
          const workerCity = worker.profile?.city?.toLowerCase() || '';
          const jobAddress = job.location.address?.toLowerCase() || '';
          const hasMatchingLocation = workerCity && jobAddress.includes(workerCity);

          return {
            ...job,
            status: (hasMatchingSkill || hasMatchingLocation) ? "Applicable" : "Not Applicable"
          };
        });
      }
    }
    res.json(jobs);
  });

  app.post("/api/jobs", (req, res) => {
    const job: Job = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      adminStatus: 'approved',
      ...req.body
    };
    db.jobs.push(job);
    res.json(job);
  });

  app.put("/api/jobs/:id", (req, res) => {
    const { id } = req.params;
    const index = db.jobs.findIndex(j => j.id === id);
    if (index === -1) return res.status(404).json({ error: "Job not found" });
    
    db.jobs[index] = { ...db.jobs[index], ...req.body };
    res.json(db.jobs[index]);
  });

  app.delete("/api/jobs/:id", (req, res) => {
    const { id } = req.params;
    db.jobs = db.jobs.filter(j => j.id !== id);
    db.applications = db.applications.filter(a => a.jobId !== id);
    res.json({ success: true });
  });

  // --- Recommendation Engine & Worker Stats ---
  app.get("/api/jobs/recommendations/:userId", (req, res) => {
    const { userId } = req.params;
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.profile) return res.json([]);

    const userSkills = user.profile.skills || [];
    const userExp = user.profile.yearsOfExperience || 0;

    // Advanced matching algorithm based on skills, location, and experience
    const recommended = db.jobs
      .filter(j => j.adminStatus === 'approved')
      .map(job => {
        let score = 0;
        // Skill match
        const matchingSkills = job.requiredSkills.filter(s => 
          userSkills.some(us => us.toLowerCase() === s.toLowerCase())
        );
        score += matchingSkills.length * 20;
        
        // Location match
        const userCity = user.profile?.city?.toLowerCase() || '';
        const jobAddress = job.location.address?.toLowerCase() || '';
        if (userCity && jobAddress.includes(userCity)) {
          score += 40;
        }

        // Experience match
        if (userExp >= job.yearsOfExperienceRequired) {
          score += 15;
        }

        return { ...job, recommendationScore: score };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 6);

    res.json(recommended);
  });

  app.get("/api/worker/stats/:userId", (req, res) => {
    const { userId } = req.params;
    const applications = db.applications.filter(a => a.workerId === userId);
    const activeJobs = db.jobs.filter(j => j.adminStatus === 'approved').length;
    
    res.json({
      activeJobsCount: activeJobs,
      applicationsCount: applications.length,
      profileViews: 14 // Consistent metric
    });
  });

  // --- Admin Management Routes ---
  app.put("/api/admin/jobs/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const index = db.jobs.findIndex(j => j.id === id);
    if (index === -1) return res.status(404).json({ error: "Job not found" });
    
    db.jobs[index].adminStatus = status;
    res.json(db.jobs[index]);
  });

  app.put("/api/admin/users/:id/suspend", (req, res) => {
    const { id } = req.params;
    const { suspended } = req.body;
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ error: "User not found" });
    
    db.users[index].isSuspended = suspended;
    const { password: _, ...safeUser } = db.users[index];
    res.json(safeUser);
  });

  app.post("/api/admin/users/:id/reset-password", (req, res) => {
    const { id } = req.params;
    const user = db.users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.password = "reset123";
    res.json({ message: `Password reset successfully for ${user.email}. Temporary password: reset123` });
  });

  // --- Application Routes ---
  app.get("/api/applications", (req, res) => {
    const { workerId, jobId, recruiterId } = req.query;
    let applications = [...db.applications];

    if (workerId) {
      applications = applications.filter(a => a.workerId === workerId);
      applications = applications.map(a => ({
        ...a,
        jobTitle: db.jobs.find(j => j.id === a.jobId)?.title
      }));
    }

    if (jobId) {
      applications = applications.filter(a => a.jobId === jobId);
      applications = applications.map(a => ({
        ...a,
        workerProfile: db.users.find(u => u.id === a.workerId)?.profile
      }));
    }

    if (recruiterId) {
      applications = applications.filter(a => a.recruiterId === recruiterId);
      applications = applications.map(a => ({
        ...a,
        jobTitle: db.jobs.find(j => j.id === a.jobId)?.title,
        workerProfile: db.users.find(u => u.id === a.workerId)?.profile
      }));
    }

    res.json(applications);
  });

  app.post("/api/applications", (req, res) => {
    const { jobId, workerId } = req.body;
    const job = db.jobs.find(j => j.id === jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    const existing = db.applications.find(a => a.jobId === jobId && a.workerId === workerId);
    if (existing) return res.status(400).json({ error: "Already applied" });

    const application: Application = {
      id: Math.random().toString(36).substr(2, 9),
      jobId,
      workerId,
      recruiterId: job.recruiterId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    db.applications.push(application);

    // Create transaction for application fee
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      jobId,
      workerId,
      recruiterId: job.recruiterId,
      amount: 50.00,
      status: 'completed',
      timestamp: new Date().toISOString(),
      type: 'application_fee',
      description: `Application fee for ${job.title}`
    };
    db.transactions.push(transaction);

    // Create notification for recruiter
    db.notifications.push({
      id: Math.random().toString(36).substr(2, 9),
      userId: job.recruiterId,
      title: "New Application",
      content: `A worker has applied for your job: ${job.title}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'application'
    });

    res.json(application);
  });

  app.put("/api/applications/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const index = db.applications.findIndex(a => a.id === id);
    if (index === -1) return res.status(404).json({ error: "Application not found" });
    
    db.applications[index].status = status;

    // Create notification for worker
    db.notifications.push({
      id: Math.random().toString(36).substr(2, 9),
      userId: db.applications[index].workerId,
      title: `Application ${status}`,
      content: `Your application for ${db.jobs.find(j => j.id === db.applications[index].jobId)?.title} has been ${status}.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'application'
    });

    res.json(db.applications[index]);
  });

  // --- Transaction Routes ---
  app.post("/api/transactions", (req, res) => {
    const { jobId, workerId } = req.body;
    const job = db.jobs.find(j => j.id === jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    const transaction: Transaction = {
      id: Math.random().toString(36).substring(2, 11),
      jobId,
      workerId,
      recruiterId: job.recruiterId,
      amount: 50.00,
      status: 'completed',
      timestamp: new Date().toISOString(),
      type: 'application_fee',
      description: `Application fee for ${job.title}`
    };
    db.transactions.push(transaction);
    res.json(transaction);
  });

  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === 'admin');
    if (!user) return res.status(401).json({ error: "Admin access denied" });
    if (password !== user.password) return res.status(401).json({ error: "Invalid admin password" });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  });

  app.get("/api/admin/stats", (req, res) => {
    const totalRevenue = db.transactions.reduce((acc, t) => acc + (t.amount * 2), 0);
    const acceptedJobsCount = db.applications.filter(a => a.status === 'accepted').length;
    const pendingJobsCount = db.jobs.filter(j => j.adminStatus === 'pending').length;
    
    const safeUsers = db.users.map(({ password, ...u }) => u);
    
    const metrics = {
      totalUsers: db.users.length,
      totalJobs: db.jobs.length,
      acceptedJobsCount,
      pendingJobsCount,
      totalTransactions: db.transactions.length,
      totalRevenue
    };

    res.json({
      ...metrics,
      metrics,
      recentTransactions: db.transactions.slice(-10).reverse(),
      allTransactions: db.transactions,
      allUsers: safeUsers,
      allJobs: db.jobs
    });
  });

  app.get("/api/admin/export", (req, res) => {
    const rows = [
      ["ID", "Job ID", "Worker ID", "Recruiter ID", "Amount (INR)", "Status", "Type", "Timestamp", "Description"],
      ...db.transactions.map(t => [
        t.id, t.jobId, t.workerId, t.recruiterId,
        t.amount.toFixed(2), t.status, t.type,
        t.timestamp, `"${t.description}"`
      ])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=laborlink-transactions.csv");
    res.send(csv);
  });


  // --- Messaging Routes ---
  app.get("/api/messages/:userId", (req, res) => {
    const { userId } = req.params;
    const messages = db.messages.filter(m => m.senderId === userId || m.receiverId === userId);
    res.json(messages);
  });

  app.post("/api/messages", (req, res) => {
    const { senderId, receiverId, content } = req.body;
    const sender = db.users.find(u => u.id === senderId);
    const message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
      senderName: sender?.profile?.name || sender?.email
    };
    db.messages.push(message);

    // Create notification for receiver
    db.notifications.push({
      id: Math.random().toString(36).substr(2, 9),
      userId: receiverId,
      title: "New Message",
      content: `You have a new message from ${message.senderName}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'message'
    });

    res.json(message);
  });

  // --- Notification Routes ---
  app.get("/api/notifications/:userId", (req, res) => {
    const { userId } = req.params;
    const notifications = db.notifications.filter(n => n.userId === userId);
    res.json(notifications);
  });

  app.put("/api/notifications/:id/read", (req, res) => {
    const { id } = req.params;
    const index = db.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      db.notifications[index].isRead = true;
    }
    res.json({ success: true });
  });

  // --- Recruiter Specific Routes ---
  app.get("/api/workers", (req, res) => {
    const workers = db.users
      .filter(u => u.role === 'worker' && u.profile?.onboarded)
      .map(({ password, ...u }) => u);
    res.json(workers);
  });

  app.get("/api/jobs/:id/applicants", (req, res) => {
    const { id } = req.params;
    const applications = db.applications.filter(a => a.jobId === id);
    const applicants = applications.map(a => {
      const worker = db.users.find(u => u.id === a.workerId);
      return {
        ...a,
        workerProfile: worker?.profile,
        workerEmail: worker?.email
      };
    });
    res.json(applicants);
  });

  app.get("/api/transactions/:userId", (req, res) => {
    const { userId } = req.params;
    const transactions = db.transactions.filter(t => t.workerId === userId || t.recruiterId === userId);
    res.json(transactions);
  });

  // Vite middleware for development (MUST be placed after all API routes)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LaborLink Server running on http://localhost:${PORT}`);
  });
}

startServer();
