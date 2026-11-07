/**
 * TalentHub Database Seeder
 * Populates test database with Coordinator, Companies, Students, Jobs, Applications, Interviews & Offers.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting TalentHub Database Seeding...');

  // Clean existing database records safely in reverse order of foreign keys
  await prisma.offer.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobListing.deleteMany();
  await prisma.student.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Cleaned existing database entries.');

  const saltRounds = 10;
  const coordinatorPassword = await bcrypt.hash('Coordinator@123', saltRounds);
  const companyPassword = await bcrypt.hash('Company@123', saltRounds);
  const studentPassword = await bcrypt.hash('Student@123', saltRounds);

  // 1. Create Coordinator Account
  const coordinatorUser = await prisma.user.create({
    data: {
      email: 'coordinator@talenthub.edu',
      password: coordinatorPassword,
      role: 'COORDINATOR'
    }
  });
  console.log('✓ Created Coordinator:', coordinatorUser.email);

  // 2. Create Companies
  const googleUser = await prisma.user.create({
    data: {
      email: 'recruiter@google.com',
      password: companyPassword,
      role: 'COMPANY',
      company: {
        create: {
          companyName: 'Google Cloud & AI',
          industry: 'Information Technology & Cloud Services',
          website: 'https://cloud.google.com',
          description: 'Global technology leader specializing in search, cloud computing, and artificial intelligence.',
          contactEmail: 'recruiter@google.com',
          contactPhone: '+91 98765 43210',
          location: 'Bangalore & Hyderabad, India'
        }
      }
    },
    include: { company: true }
  });

  const msftUser = await prisma.user.create({
    data: {
      email: 'recruiter@microsoft.com',
      password: companyPassword,
      role: 'COMPANY',
      company: {
        create: {
          companyName: 'Microsoft Corporation',
          industry: 'Software & Productivity Solutions',
          website: 'https://microsoft.com',
          description: 'Empowering every person and every organization on the planet to achieve more.',
          contactEmail: 'recruiter@microsoft.com',
          contactPhone: '+91 98765 43211',
          location: 'Hyderabad, India'
        }
      }
    },
    include: { company: true }
  });

  const tcsUser = await prisma.user.create({
    data: {
      email: 'recruiter@tcs.com',
      password: companyPassword,
      role: 'COMPANY',
      company: {
        create: {
          companyName: 'Tata Consultancy Services',
          industry: 'Consulting & IT Services',
          website: 'https://tcs.com',
          description: 'A purpose-led organization that brings together the best of technology and human ingenuity.',
          contactEmail: 'recruiter@tcs.com',
          contactPhone: '+91 98765 43212',
          location: 'Pan India'
        }
      }
    },
    include: { company: true }
  });

  console.log('✓ Created 3 Company profiles.');

  // 3. Create Students
  const rahulUser = await prisma.user.create({
    data: {
      email: 'rahul@student.edu',
      password: studentPassword,
      role: 'STUDENT',
      student: {
        create: {
          fullName: 'Rahul Sharma',
          rollNumber: 'CS2023001',
          department: 'Computer Science',
          cgpa: 8.75,
          graduationYear: 2026,
          activeBacklogs: 0,
          phone: '+91 91234 56789',
          resumeUrl: 'https://example.com/resumes/rahul.pdf',
          skills: 'Node.js, Express, React, PostgreSQL, Docker, Data Structures'
        }
      }
    },
    include: { student: true }
  });

  const priyaUser = await prisma.user.create({
    data: {
      email: 'priya@student.edu',
      password: studentPassword,
      role: 'STUDENT',
      student: {
        create: {
          fullName: 'Priya Patel',
          rollNumber: 'IS2023015',
          department: 'Information Science',
          cgpa: 9.35,
          graduationYear: 2026,
          activeBacklogs: 0,
          phone: '+91 91234 56790',
          resumeUrl: 'https://example.com/resumes/priya.pdf',
          skills: 'Python, Machine Learning, React, TypeScript, GraphQL'
        }
      }
    },
    include: { student: true }
  });

  const amitUser = await prisma.user.create({
    data: {
      email: 'amit@student.edu',
      password: studentPassword,
      role: 'STUDENT',
      student: {
        create: {
          fullName: 'Amit Kumar',
          rollNumber: 'EC2023040',
          department: 'Electronics',
          cgpa: 7.15,
          graduationYear: 2026,
          activeBacklogs: 1, // Has 1 backlog
          phone: '+91 91234 56791',
          resumeUrl: 'https://example.com/resumes/amit.pdf',
          skills: 'Embedded C, Verilog, IoT, Java, Microcontrollers'
        }
      }
    },
    include: { student: true }
  });

  const snehaUser = await prisma.user.create({
    data: {
      email: 'sneha@student.edu',
      password: studentPassword,
      role: 'STUDENT',
      student: {
        create: {
          fullName: 'Sneha Reddy',
          rollNumber: 'ME2023022',
          department: 'Mechanical',
          cgpa: 6.45,
          graduationYear: 2026,
          activeBacklogs: 0,
          phone: '+91 91234 56792',
          resumeUrl: 'https://example.com/resumes/sneha.pdf',
          skills: 'AutoCAD, SolidWorks, MATLAB, Finite Element Analysis'
        }
      }
    },
    include: { student: true }
  });

  const vikramUser = await prisma.user.create({
    data: {
      email: 'vikram@student.edu',
      password: studentPassword,
      role: 'STUDENT',
      student: {
        create: {
          fullName: 'Vikram Singh',
          rollNumber: 'CS2023055',
          department: 'Computer Science',
          cgpa: 8.20,
          graduationYear: 2026,
          activeBacklogs: 0,
          phone: '+91 91234 56793',
          resumeUrl: 'https://example.com/resumes/vikram.pdf',
          skills: 'Java, Spring Boot, Microservices, Kubernetes'
        }
      }
    },
    include: { student: true }
  });

  console.log('✓ Created 5 Student profiles.');

  // 4. Create Job Listings
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30); // 30 days in future

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 10); // 10 days in past

  const googleSdeJob = await prisma.jobListing.create({
    data: {
      companyId: googleUser.company.id,
      title: 'Software Development Engineer - Campus Graduate',
      description: 'Join the Google Cloud core infrastructure team to build highly scalable backend distributed systems. Strong problem-solving, algorithms, and system design aptitude expected.',
      roleType: 'Full-time',
      packageCtc: 24.5,
      location: 'Bangalore, India',
      minCgpa: 8.0,
      allowedDepartments: 'Computer Science,Information Science',
      maxBacklogs: 0,
      deadline: futureDate,
      status: 'OPEN'
    }
  });

  const msftCloudJob = await prisma.jobListing.create({
    data: {
      companyId: msftUser.company.id,
      title: 'Cloud Solutions Associate',
      description: 'Work with enterprise clients to design, implement, and maintain Azure cloud architectures. Collaborate with engineering and support teams to resolve complex technical challenges.',
      roleType: 'Full-time',
      packageCtc: 16.0,
      location: 'Hyderabad, India',
      minCgpa: 7.0,
      allowedDepartments: 'Computer Science,Information Science,Electronics',
      maxBacklogs: 0,
      deadline: futureDate,
      status: 'OPEN'
    }
  });

  const tcsSystemJob = await prisma.jobListing.create({
    data: {
      companyId: tcsUser.company.id,
      title: 'Assistant Systems Engineer (Digital)',
      description: 'Deliver cutting-edge software solutions across diverse enterprise sectors including banking, healthcare, and retail. Training provided in full-stack engineering and cloud.',
      roleType: 'Full-time',
      packageCtc: 7.5,
      location: 'Pan India (Flexible)',
      minCgpa: 6.0,
      allowedDepartments: 'Computer Science,Information Science,Electronics,Mechanical',
      maxBacklogs: 1, // Allows 1 backlog
      deadline: futureDate,
      status: 'OPEN'
    }
  });

  const expiredJob = await prisma.jobListing.create({
    data: {
      companyId: msftUser.company.id,
      title: 'DevOps & Reliability Intern (Past Season)',
      description: 'Archived job listing from earlier recruitment cycle.',
      roleType: 'Internship',
      packageCtc: 8.0,
      location: 'Bangalore',
      minCgpa: 7.0,
      allowedDepartments: 'Computer Science,Information Science',
      maxBacklogs: 0,
      deadline: pastDate,
      status: 'CLOSED'
    }
  });

  console.log('✓ Created 4 Job Listings (3 Active, 1 Closed/Expired).');

  // 5. Create Applications & Status Flow
  // Application 1: Rahul -> Google SDE (SHORTLISTED)
  const app1 = await prisma.application.create({
    data: {
      studentId: rahulUser.student.id,
      jobId: googleSdeJob.id,
      status: 'SHORTLISTED',
      remarks: 'Strong resume and GitHub project profile. Cleared initial screening.'
    }
  });

  // Application 2: Rahul -> Microsoft Cloud (INTERVIEW)
  const app2 = await prisma.application.create({
    data: {
      studentId: rahulUser.student.id,
      jobId: msftCloudJob.id,
      status: 'INTERVIEW',
      remarks: 'Technical screening passed. Scheduled for technical interview.'
    }
  });

  // Schedule Interview for Rahul at Microsoft
  const interviewDate = new Date();
  interviewDate.setDate(interviewDate.getDate() + 3);
  await prisma.interview.create({
    data: {
      applicationId: app2.id,
      roundName: 'Round 1: Cloud & Networking Fundamentals',
      scheduledDate: interviewDate,
      mode: 'ONLINE',
      venueOrLink: 'https://teams.microsoft.com/l/meetup-join/talenthub-msft-interview',
      status: 'SCHEDULED'
    }
  });

  // Application 3: Priya -> Google SDE (OFFERED)
  const app3 = await prisma.application.create({
    data: {
      studentId: priyaUser.student.id,
      jobId: googleSdeJob.id,
      status: 'OFFERED',
      remarks: 'Outstanding performance across all technical rounds.'
    }
  });

  // Issue Offer for Priya at Google (PENDING acceptance)
  const offerDeadline = new Date();
  offerDeadline.setDate(offerDeadline.getDate() + 7);
  await prisma.offer.create({
    data: {
      applicationId: app3.id,
      ctc: 24.5,
      designation: 'Software Development Engineer I',
      joiningDate: new Date('2026-08-01'),
      offerLetterUrl: 'https://example.com/offers/google-priya-sde.pdf',
      deadline: offerDeadline,
      status: 'PENDING',
      remarks: 'Welcome to Google! Please review the terms and respond by deadline.'
    }
  });

  // Application 4: Vikram -> Microsoft Cloud (HIRED - Offer Accepted)
  const app4 = await prisma.application.create({
    data: {
      studentId: vikramUser.student.id,
      jobId: msftCloudJob.id,
      status: 'HIRED',
      remarks: 'Offer accepted by candidate. Onboarding initiated.'
    }
  });

  await prisma.offer.create({
    data: {
      applicationId: app4.id,
      ctc: 16.0,
      designation: 'Cloud Solutions Associate',
      joiningDate: new Date('2026-07-15'),
      offerLetterUrl: 'https://example.com/offers/msft-vikram.pdf',
      deadline: offerDeadline,
      status: 'ACCEPTED',
      responseDate: new Date(),
      remarks: 'Offer accepted.'
    }
  });

  // Application 5: Amit -> TCS Systems Engineer (APPLIED)
  await prisma.application.create({
    data: {
      studentId: amitUser.student.id,
      jobId: tcsSystemJob.id,
      status: 'APPLIED',
      remarks: 'Candidate applied for Digital track.'
    }
  });

  // Application 6: Sneha -> TCS Systems Engineer (APPLIED)
  await prisma.application.create({
    data: {
      studentId: snehaUser.student.id,
      jobId: tcsSystemJob.id,
      status: 'APPLIED',
      remarks: 'Mechanical graduate applying for IT systems track.'
    }
  });

  console.log('✓ Created Applications across multiple statuses with Interviews and Offers.');
  console.log('🎉 Database seeding completed successfully!');
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('Seeding error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedDatabase: main };
